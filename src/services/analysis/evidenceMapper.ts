import { RequirementAnalysisItem, RequirementAssessment, EvidenceItem, EvidenceStrength } from './types';
import { StatusClassifier } from './statusClassifier';
import { EvidenceStatus, ConflictSnippet } from '../../types';
import { callGemini } from '../ai/gemini';
import { ParsedDocument, ParsedPage } from './documentParser';

const EVIDENCE_MAPPING_SYSTEM_PROMPT = `You are an evidence auditor for hiring decisions. You do NOT judge candidate quality.
You only judge whether the supplied documents contain sufficient evidence for a requirement.
Rules you must never break:
1. Absence of evidence = UNKNOWN, never a negative judgement.
2. Every status must cite a VERBATIM EXACT snippet from the source text. Do not paraphrase. No snippet = UNKNOWN.
3. Mark each snippet as self_claimed (candidate asserts it) or corroborated
   (work sample, code, interview demonstration, third-party artifact).
4. If two sources contradict each other, return CONFLICT and cite BOTH snippets.
5. PARTIAL = evidence exists but does not meet the stated evidenceStandard.
Return ONLY valid JSON:
{assessments:[{requirementId:,status:SUPPORTED|PARTIAL|UNKNOWN|CONFLICT,reasoning:,evidence:[{snippet:,source:resume|github|interview,section:,type:self_claimed|corroborated}]}]}`;

interface GeminiAssessmentItem {
  requirementId?: string;
  status?: string;
  reasoning?: string;
  evidence?: Array<{
    snippet?: string;
    source?: string;
    section?: string;
    type?: string;
  }>;
}

interface GeminiEvidenceResponse {
  assessments?: GeminiAssessmentItem[];
}

export class EvidenceMapper {
  /**
   * Helper to verify if a snippet is a verbatim substring of any document page.
   */
  static findVerbatimPage(
    snippet: string,
    parsedDocs: ParsedDocument[]
  ): { docName: string; pageNumber: number; exactSnippet: string } | null {
    if (!snippet || snippet.trim().length < 5) return null;
    const cleanSnippet = snippet.trim().toLowerCase();

    for (const doc of parsedDocs) {
      for (const page of doc.pages) {
        const cleanPage = page.text.toLowerCase();
        if (cleanPage.includes(cleanSnippet)) {
          // Find original casing in page.text
          const startIdx = cleanPage.indexOf(cleanSnippet);
          const exactSnippet = page.text.substring(startIdx, startIdx + snippet.length).trim();
          return {
            docName: doc.name,
            pageNumber: page.pageNumber,
            exactSnippet: exactSnippet || snippet
          };
        }
      }
    }
    return null;
  }

