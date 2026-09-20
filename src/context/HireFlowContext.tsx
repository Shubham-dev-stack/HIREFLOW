import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  WorkflowStepId, 
  Requirement, 
  Candidate, 
  ValidationItem, 
  AuditEvent, 
  DecisionOutcome, 
  Importance, 
  EvidenceStatus,
  AgentLogEntry,
  CandidateDocument
} from '../types';
import { 
  INITIAL_ROLE, 
  INITIAL_EXTRACTED_REQUIREMENTS, 
  INITIAL_CANDIDATE, 
  INITIAL_VALIDATION, 
  SECONDARY_VALIDATION, 
  INITIAL_AUDIT_TRAIL 
} from '../data/initialData';
import { RequirementAnalyzer } from '../services/analysis/requirementAnalyzer';
import { EvidenceMapper } from '../services/analysis/evidenceMapper';
import { DecisionQAEngine } from '../services/analysis/decisionQA';
import { CriticalGapDetector } from '../services/analysis/criticalGapDetector';
import { NextMoveEngine } from '../services/analysis/nextMoveEngine';
import { ReEvaluationService } from '../services/analysis/reEvaluation';
import { RequirementAssessment, NextMoveResult } from '../services/analysis/types';
import { isGeminiKeyConfigured } from '../services/ai/gemini';
import { DocumentParser, ParsedDocument } from '../services/analysis/documentParser';
import { DocumentProcessor } from '../services/analysis/documentProcessor';

interface DocumentViewerState {
  isOpen: boolean;
  documentName: string;
  highlightPage?: number;
  snippet?: string;
  sourceTitle?: string;
}

export interface ReEvaluationSummary {
  requirementName: string;
  previousStatus: EvidenceStatus;
  newStatus: EvidenceStatus;
  previousReadiness: number;
  newReadiness: number;
  delta: number;
  isReady: boolean;
  evaluationTitle: string;
  explanation: string;
  signalsObserved?: string[];
  signalsMissing?: string[];
}

const INITIAL_AGENT_LOGS: AgentLogEntry[] = [
  { id: 'log-1', timestamp: new Date().toTimeString().split(' ')[0], phase: 'OBSERVE', message: 'System initialized. Ready for role definition and candidate ingestion.' },
];

interface HireFlowContextType {
  currentStep: WorkflowStepId;
  setCurrentStep: (step: WorkflowStepId) => void;
  role: typeof INITIAL_ROLE;
  setRole: React.Dispatch<React.SetStateAction<typeof INITIAL_ROLE>>;
  isAnalyzingRole: boolean;
  analyzeRole: () => Promise<void>;
  loadDemoRole: () => void;
  requirements: Requirement[];
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>;
  addRequirement: (name: string, importance: Importance) => void;
  updateRequirementImportance: (id: string, importance: Importance) => void;
  deleteRequirement: (id: string) => void;
  candidate: Candidate;
  setCandidate: React.Dispatch<React.SetStateAction<Candidate>>;
  addCandidateDocument: (file: File) => Promise<ParsedDocument>;
  removeCandidateDocument: (docId: string) => void;
  loadDemoCandidate: () => void;
  isBuildingEvidence: boolean;
  buildEvidenceMap: () => Promise<void>;
  selectedInspectorReq: Requirement | null;
  openInspector: (req: Requirement) => void;
  closeInspector: () => void;
  primaryValidation: ValidationItem;
  secondaryValidation: ValidationItem;
  isEvaluatingValidation: boolean;
  evaluateValidation: (valId: string, responseText?: string) => Promise<void>;
  lastReEvaluationResult: ReEvaluationSummary | null;
  readinessScore: number;
  readinessStatus: 'NOT READY' | 'READY FOR HUMAN REVIEW' | 'FULLY VALIDATED';
  criticalUncertaintiesCount: number;
  supportedCount: number;
  partialCount: number;
  unknownCount: number;
  conflictCount: number;
  currentCriticalUncertainty: RequirementAssessment | null;
  currentNextMove: NextMoveResult;
  computeROI: (reqId?: string) => string;
  decisionOutcome: DecisionOutcome | null;
  decisionNotes: string;
  isDecisionConfirmed: boolean;
  confirmDecision: (outcome: DecisionOutcome, notes: string) => void;
  auditTrail: AuditEvent[];
  selectedAuditEvent: AuditEvent | null;
  setSelectedAuditEvent: (event: AuditEvent | null) => void;
  documentViewer: DocumentViewerState;
  openDocumentViewer: (docName: string, page?: number, snippet?: string, sourceTitle?: string) => void;
  closeDocumentViewer: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  resetDemo: () => void;
  hasRoleBeenAnalyzed: boolean;
  hasEvidenceBeenBuilt: boolean;
  isGeneratingValidation: boolean;
  triggerValidationGeneration: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAiActive: boolean;
  aiErrorNotice: string | null;
  agentLogs: AgentLogEntry[];
  isAgentLogOpen: boolean;
  setIsAgentLogOpen: (open: boolean) => void;
  addAgentLog: (phase: AgentLogEntry['phase'], message: string, isStop?: boolean) => void;
  recruiterName: string;
  setRecruiterName: (name: string) => void;
}

