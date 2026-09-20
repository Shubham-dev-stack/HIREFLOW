import { EvidenceStatus } from '../../types';
import { callGemini, isGeminiKeyConfigured } from '../ai/gemini';

export interface EvidenceFilterChip {
  requirementName: string;
  status: EvidenceStatus;
}

export class CandidateQueryParser {
  /**
   * Parses natural language query into structured filter chips.
   * Prefers Gemini AI if API key configured, with automatic deterministic fallback.
   */
  static async parseAsync(
    query: string,
    availableRequirements: string[]
  ): Promise<{ chips: EvidenceFilterChip[]; source: 'ai' | 'heuristic' }> {
    if (!query || !query.trim()) {
      return { chips: [], source: 'heuristic' };
    }

    // Try AI path if configured
    if (isGeminiKeyConfigured()) {
      const systemPrompt = `You are an expert evidence filter parser for a hiring decision system.
Extract competency criteria filters from the user's search query.
Available role requirements: ${JSON.stringify(availableRequirements)}
Valid evidence statuses: "SUPPORTED", "PARTIAL", "UNKNOWN", "CONFLICT"

Rules:
1. Output ONLY a valid JSON array of objects matching: [{"requirementName": string, "status": "SUPPORTED" | "PARTIAL" | "UNKNOWN" | "CONFLICT"}]
2. Every requirementName MUST strictly be one of the strings in the available role requirements list. Do NOT invent new names.
3. Common terminology mappings:
   - "supported", "verified", "passed", "strong", "proven", "has" -> "SUPPORTED"
   - "unresolved", "unknown", "missing", "unclear", "lacks", "without", "no" -> "UNKNOWN"
   - "partial", "weak", "in progress" -> "PARTIAL"
   - "conflict", "contradicting", "discrepancy" -> "CONFLICT"
4. If a requirement is not mentioned or implied, do not include it.
5. If nothing matches, return [].`;

      const fallback = CandidateQueryParser.parseDeterministic(query, availableRequirements);

      try {
        const { data, source } = await callGemini<EvidenceFilterChip[]>(
          systemPrompt,
          `Query: "${query}"`,
          fallback
        );

        if (Array.isArray(data) && data.length > 0) {
          // Validate that requirement names exist in availableRequirements
          const validChips = data.filter(chip => 
            chip && 
            typeof chip.requirementName === 'string' &&
            availableRequirements.some(req => req.toLowerCase() === chip.requirementName.toLowerCase()) &&
            ['SUPPORTED', 'PARTIAL', 'UNKNOWN', 'CONFLICT', 'HUMAN_REVIEW'].includes(chip.status)
          ).map(chip => {
            const canonical = availableRequirements.find(req => req.toLowerCase() === chip.requirementName.toLowerCase()) || chip.requirementName;
            return {
              requirementName: canonical,
              status: chip.status
            };
          });

          if (validChips.length > 0) {
            return { chips: validChips, source };
          }
        }
      } catch {
        // Fallback to deterministic on error
      }
    }

    // Deterministic keyword fallback
    return {
      chips: CandidateQueryParser.parseDeterministic(query, availableRequirements),
      source: 'heuristic'
    };
  }

  /**
   * Deterministic keyword tokenizer:
   * Matches requirement names and status descriptors with negation support.
   */
  static parseDeterministic(
    query: string,
    availableRequirements: string[]
  ): EvidenceFilterChip[] {
    if (!query || !query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const chips: EvidenceFilterChip[] = [];

    // Split on conjunctions and contrastive markers
    const clauses = lowerQuery
      .split(/\band\b|\bbut\b|\bwith\b|\bwithout\b|,|;|\./)
      .map(c => c.trim())
      .filter(Boolean);

    // If query has no clear split, treat entire string as one clause
    const searchSegments = clauses.length > 0 ? clauses : [lowerQuery];

    for (const reqName of availableRequirements) {
      const lowerReq = reqName.toLowerCase();

      // Check if requirement appears in the overall query
      if (!lowerQuery.includes(lowerReq)) {
        // Check partial word match (e.g. "python" matching "Python 3")
        const reqWords = lowerReq.split(/\s+/);
        const hasWordMatch = reqWords.some(w => w.length > 3 && lowerQuery.includes(w));
        if (!hasWordMatch) continue;
      }

      // Find the specific clause containing this requirement
      const targetClause = searchSegments.find(c => 
        c.includes(lowerReq) || lowerReq.split(/\s+/).some(w => w.length > 3 && c.includes(w))
      ) || lowerQuery;

      let detectedStatus: EvidenceStatus = 'SUPPORTED'; // default if requirement is searched for

      // Status keyword detection
      if (
        targetClause.includes('conflict') || 
        targetClause.includes('contradict') || 
        targetClause.includes('discrepancy')
      ) {
        detectedStatus = 'CONFLICT';
      } else if (
        targetClause.includes('unresolved') || 
        targetClause.includes('unknown') || 
        targetClause.includes('missing') || 
        targetClause.includes('lacks') || 
        targetClause.includes('gap') || 
        targetClause.includes('without') || 
        targetClause.includes('not verified') ||
        targetClause.includes('no ')
      ) {
        detectedStatus = 'UNKNOWN';
      } else if (
        targetClause.includes('partial') || 
        targetClause.includes('weak') || 
        targetClause.includes('incomplete')
      ) {
        detectedStatus = 'PARTIAL';
      } else if (
        targetClause.includes('supported') || 
        targetClause.includes('verified') || 
        targetClause.includes('strong') || 
        targetClause.includes('proven') || 
        targetClause.includes('passed') ||
        targetClause.includes('met')
      ) {
        detectedStatus = 'SUPPORTED';
      }

      chips.push({
        requirementName: reqName,
        status: detectedStatus
      });
    }

    // Deduplicate by requirementName
    const seen = new Set<string>();
    return chips.filter(chip => {
      if (seen.has(chip.requirementName.toLowerCase())) return false;
      seen.add(chip.requirementName.toLowerCase());
      return true;
    });
  }

  /**
   * Filters a list of candidates according to active EvidenceFilterChips (AND logic).
   */
  static filterCandidates(
    candidates: any[],
    chips: EvidenceFilterChip[]
  ): any[] {
    if (!chips || chips.length === 0) return candidates;

    return candidates.filter(candidate => {
      return chips.every(chip => {
        const req = candidate.requirements?.find(
          (r: any) => r.name.toLowerCase() === chip.requirementName.toLowerCase()
        );
        if (!req) return false;
        return req.status === chip.status;
      });
    });
  }
}