  /**
   * Asynchronously maps candidate documents to requirements using Gemini AI first,
   * falling back to the pure deterministic heuristic rules if AI is offline, fails, or hallucinates snippets.
   */
  static async mapAsync(
    requirements: RequirementAnalysisItem[],
    candidateText: string,
    interviewNotes: string = '',
    primaryDocName: string = 'Candidate_Resume.pdf',
    parsedDocuments: ParsedDocument[] = []
  ): Promise<{ assessments: RequirementAssessment[]; source: 'ai' | 'heuristic'; errorReason?: string }> {
    // Ensure we have parsed documents for verification
    const docs = parsedDocuments.length > 0 ? parsedDocuments : EvidenceMapper.synthesizeParsedDocs(candidateText, interviewNotes, primaryDocName);

    const fallbackAssessments = EvidenceMapper.map(requirements, candidateText, primaryDocName, docs).map(a => ({
      ...a,
      provenance: 'heuristic' as const,
      evidence: a.evidence.map(e => ({ ...e, provenance: 'heuristic' as const }))
    }));

    const userInput = JSON.stringify({
      requirements: requirements.map(r => ({
        id: r.id,
        name: r.name,
        importance: r.importance,
        definition: r.description,
        evidenceStandard: r.whyItMatters
      })),
      documents: docs.map(d => ({
        name: d.name,
        pages: d.pages.map(p => ({ pageNumber: p.pageNumber, text: p.text }))
      }))
    });

    const result = await callGemini<GeminiEvidenceResponse>(
      EVIDENCE_MAPPING_SYSTEM_PROMPT,
      userInput,
      { assessments: [] }
    );

    if (result.source === 'ai' && result.data?.assessments && Array.isArray(result.data.assessments) && result.data.assessments.length > 0) {
      const validStatuses: EvidenceStatus[] = ['SUPPORTED', 'PARTIAL', 'UNKNOWN', 'CONFLICT', 'HUMAN_REVIEW'];

      const aiAssessments: RequirementAssessment[] = requirements.map((req, idx) => {
        const found = result.data?.assessments?.find(
          a => a.requirementId === req.id || a.requirementId === `req-${idx + 1}` || a.requirementId === `r${idx + 1}`
        );

        if (found) {
          let st: EvidenceStatus = 'UNKNOWN';
          if (found.status && validStatuses.includes(found.status.toUpperCase() as EvidenceStatus)) {
            st = found.status.toUpperCase() as EvidenceStatus;
          }

          const rawSnippet = found.evidence?.[0]?.snippet || '';
          
          // Strict Verbatim Verification Rule:
          // Every AI-returned snippet MUST be verified as a substring of source text.
          // If verification fails, downgrade to UNKNOWN.
          let verifiedCitation = rawSnippet ? EvidenceMapper.findVerbatimPage(rawSnippet, docs) : null;

          if (!verifiedCitation && rawSnippet.length > 20) {
            // Check if partial substring matches (e.g. trimmed sentences)
            const firstSentence = rawSnippet.split(/[.?!]/)[0]?.trim();
            if (firstSentence && firstSentence.length > 15) {
              verifiedCitation = EvidenceMapper.findVerbatimPage(firstSentence, docs);
            }
          }

          if (st !== 'UNKNOWN' && !verifiedCitation) {
            // AI hallucinated a snippet not found in ingested text
            return {
              ...fallbackAssessments[idx],
              status: 'UNKNOWN' as EvidenceStatus,
              primarySnippet: 'No supporting excerpt found in documents.',
              reasoning: 'AI cited unverifiable text. Fallback to UNKNOWN status.',
              gapReasoning: 'No verified verbatim evidence found in candidate documents.',
              source: primaryDocName,
              sourceLocation: 'Unverified across records',
              provenance: 'ai' as const
            };
          }

          const resolvedDocName = verifiedCitation?.docName || primaryDocName;
          const resolvedPageNum = verifiedCitation?.pageNumber ? `Page ${verifiedCitation.pageNumber}` : 'Parsed Document';
          const verifiedSnippet = verifiedCitation?.exactSnippet || rawSnippet || 'No supporting excerpt found in documents.';

          const evList: EvidenceItem[] = [{
            id: `ev-ai-${req.id}-0`,
            requirementId: req.id,
            source: resolvedDocName,
            sourceLocation: resolvedPageNum,
            snippet: verifiedSnippet,
            status: st,
            strength: st === 'SUPPORTED' ? 'DIRECT' : st === 'PARTIAL' ? 'INDIRECT' : 'MISSING',
            reasoning: found.reasoning || `Audited evidence for ${req.name}.`,
            provenance: 'ai'
          }];

          return {
            requirementId: req.id,
            name: req.name,
            importance: req.importance,
            status: st,
            evidence: evList,
            primarySnippet: verifiedSnippet,
            reasoning: found.reasoning || `Evaluated against ${req.name} standard.`,
            gapReasoning: st !== 'SUPPORTED' ? (found.reasoning || 'Insufficient verifiable evidence.') : undefined,
            source: resolvedDocName,
            sourceLocation: resolvedPageNum,
            provenance: 'ai'
          };
        }

        // Fallback to heuristic assessment if this requirement is missing in AI response
        return fallbackAssessments[idx];
      });

      return { assessments: aiAssessments, source: 'ai' };
    }

    return { assessments: fallbackAssessments, source: 'heuristic', errorReason: result.errorReason };
  }