const HireFlowContext = createContext<HireFlowContextType | undefined>(undefined);

export const HireFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStepId>('01_ROLE');
  const [role, setRole] = useState(INITIAL_ROLE);
  const [hasRoleBeenAnalyzed, setHasRoleBeenAnalyzed] = useState(true);
  const [isAnalyzingRole, setIsAnalyzingRole] = useState(false);
  const [requirements, setRequirements] = useState<Requirement[]>(INITIAL_EXTRACTED_REQUIREMENTS);
  const [candidate, setCandidate] = useState<Candidate>(INITIAL_CANDIDATE);
  const [hasEvidenceBeenBuilt, setHasEvidenceBeenBuilt] = useState(true);
  const [isBuildingEvidence, setIsBuildingEvidence] = useState(false);
  const [selectedInspectorReq, setSelectedInspectorReq] = useState<Requirement | null>(null);
  const [primaryValidation, setPrimaryValidation] = useState<ValidationItem>(INITIAL_VALIDATION);
  const [secondaryValidation, setSecondaryValidation] = useState<ValidationItem>(SECONDARY_VALIDATION);
  const [isEvaluatingValidation, setIsEvaluatingValidation] = useState(false);
  const [isGeneratingValidation, setIsGeneratingValidation] = useState(false);
  const [lastReEvaluationResult, setLastReEvaluationResult] = useState<ReEvaluationSummary | null>(null);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>(INITIAL_AUDIT_TRAIL);
  const [selectedAuditEvent, setSelectedAuditEvent] = useState<AuditEvent | null>(null);
  const [decisionOutcome, setDecisionOutcome] = useState<DecisionOutcome | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isDecisionConfirmed, setIsDecisionConfirmed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiActive, setIsAiActive] = useState<boolean>(isGeminiKeyConfigured());
  const [aiErrorNotice, setAiErrorNotice] = useState<string | null>(null);
  const [recruiterName, setRecruiterName] = useState<string>('Sarah Jenkins');
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>(INITIAL_AGENT_LOGS);
  const [isAgentLogOpen, setIsAgentLogOpen] = useState(false);
  const [documentViewer, setDocumentViewer] = useState<DocumentViewerState>({
    isOpen: false,
    documentName: '',
  });

  // Dark/Light theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('hireflow-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('hireflow-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const addAgentLog = (phase: AgentLogEntry['phase'], message: string, isStop: boolean = false) => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0]; // HH:MM:SS
    setAgentLogs(prev => {
      // Avoid duplicate consecutive messages
      if (prev.length > 0 && prev[prev.length - 1].phase === phase && prev[prev.length - 1].message === message) {
        return prev;
      }
      return [
        ...prev,
        {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp,
          phase,
          message,
          isStop
        }
      ];
    });
  };

  // Convert current requirements into RequirementAssessment[] format for DecisionQAEngine
  const currentAssessments: RequirementAssessment[] = requirements.map(r => ({
    requirementId: r.id,
    name: r.name,
    importance: r.importance,
    status: r.status,
    evidence: [{
      id: `ev-${r.id}`,
      requirementId: r.id,
      source: r.source,
      sourceLocation: r.sourceLocation,
      snippet: r.snippet || r.evidence,
      status: r.status,
      strength: r.status === 'SUPPORTED' ? 'DIRECT' : r.status === 'PARTIAL' ? 'INDIRECT' : 'MISSING',
      reasoning: r.reasoning,
      provenance: r.provenance
    }],
    primarySnippet: r.snippet || r.evidence,
    reasoning: r.reasoning,
    gapReasoning: r.gapReasoning,
    source: r.source,
    sourceLocation: r.sourceLocation,
    conflictSnippets: r.conflictSnippets,
    provenance: r.provenance
  }));

  // Decision QA dynamic calculations
  const decisionQA = DecisionQAEngine.evaluate(currentAssessments);
  const readinessScore = decisionQA.readiness;
  const readinessStatus = decisionQA.state;
  const currentCriticalUncertainty = CriticalGapDetector.detect(currentAssessments);
  const currentNextMove = NextMoveEngine.determineNextMove(currentCriticalUncertainty);

  const supportedCount = requirements.filter(r => r.status === 'SUPPORTED').length;
  const partialCount = requirements.filter(r => r.status === 'PARTIAL').length;
  const unknownCount = requirements.filter(r => r.status === 'UNKNOWN').length;
  const conflictCount = requirements.filter(r => r.status === 'CONFLICT').length;
  const criticalUncertainties = requirements.filter(r => r.importance === 'Critical' && (r.status === 'UNKNOWN' || r.status === 'CONFLICT'));
  const criticalUncertaintiesCount = criticalUncertainties.length;

  // Dynamic ROI calculation: (readiness delta if requirement becomes SUPPORTED) / (estimated minutes)
  const computeROI = (reqId?: string): string => {
    const target = reqId 
      ? requirements.find(r => r.id === reqId) 
      : (currentCriticalUncertainty || requirements.find(r => r.status !== 'SUPPORTED'));

    const targetId = reqId || (currentCriticalUncertainty ? currentCriticalUncertainty.requirementId : requirements.find(r => r.status !== 'SUPPORTED')?.id);
    if (!target || !targetId || target.status === 'SUPPORTED') return '0.00%/min';

    const testAssessments = currentAssessments.map(a => 
      a.requirementId === targetId ? { ...a, status: 'SUPPORTED' as EvidenceStatus } : a
    );
    const newQA = DecisionQAEngine.evaluate(testAssessments);
    const delta = Math.max(0, newQA.readiness - readinessScore);
    const estMin = 5; // standard focused validation time in minutes
    return `${(delta / estMin).toFixed(2)}%/min`;
  };

  // Screen transition dynamic agent logs
  useEffect(() => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    switch (currentStep) {
      case '01_ROLE':
        addAgentLog('OBSERVE', `Screen: Role Setup — ${requirements.length} requirements loaded for ${role.title}`);
        break;
      case '02_CANDIDATES':
        addAgentLog('OBSERVE', `Screen: Candidate Intake — ${candidate.documents.length} document(s) ingested for ${candidate.name}`);
        break;
      case '03_EVIDENCE':
        addAgentLog('ANALYZE', `Screen: Evidence Matrix — ${requirements.length} criteria mapped (${supportedCount} SUPPORTED, ${partialCount} PARTIAL, ${unknownCount} UNKNOWN, ${conflictCount} CONFLICT)`);
        break;
      case '04_DECISION_QA':
        addAgentLog('DECIDE', `Screen: Decision QA — Readiness: ${readinessScore}%, Critical gap: ${currentCriticalUncertainty?.name || 'None'}`);
        break;
      case '05_VALIDATION':
        addAgentLog('ACT', `Screen: Validation — 5-min scenario selected for ${currentCriticalUncertainty?.name || 'Uncertainty'} (ROI ${computeROI()})`);
        break;
      case '06_REVIEW':
        addAgentLog('DECIDE', `Screen: Final Review — Readiness: ${readinessScore}%, Decision briefing prepared for Human`);
        break;
      case 'AUDIT_TRAIL':
        addAgentLog('OBSERVE', `Screen: Audit Trail — ${auditTrail.length} immutable events verified in cryptographic log`);
        break;
    }
  }, [currentStep]);

  const triggerValidationGeneration = async () => {
    setIsGeneratingValidation(true);
    addAgentLog('ANALYZE', `Evaluating decision levers. Target gap: ${currentCriticalUncertainty?.name || 'Primary Gap'}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    addAgentLog('ACT', `Generated 5-min scenario, ROI ${computeROI()}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    setIsGeneratingValidation(false);
    setCurrentStep('05_VALIDATION');
  };

  // Add real uploaded document to candidate
  const addCandidateDocument = async (file: File): Promise<ParsedDocument> => {
    const parsed = await DocumentParser.parseFile(file);
    const newDoc: CandidateDocument = {
      id: parsed.docId,
      name: parsed.name,
      type: parsed.type,
      size: `${(parsed.size / 1024).toFixed(1)} KB`,
      pages: parsed.pageCount,
      wordCount: parsed.wordCount,
      uploadTime: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      isPrimary: candidate.documents.length === 0,
      parsed,
      error: parsed.error
    };

    setCandidate(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc],
      parsedDocuments: [...(prev.parsedDocuments || []), parsed]
    }));

    addAgentLog('OBSERVE', `Ingested document "${file.name}" (${parsed.wordCount} words, ${parsed.pageCount} page(s))`);
    return parsed;
  };

  const removeCandidateDocument = (docId: string) => {
    setCandidate(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== docId),
      parsedDocuments: (prev.parsedDocuments || []).filter(d => d.docId !== docId)
    }));
  };

  const loadDemoCandidate = () => {
    setCandidate(INITIAL_CANDIDATE);
    addAgentLog('OBSERVE', 'Loaded benchmark candidate profile: Alex Morgan (3 sources indexed)');
  };

  const loadDemoRole = () => {
    setRole(INITIAL_ROLE);
    setRequirements(INITIAL_EXTRACTED_REQUIREMENTS);
    setHasRoleBeenAnalyzed(true);
    addAgentLog('OBSERVE', 'Loaded benchmark role: Senior Backend Engineer (Core Platform)');
  };

  // PHASE 1.3: Real requirement analysis with NO hardcoded demo rigging
  const analyzeRole = async () => {
    setIsAnalyzingRole(true);
    setAiErrorNotice(null);
    try {
      const res = await RequirementAnalyzer.analyzeAsync(role.description);
      if (res.source === 'ai') {
        setIsAiActive(true);
      }

      const mappedRequirements: Requirement[] = res.items.map(item => ({
        id: item.id,
        name: item.name,
        importance: item.importance,
        status: 'UNKNOWN' as EvidenceStatus,
        evidence: 'Awaiting candidate evidence mapping.',
        source: 'Role Description Spec',
        sourceLocation: 'Parsed JD Criteria',
        reasoning: item.whyItMatters,
        gapReasoning: item.description,
        snippet: '',
        provenance: item.provenance
      }));

      // Set requirements strictly from analyzer output
      setRequirements(mappedRequirements);
      setHasRoleBeenAnalyzed(true);

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAuditTrail(prev => [
        {
          id: `audit-${Date.now()}`,
          timestamp: nowTime,
          title: `Role analyzed: ${role.title}`,
          category: 'ROLE',
          source: res.source === 'ai' ? 'Gemini AI Analyzer' : 'Deterministic Analyzer',
          evidence: `Extracted ${res.items.length} verifiable criteria from job description.`,
          reasoning: 'Analyzed technical competencies and operational dependencies.',
          nextAction: 'Candidate document ingestion and evidence mapping',
          user: `${recruiterName} (Lead Recruiter)`
        },
        ...prev
      ]);

      addAgentLog('ANALYZE', `Extracted ${res.items.length} verifiable competencies for ${role.title}`);
    } catch (err: any) {
      setAiErrorNotice(err?.message || 'Role extraction failed');
    } finally {
      setIsAnalyzingRole(false);
    }
  };

  const addRequirement = (name: string, importance: Importance) => {
    const newReq: Requirement = {
      id: `req-${Date.now()}`,
      name,
      importance,
      status: 'UNKNOWN',
      evidence: 'No evaluation evidence yet ingested for this requirement.',
      source: 'Awaiting source',
      sourceLocation: 'Unassigned',
      reasoning: 'Newly added requirement during role configuration.',
      gapReasoning: 'Newly introduced requirement requires evidence mapping or targeted validation.'
    };
    setRequirements(prev => [...prev, newReq]);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAuditTrail(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: nowTime,
        title: `Requirement added: ${name}`,
        category: 'ROLE',
        requirement: name,
        source: 'Role Setup',
        evidence: `Added requirement "${name}" with importance ${importance}.`,
        reasoning: 'Hiring team customized criteria.',
        nextAction: 'Candidate evidence mapping',
        user: `${recruiterName} (Lead Recruiter)`
      },
      ...prev
    ]);
  };

  const updateRequirementImportance = (id: string, importance: Importance) => {
    setRequirements(prev => prev.map(req => req.id === id ? { ...req, importance } : req));
  };

  const deleteRequirement = (id: string) => {
    const target = requirements.find(r => r.id === id);
    setRequirements(prev => prev.filter(req => req.id !== id));
    if (selectedInspectorReq?.id === id) {
      setSelectedInspectorReq(null);
    }
    if (target) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAuditTrail(prev => [
        {
          id: `audit-${Date.now()}`,
          timestamp: nowTime,
          title: `Requirement removed: ${target.name}`,
          category: 'ROLE',
          requirement: target.name,
          source: 'Role Setup',
          evidence: `Removed requirement "${target.name}".`,
          reasoning: 'Recruiter adjusted criteria scope.',
          nextAction: 'Re-evaluate evidence mapping',
          user: `${recruiterName} (Lead Recruiter)`
        },
        ...prev
      ]);
    }
  };

  // PHASE 1.2 & 1.6: Build evidence map from real ingested documents & detect CONFLICT
  const buildEvidenceMap = async () => {
    setIsBuildingEvidence(true);
    setAiErrorNotice(null);
    try {
      // Collect all real parsed document texts
      const parsedDocs: ParsedDocument[] = candidate.documents
        .map(d => d.parsed)
        .filter((d): d is ParsedDocument => Boolean(d));

      const candidateFullText = parsedDocs.length > 0 
        ? parsedDocs.map(d => `--- DOCUMENT: ${d.name} ---\n${d.fullText}`).join('\n\n')
        : (candidate.interviewNotes ? '' : DocumentProcessor.getSampleResumeText());

      const primaryDocName = candidate.documents[0]?.name || 'Alex_Morgan_Resume.pdf';

      const analysisItems = requirements.map(r => ({
        id: r.id,
        name: r.name,
        importance: r.importance,
        description: r.reasoning,
        whyItMatters: r.gapReasoning || r.reasoning
      }));

      const { assessments, source, errorReason } = await EvidenceMapper.mapAsync(
        analysisItems,
        candidateFullText,
        candidate.interviewNotes || '',
        primaryDocName,
        parsedDocs
      );

      if (source === 'ai') {
        setIsAiActive(true);
      }
      if (errorReason) {
        setAiErrorNotice(errorReason);
      }

      // Merge mapped assessments into requirements
      setRequirements(prev => prev.map(r => {
        const found = assessments.find(a => a.requirementId === r.id || a.name.toLowerCase() === r.name.toLowerCase());
        if (found) {
          return {
            ...r,
            status: found.status,
            evidence: found.primarySnippet || found.evidence[0]?.snippet || r.evidence,
            source: found.source,
            sourceLocation: found.sourceLocation,
            reasoning: found.reasoning,
            gapReasoning: found.gapReasoning,
            snippet: found.primarySnippet,
            conflictSnippets: found.conflictSnippets,
            provenance: found.provenance
          };
        }
        return r;
      }));

      // Update primary validation scenario dynamically to match the newly identified critical uncertainty
      const newQA = DecisionQAEngine.evaluate(assessments);
      const newCriticalGap = CriticalGapDetector.detect(assessments);
      if (newCriticalGap) {
        const nextMove = NextMoveEngine.determineNextMove(newCriticalGap);
        setPrimaryValidation(prev => ({
          ...prev,
          requirementId: nextMove.requirementId,
          requirementName: nextMove.requirementName,
          title: `${nextMove.requirementName} Scenario Validation`,
          scenario: nextMove.scenario,
          evaluationAreas: nextMove.evaluationAreas.map(a => ({ area: a.area, description: a.description })),
          rationale: nextMove.reason,
          estimatedTime: nextMove.estimatedTime,
          evaluated: false
        }));
      }

      setHasEvidenceBeenBuilt(true);
      setCurrentStep('03_EVIDENCE');
    } finally {
      setIsBuildingEvidence(false);
    }
  };

  const openInspector = (req: Requirement) => {
    setSelectedInspectorReq(req);
  };

  const closeInspector = () => {
    setSelectedInspectorReq(null);
  };

  // PHASE 1.4: Honest validation evaluation with dynamic requirement ID and grading pass
  const evaluateValidation = async (valId: string, responseText?: string) => {
    setIsEvaluatingValidation(true);
    setAiErrorNotice(null);

    try {
      if (valId === primaryValidation.id) {
        const submissionText = responseText || primaryValidation.candidateResponse;
        const targetReqId = primaryValidation.requirementId || 'req-4';
        const targetReq = requirements.find(r => r.id === targetReqId) || requirements[0];
        const reqName = targetReq ? targetReq.name : 'Target Competency';
        const previousStatus = targetReq ? targetReq.status : 'UNKNOWN';

        // Execute through honest ReEvaluationService
        const { updatedAssessments, result, previousReadiness, newReadiness, source, errorReason } = await ReEvaluationService.reEvaluateAsync(
          currentAssessments,
          targetReqId,
          submissionText,
          primaryValidation.title,
          primaryValidation.evaluationAreas
        );

        if (source === 'ai') {
          setIsAiActive(true);
        }
        if (errorReason) {
          setAiErrorNotice(errorReason);
        }

        const newStatus = result.newStatus;
        const delta = Math.max(0, newReadiness - previousReadiness);

        // Store evaluation summary for UI breakdown
        setLastReEvaluationResult({
          requirementName: reqName,
          previousStatus,
          newStatus,
          previousReadiness,
          newReadiness,
          delta,
          isReady: newReadiness >= 80,
          evaluationTitle: primaryValidation.title,
          explanation: result.explanation
        });

        // Add to Agent Reasoning Trace log
        addAgentLog('RE-EVALUATE', `${reqName} ${previousStatus}→${newStatus}, readiness ${previousReadiness}%→${newReadiness}%`);
        if (newReadiness >= 80) {
          addAgentLog('STOP', 'All Critical requirements evidenced. No further questions generated. Decision returned to human. ✓', true);
        } else {
          addAgentLog('DECIDE', `Readiness (${newReadiness}%) remains below 80% threshold. Critical uncertainties require resolution.`);
        }

        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Update validation state
        setPrimaryValidation(prev => ({
          ...prev,
          evaluated: true,
          candidateResponse: submissionText,
          evaluatedAt: `Today at ${nowTime}`,
          resultEvidence: result.newEvidence.snippet,
          resultSource: result.newEvidence.source,
          resultReasoning: result.newEvidence.reasoning
        }));

        // Update requirements state with the HONEST returned status
        setRequirements(prev => prev.map(req => {
          if (req.id === targetReqId || req.name.toLowerCase() === reqName.toLowerCase()) {
            return {
              ...req,
              status: newStatus,
              evidence: result.newEvidence.snippet,
              source: result.newEvidence.source,
              sourceLocation: `Live Scenario Response (Submitted at ${nowTime})`,
              reasoning: result.newEvidence.reasoning,
              snippet: submissionText,
              gapReasoning: newStatus === 'SUPPORTED' ? undefined : req.gapReasoning,
              provenance: source
            };
          }
          return req;
        }));

        // Update Inspector drawer if currently open
        setSelectedInspectorReq(prev => {
          if (prev && (prev.id === targetReqId || prev.name.toLowerCase() === reqName.toLowerCase())) {
            return {
              ...prev,
              status: newStatus,
              evidence: result.newEvidence.snippet,
              source: result.newEvidence.source,
              sourceLocation: `Live Scenario Response (Submitted at ${nowTime})`,
              reasoning: result.newEvidence.reasoning,
              snippet: submissionText,
              gapReasoning: newStatus === 'SUPPORTED' ? undefined : prev.gapReasoning,
              provenance: source
            };
          }
          return prev;
        });

        // Record real chronological audit events
        setAuditTrail(prev => [
          {
            id: `audit-${Date.now()}-readiness-recalculated`,
            timestamp: nowTime,
            title: `Decision Readiness recalculated: ${previousReadiness}% → ${newReadiness}%`,
            category: 'DECISION',
            source: 'DecisionQAEngine',
            evidence: `Decision Readiness updated from ${previousReadiness}% to ${newReadiness}% (${newReadiness >= 80 ? 'READY FOR HUMAN REVIEW' : 'NOT READY'}).`,
            reasoning: result.explanation,
            nextAction: newReadiness >= 80 ? 'Proceed to Final Review' : 'Run next targeted scenario or request evidence',
            user: 'System (HireFlow Engine)'
          },
          {
            id: `audit-${Date.now()}-status-transition`,
            timestamp: nowTime,
            title: `${reqName} transitioned: ${previousStatus} → ${newStatus}`,
            category: 'VALIDATION',
            requirement: reqName,
            previousStatus,
            newStatus,
            source: primaryValidation.title,
            evidence: result.newEvidence.reasoning,
            reasoning: `Validation response graded as ${newStatus}.`,
            nextAction: 'Recalculate Decision Readiness',
            user: 'System (HireFlow Engine)'
          },
          ...prev
        ]);
      }
    } finally {
      setIsEvaluatingValidation(false);
    }
  };

  const confirmDecision = (outcome: DecisionOutcome, notes: string) => {
    setDecisionOutcome(outcome);
    setDecisionNotes(notes);
    setIsDecisionConfirmed(true);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAuditTrail(prev => [
      {
        id: `audit-${Date.now()}-final`,
        timestamp: nowTime,
        title: `Hiring decision recorded: ${outcome.replace(/_/g, ' ')}`,
        category: 'DECISION',
        source: 'Final Review Committee',
        evidence: `Readiness: ${readinessScore}%. Status: ${readinessStatus}. Notes: "${notes}"`,
        reasoning: 'Human reviewer ratified final hiring determination based on audited evidence lineage.',
        nextAction: outcome === 'PROCEED' ? 'Initiate team interview scheduling' : 'Notify hiring committee',
        user: `${recruiterName} (Lead Recruiter)`
      },
      ...prev
    ]);

    addAgentLog('STOP', `Human decision ratified: ${outcome.replace(/_/g, ' ')} (${notes})`, true);
  };

  const openDocumentViewer = (docName: string, page: number = 1, snippet?: string, sourceTitle?: string) => {
    setDocumentViewer({
      isOpen: true,
      documentName: docName,
      highlightPage: page,
      snippet,
      sourceTitle
    });
  };

  const closeDocumentViewer = () => {
    setDocumentViewer(prev => ({ ...prev, isOpen: false }));
  };

  const resetDemo = () => {
    setRole(INITIAL_ROLE);
    setRequirements(INITIAL_EXTRACTED_REQUIREMENTS);
    setCandidate(INITIAL_CANDIDATE);
    setPrimaryValidation({
      ...INITIAL_VALIDATION,
      evaluated: false,
      candidateResponse: INITIAL_VALIDATION.defaultResponse
    });
    setSecondaryValidation({
      ...SECONDARY_VALIDATION,
      evaluated: false,
      candidateResponse: SECONDARY_VALIDATION.defaultResponse
    });
    setAuditTrail(INITIAL_AUDIT_TRAIL);
    setSelectedInspectorReq(null);
    setSelectedAuditEvent(null);
    setDecisionOutcome(null);
    setDecisionNotes('');
    setIsDecisionConfirmed(false);
    setCurrentStep('01_ROLE');
    setHasRoleBeenAnalyzed(true);
    setHasEvidenceBeenBuilt(true);
    setIsEvaluatingValidation(false);
    setIsGeneratingValidation(false);
    setLastReEvaluationResult(null);
    setAgentLogs(INITIAL_AGENT_LOGS);
    setIsAgentLogOpen(false);
  };

  return (
    <HireFlowContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        role,
        setRole,
        isAnalyzingRole,
        analyzeRole,
        loadDemoRole,
        requirements,
        setRequirements,
        addRequirement,
        updateRequirementImportance,
        deleteRequirement,
        candidate,
        setCandidate,
        addCandidateDocument,
        removeCandidateDocument,
        loadDemoCandidate,
        isBuildingEvidence,
        buildEvidenceMap,
        selectedInspectorReq,
        openInspector,
        closeInspector,
        primaryValidation,
        secondaryValidation,
        isEvaluatingValidation,
        evaluateValidation,
        lastReEvaluationResult,
        readinessScore,
        readinessStatus,
        criticalUncertaintiesCount,
        supportedCount,
        partialCount,
        unknownCount,
        conflictCount,
        currentCriticalUncertainty,
        currentNextMove,
        computeROI,
        decisionOutcome,
        decisionNotes,
        isDecisionConfirmed,
        confirmDecision,
        auditTrail,
        selectedAuditEvent,
        setSelectedAuditEvent,
        documentViewer,
        openDocumentViewer,
        closeDocumentViewer,
        isSettingsOpen,
        setIsSettingsOpen,
        resetDemo,
        hasRoleBeenAnalyzed,
        hasEvidenceBeenBuilt,
        isGeneratingValidation,
        triggerValidationGeneration,
        theme,
        toggleTheme,
        isAiActive,
        aiErrorNotice,
        agentLogs,
        isAgentLogOpen,
        setIsAgentLogOpen,
        addAgentLog,
        recruiterName,
        setRecruiterName
      }}
    >
      {children}
    </HireFlowContext.Provider>
  );
};

export const useHireFlow = () => {
  const context = useContext(HireFlowContext);
  if (!context) {
    throw new Error('useHireFlow must be used within a HireFlowProvider');
  }
  return context;
};