  /**
   * Pure deterministic heuristic evidence mapper (guaranteed fallback & verbatim locator).
   */
  static map(
    requirements: RequirementAnalysisItem[], 
    candidateText: string, 
    primaryDocName: string = 'Candidate_Resume.pdf',
    parsedDocuments?: ParsedDocument[]
  ): RequirementAssessment[] {
    const docs = parsedDocuments && parsedDocuments.length > 0 
      ? parsedDocuments 
      : EvidenceMapper.synthesizeParsedDocs(candidateText, '', primaryDocName);

    return requirements.map((req) => {
      const matchResult = EvidenceMapper.locateRequirementInDocs(req, docs);

      const evidenceItem: EvidenceItem = {
        id: `ev-${req.id}-${Date.now()}`,
        requirementId: req.id,
        source: matchResult.source,
        sourceLocation: matchResult.sourceLocation,
        snippet: matchResult.snippet,
        status: matchResult.status,
        strength: matchResult.strength,
        reasoning: matchResult.reasoning,
        gapReasoning: matchResult.gapReasoning,
        provenance: 'heuristic'
      };

      return {
        requirementId: req.id,
        name: req.name,
        importance: req.importance,
        status: matchResult.status,
        evidence: [evidenceItem],
        primarySnippet: matchResult.snippet,
        reasoning: matchResult.reasoning,
        gapReasoning: matchResult.gapReasoning,
        source: matchResult.source,
        sourceLocation: matchResult.sourceLocation,
        conflictSnippets: matchResult.conflictSnippets,
        provenance: 'heuristic'
      };
    });
  }

  /**
   * Scans parsed document pages for real sentence matches, checking for CONFLICT across multiple documents.
   */
  private static locateRequirementInDocs(
    req: RequirementAnalysisItem,
    docs: ParsedDocument[]
  ): {
    status: EvidenceStatus;
    strength: EvidenceStrength;
    snippet: string;
    source: string;
    sourceLocation: string;
    reasoning: string;
    gapReasoning?: string;
    conflictSnippets?: ConflictSnippet[];
  } {
    const termSet = EvidenceMapper.buildTermSet(req);
    const positiveMatches: Array<{
      docName: string;
      pageNumber: number;
      sentence: string;
      hasOutcomeOrMetric: boolean;
      score: number;
    }> = [];

    const contradictionMatches: Array<{
      docName: string;
      pageNumber: number;
      sentence: string;
      hasContradiction: boolean;
    }> = [];

    // Negative contradiction keywords (e.g. notes claiming lack of skill/experience)
    const negativeIndicators = [
      'no experience', 'never used', 'did not use', 'did not have', 'lacked',
      'individual contributor only', 'no leadership', 'did not lead', 'did not mentor',
      'unfamiliar with', 'only used orm', 'no sql', 'struggled with', 'failed to explain',
      'contradicts resume', 'no production experience'
    ];

    for (const doc of docs) {
      for (const page of doc.pages) {
        // Split page text into sentences
        const sentences = page.text
          .split(/(?<=[.?!;])\s+|\n+/)
          .map(s => s.trim())
          .filter(s => s.length > 10);

        for (const sentence of sentences) {
          const sentLower = sentence.toLowerCase();

          // Check if sentence matches requirement term set
          const matchedTerms = termSet.filter(term => sentLower.includes(term));
          if (matchedTerms.length === 0) continue;

          // Check if sentence is a negative contradiction
          const hasNeg = negativeIndicators.some(neg => sentLower.includes(neg));
          if (hasNeg) {
            contradictionMatches.push({
              docName: doc.name,
              pageNumber: page.pageNumber,
              sentence,
              hasContradiction: true
            });
            continue;
          }

          // Check for applied outcome, metric, or depth
          const hasActionVerb = /\b(led|built|architected|designed|implemented|optimized|scaled|managed|migrated|refactored|reduced|increased|created|delivered|instituted)\b/i.test(sentence);
          const hasMetric = /\b(\d+[\d,]*\s*(%|ms|s|endpoints|queries|services|engineers|users|requests|rps)|million|billion|p99|latency|slas?)\b/i.test(sentence);
          const hasOutcomeOrMetric = hasActionVerb && (hasMetric || sentence.length > 60);

          positiveMatches.push({
            docName: doc.name,
            pageNumber: page.pageNumber,
            sentence,
            hasOutcomeOrMetric,
            score: matchedTerms.length * 2 + (hasOutcomeOrMetric ? 3 : 1)
          });
        }
      }
    }

    // 1. MULTI-DOCUMENT CONFLICT DETECTION
    // If one document affirms the requirement while another document contains a direct contradiction
    if (positiveMatches.length > 0 && contradictionMatches.length > 0) {
      const bestPositive = positiveMatches.sort((a, b) => b.score - a.score)[0];
      const contradiction = contradictionMatches[0];

      // Only mark CONFLICT if they come from different documents or distinct sources
      if (bestPositive.docName !== contradiction.docName || docs.length > 1) {
        return {
          status: 'CONFLICT',
          strength: 'CONFLICTING',
          snippet: bestPositive.sentence,
          source: bestPositive.docName,
          sourceLocation: `Page ${bestPositive.pageNumber}`,
          reasoning: `Contradicting evidence detected across multiple documents regarding ${req.name}.`,
          gapReasoning: `Document ${bestPositive.docName} asserts competency, but ${contradiction.docName} reports contradictory observations.`,
          conflictSnippets: [
            {
              source: bestPositive.docName,
              sourceLocation: `Page ${bestPositive.pageNumber}`,
              snippet: bestPositive.sentence,
              type: 'self_claimed',
              label: `${bestPositive.docName} (Assertion)`
            },
            {
              source: contradiction.docName,
              sourceLocation: `Page ${contradiction.pageNumber}`,
              snippet: contradiction.sentence,
              type: 'corroborated',
              label: `${contradiction.docName} (Observation)`
            }
          ]
        };
      }
    }

    // 2. POSITIVE MATCHES FOUND
    if (positiveMatches.length > 0) {
      // Sort by score descending
      positiveMatches.sort((a, b) => b.score - a.score);
      const best = positiveMatches[0];

      if (best.hasOutcomeOrMetric) {
        return {
          status: 'SUPPORTED',
          strength: 'DIRECT',
          snippet: best.sentence,
          source: best.docName,
          sourceLocation: `Page ${best.pageNumber}`,
          reasoning: `Direct evidence located in ${best.docName} demonstrating applied work and verified outcomes for ${req.name}.`
        };
      } else {
        return {
          status: 'PARTIAL',
          strength: 'INDIRECT',
          snippet: best.sentence,
          source: best.docName,
          sourceLocation: `Page ${best.pageNumber}`,
          reasoning: `Partial mention located in ${best.docName}. Confirms familiarity, but lacks detailed operational scale or architecture metrics.`,
          gapReasoning: `Evidence demonstrates baseline familiarity with ${req.name}, but lacks verified depth against the evidence standard.`
        };
      }
    }

    // 3. NO EVIDENCE FOUND -> UNKNOWN
    return {
      status: 'UNKNOWN',
      strength: 'MISSING',
      snippet: 'No supporting excerpt found in documents.',
      source: docs[0]?.name || 'Candidate Documents',
      sourceLocation: 'Unverified across records',
      reasoning: `No explicit evidence located in ingested documents for ${req.name}.`,
      gapReasoning: `Absence of evidence in provided documents. Requires targeted scenario validation to evaluate.`
    };
  }

  /**
   * Builds keyword & synonym term set for a requirement.
   */
  private static buildTermSet(req: RequirementAnalysisItem): string[] {
    const nameLower = req.name.toLowerCase();
    const set = new Set<string>();

    // Add individual significant words from name
    req.name.split(/[\s,&/]+/).forEach(word => {
      const w = word.trim().toLowerCase();
      if (w.length >= 3 && !['and', 'for', 'the', 'with'].includes(w)) {
        set.add(w);
      }
    });

    if (nameLower.includes('python')) {
      ['python', 'fastapi', 'django', 'flask', 'asyncio', 'pydantic', 'sqlalchemy'].forEach(t => set.add(t));
    }
    if (nameLower.includes('sql') || nameLower.includes('database') || nameLower.includes('data model')) {
      ['sql', 'postgres', 'postgresql', 'mysql', 'database', 'schema', 'migration', 'queries', 'query', 'indexing'].forEach(t => set.add(t));
    }
    if (nameLower.includes('api') || nameLower.includes('rest')) {
      ['api', 'apis', 'rest', 'restful', 'endpoint', 'endpoints', 'graphql', 'grpc', 'openapi', 'swagger'].forEach(t => set.add(t));
    }
    if (nameLower.includes('system design') || nameLower.includes('architecture')) {
      ['system design', 'architecture', 'distributed', 'microservice', 'microservices', 'scalability', 'horizontal scale', 'load balancer', 'failover', 'caching', 'redis', 'high availability'].forEach(t => set.add(t));
    }
    if (nameLower.includes('mentor') || nameLower.includes('leadership') || nameLower.includes('collab')) {
      ['mentor', 'mentored', 'mentoring', 'team lead', 'leadership', 'coaching', 'onboarded', 'code reviews', 'rfc'].forEach(t => set.add(t));
    }
    if (nameLower.includes('testing') || nameLower.includes('quality')) {
      ['testing', 'test', 'tests', 'pytest', 'unit test', 'integration test', 'mocking', 'test pyramid', 'regression'].forEach(t => set.add(t));
    }
    if (nameLower.includes('cloud') || nameLower.includes('devops') || nameLower.includes('ci/cd')) {
      ['docker', 'kubernetes', 'aws', 'gcp', 'ci/cd', 'github actions', 'pipeline', 'terraform', 'cloud'].forEach(t => set.add(t));
    }

    return Array.from(set);
  }

  /**
   * Synthesizes ParsedDocument structures from raw text if files were not uploaded directly.
   */
  private static synthesizeParsedDocs(
    candidateText: string,
    interviewNotes: string = '',
    primaryDocName: string = 'Candidate_Resume.pdf'
  ): ParsedDocument[] {
    const docs: ParsedDocument[] = [];

    if (candidateText && candidateText.trim().length > 0) {
      const paragraphs = candidateText.split(/\n\s*\n/).filter(Boolean);
      const pages: ParsedPage[] = [];
      const parasPerPage = Math.max(1, Math.ceil(paragraphs.length / 3));

      for (let i = 0; i < 3; i++) {
        const pText = paragraphs.slice(i * parasPerPage, (i + 1) * parasPerPage).join('\n\n').trim();
        if (pText) {
          pages.push({ pageNumber: i + 1, text: pText });
        }
      }

      docs.push({
        docId: 'doc-synth-resume',
        name: primaryDocName,
        type: 'application/pdf',
        size: candidateText.length,
        pageCount: pages.length || 1,
        wordCount: candidateText.split(/\s+/).filter(Boolean).length,
        pages: pages.length > 0 ? pages : [{ pageNumber: 1, text: candidateText }],
        fullText: candidateText
      });
    }

    if (interviewNotes && interviewNotes.trim().length > 0) {
      docs.push({
        docId: 'doc-synth-notes',
        name: 'Recruiter_Screen_Interview_Notes.txt',
        type: 'text/plain',
        size: interviewNotes.length,
        pageCount: 1,
        wordCount: interviewNotes.split(/\s+/).filter(Boolean).length,
        pages: [{ pageNumber: 1, text: interviewNotes }],
        fullText: interviewNotes
      });
    }

    return docs;
  }
}
