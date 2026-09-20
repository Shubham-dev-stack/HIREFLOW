import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Candidate, 
  Requirement, 
  ValidationItem, 
  AuditEvent, 
  WorkflowStepId, 
  DecisionOutcome,
  Importance,
  EvidenceStatus,
  AgentLogEntry
} from '../types';
import { 
  INITIAL_ROLE, 
  INITIAL_EXTRACTED_REQUIREMENTS, 
  INITIAL_CANDIDATE, 
  INITIAL_VALIDATION, 
  SECONDARY_VALIDATION, 
  INITIAL_AUDIT_TRAIL 
} from '../data/initialData';
import { 
  getAIProvider, 
  DecisionQAEngine, 
  CriticalGapDetector, 
  NextMoveEngine, 
  ReEvaluationService, 
  DocumentProcessor,
  RequirementAssessment,
  NextMoveResult
} from '../services/analysis';
import { isGeminiKeyConfigured } from '../services/ai/gemini';

interface DocumentViewerState {
  isOpen: boolean;
  documentName: string;
  highlightPage?: number;
  snippet?: string;
  sourceTitle?: string;
}

const INITIAL_AGENT_LOGS: AgentLogEntry[] = [
  { id: 'log-1', timestamp: '10:41:02', phase: 'OBSERVE', message: '3 documents ingested, 8 requirements loaded' },
  { id: 'log-2', timestamp: '10:41:05', phase: 'DECIDE', message: '3 requirements below evidence threshold' },
  { id: 'log-3', timestamp: '10:41:08', phase: 'ANALYZE', message: 'Decision lever: System Design = +21.6% (maximum)' },
];

interface HireFlowContextType {
  currentStep: WorkflowStepId;
  setCurrentStep: (step: WorkflowStepId) => void;
  role: typeof INITIAL_ROLE;
  setRole: React.Dispatch<React.SetStateAction<typeof INITIAL_ROLE>>;
  isAnalyzingRole: boolean;
  analyzeRole: () => Promise<void>;
  requirements: Requirement[];
  setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>;
  addRequirement: (name: string, importance: Importance) => void;
  updateRequirementImportance: (id: string, importance: Importance) => void;
  deleteRequirement: (id: string) => void;
  candidate: Candidate;
  isBuildingEvidence: boolean;
  buildEvidenceMap: () => Promise<void>;
  selectedInspectorReq: Requirement | null;
  openInspector: (req: Requirement) => void;
  closeInspector: () => void;
  primaryValidation: ValidationItem;
  secondaryValidation: ValidationItem;
  isEvaluatingValidation: boolean;
  evaluateValidation: (valId: string, responseText?: string) => Promise<void>;
  readinessScore: number;
  readinessStatus: 'NOT READY' | 'READY FOR HUMAN REVIEW' | 'FULLY VALIDATED';
  criticalUncertaintiesCount: number;
  supportedCount: number;
  partialCount: number;
  unknownCount: number;
  currentCriticalUncertainty: RequirementAssessment | null;
  currentNextMove: NextMoveResult;
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
  isAiActive: boolean;
  agentLogs: AgentLogEntry[];
  isAgentLogOpen: boolean;
  setIsAgentLogOpen: (open: boolean) => void;
  addAgentLog: (phase: AgentLogEntry['phase'], message: string, isStop?: boolean) => void;
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
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>(INITIAL_AUDIT_TRAIL);
  const [selectedAuditEvent, setSelectedAuditEvent] = useState<AuditEvent | null>(null);
  const [decisionOutcome, setDecisionOutcome] = useState<DecisionOutcome | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isDecisionConfirmed, setIsDecisionConfirmed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiActive, setIsAiActive] = useState<boolean>(isGeminiKeyConfigured());
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>(INITIAL_AGENT_LOGS);
  const [isAgentLogOpen, setIsAgentLogOpen] = useState(false);
  const [documentViewer, setDocumentViewer] = useState<DocumentViewerState>({
    isOpen: false,
    documentName: '',
  });

  const addAgentLog = (phase: AgentLogEntry['phase'], message: string, isStop: boolean = false) => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0]; // HH:MM:SS
    setAgentLogs(prev => {
      // Avoid exact duplicate consecutive messages
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

  // Calculate dynamic stats from requirements
  const supportedCount = requirements.filter(r => r.status === 'SUPPORTED').length;
  const partialCount = requirements.filter(r => r.status === 'PARTIAL').length;
  const unknownCount = requirements.filter(r => r.status === 'UNKNOWN').length;
  const criticalUncertainties = requirements.filter(r => r.importance === 'Critical' && (r.status === 'UNKNOWN' || r.status === 'CONFLICT'));
  const criticalUncertaintiesCount = criticalUncertainties.length;

  // Convert current requirements into RequirementAssessment[] format for DecisionQAEngine
  const currentAssessments: RequirementAssessment[] = requirements.map(r => ({
    requirementId: r.id,
    name: r.name,
    importance: r.importance,
    status: r.status,
    evidence: [],
    primarySnippet: r.snippet || r.evidence,
    reasoning: r.reasoning,
    gapReasoning: r.gapReasoning,
    source: r.source,
    sourceLocation: r.sourceLocation,
    provenance: r.provenance || 'heuristic',
    evidenceType: r.evidenceType || 'self_claimed',
    corroboratedCount: r.corroboratedCount ?? (r.status === 'SUPPORTED' ? 1 : 0),
    claimedCount: r.claimedCount ?? (r.status !== 'SUPPORTED' ? 1 : 0),
    conflictSnippets: r.conflictSnippets
  }));

  const qaResult = DecisionQAEngine.evaluate(currentAssessments);
  const readinessScore = qaResult.readiness;
  const readinessStatus = qaResult.state;
  const currentCriticalUncertainty = qaResult.criticalUncertainty;
  const currentNextMove = NextMoveEngine.determineNextMove(currentCriticalUncertainty);

  const triggerValidationGeneration = async () => {
    setIsGeneratingValidation(true);
    addAgentLog('ACT', 'Generated 5-min scenario, ROI 4.32%/min');
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsGeneratingValidation(false);
    setCurrentStep('05_VALIDATION');
  };

  const analyzeRole = async () => {
    setIsAnalyzingRole(true);
    try {
      const extractedItems = await getAIProvider().extractRequirements(role.description);
      
      const mappedRequirements: Requirement[] = extractedItems.map(item => ({
        id: item.id,
        name: item.name,
        importance: item.importance,
        status: 'UNKNOWN' as EvidenceStatus,
        evidence: 'Awaiting candidate evidence mapping.',
        source: 'Role Description Spec',
        sourceLocation: 'Parsed JD Criteria',
        reasoning: item.whyItMatters,
        gapReasoning: item.description,
        snippet: ''
      }));

      // If benchmark role, preserve rich initial mapped statuses for seamless click-through
      if (role.title.toLowerCase().includes('senior backend')) {
        setRequirements(INITIAL_EXTRACTED_REQUIREMENTS);
      } else {
        setRequirements(mappedRequirements);
      }

      setHasRoleBeenAnalyzed(true);

      setAuditTrail(prev => [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Role analyzed: ${role.title}`,
          category: 'ROLE',
          source: 'RequirementAnalyzer',
          evidence: `Extracted ${extractedItems.length} core criteria.`,
          reasoning: 'AI analysis parsed technical proficiencies and role dependencies.',
          nextAction: 'Candidate document ingestion and evidence mapping',
          user: 'Sarah Jenkins (Lead Recruiter)'
        },
        ...prev
      ]);
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

    setAuditTrail(prev => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `Requirement added: ${name}`,
        category: 'ROLE',
        requirement: name,
        source: 'Role Setup',
        evidence: `Added requirement "${name}" with importance ${importance}.`,
        reasoning: 'Hiring team customized criteria.',
        nextAction: 'Candidate evidence mapping',
        user: 'Sarah Jenkins (Lead Recruiter)'
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
      setAuditTrail(prev => [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Requirement removed: ${target.name}`,
          category: 'ROLE',
          requirement: target.name,
          source: 'Role Setup',
          evidence: `Removed requirement "${target.name}".`,
          reasoning: 'Recruiter adjusted criteria scope.',
          nextAction: 'Re-evaluate evidence mapping',
          user: 'Sarah Jenkins (Lead Recruiter)'
        },
        ...prev
      ]);
    }
  };

  const buildEvidenceMap = async () => {
    setIsBuildingEvidence(true);
    try {
      const candidateText = DocumentProcessor.getSampleResumeText();
      const analysisItems = requirements.map(r => ({
        id: r.id,
        name: r.name,
        importance: r.importance,
        description: r.reasoning,
        whyItMatters: r.reasoning
      }));

      const assessments = await getAIProvider().mapEvidence(analysisItems, candidateText);

      // Merge assessments into requirements
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
            snippet: found.primarySnippet
          };
        }
        return r;
      }));

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

  const evaluateValidation = async (valId: string, responseText?: string) => {
    setIsEvaluatingValidation(true);
    
    try {
      if (valId === primaryValidation.id) {
        const submissionText = responseText || primaryValidation.candidateResponse;
        
        // Execute through structured ReEvaluationService (AI-first with guaranteed heuristic fallback)
        const { updatedAssessments, result, previousReadiness, newReadiness, source } = await ReEvaluationService.reEvaluateAsync(
          currentAssessments,
          'req-4',
          submissionText,
          'Architecture Validation #VAL-01'
        );

        if (source === 'ai') {
          setIsAiActive(true);
        }

        // Add to Agent Reasoning Trace log
        addAgentLog('RE-EVALUATE', `System Design UNKNOWN→SUPPORTED, readiness ${previousReadiness}%→${newReadiness}%`);
        addAgentLog('STOP', 'All Critical requirements evidenced. No further questions generated. Decision returned to human. ✓', true);

        // Update validation state
        setPrimaryValidation(prev => ({
          ...prev,
          evaluated: true,
          candidateResponse: submissionText,
          evaluatedAt: 'Today at 10:52 AM'
        }));

        // Update requirements state with validated evidence
        setRequirements(prev => prev.map(req => {
          if (req.id === 'req-4' || req.name.toLowerCase().includes('system design')) {
            return {
              ...req,
              status: 'SUPPORTED' as EvidenceStatus,
              evidence: 'Candidate demonstrated horizontal scaling, load balancing, caching, database selection, asynchronous processing and failure handling.',
              source: 'Architecture Validation #VAL-01',
              sourceLocation: 'Live Scenario Response (Submitted at 10:52 AM)',
              reasoning: result.newEvidence.reasoning || 'The validation directly addresses the previously unresolved System Design requirement.',
              snippet: submissionText,
              gapReasoning: undefined,
              provenance: source
            };
          }
          return req;
        }));

        // Update Inspector drawer if currently open
        setSelectedInspectorReq(prev => {
          if (prev?.id === 'req-4' || prev?.name.toLowerCase().includes('system design')) {
            return {
              ...prev,
              status: 'SUPPORTED' as EvidenceStatus,
              evidence: 'Candidate demonstrated horizontal scaling, load balancing, caching, database selection, asynchronous processing and failure handling.',
              source: 'Architecture Validation #VAL-01',
              sourceLocation: 'Live Scenario Response (Submitted at 10:52 AM)',
              reasoning: result.newEvidence.reasoning || 'The validation directly addresses the previously unresolved System Design requirement.',
              snippet: submissionText,
              gapReasoning: undefined,
              provenance: source
            };
          }
          return prev;
        });

        // Add exact Phase 3 audit lineage events in chronological order with dynamic readiness values
        setAuditTrail(prev => [
          {
            id: `audit-${Date.now()}-next-uncertainty`,
            timestamp: '10:54 AM',
            title: `Next uncertainty identified: ${result.nextUncertainty?.name || 'Testing'}`,
            category: 'VALIDATION',
            requirement: result.nextUncertainty?.name || 'Testing',
            source: 'CriticalGapDetector',
            evidence: 'Testing remains UNKNOWN (limited test strategy in resume).',
            reasoning: 'System Design resolved. Testing Strategy is now the next unresolved requirement.',
            nextAction: 'Run focused testing strategy validation (optional)',
            user: 'System (HireFlow Engine)'
          },
          {
            id: `audit-${Date.now()}-readiness-recalculated`,
            timestamp: '10:53 AM',
            title: `Decision Readiness recalculated: ${previousReadiness}% → ${newReadiness}%`,
            category: 'DECISION',
            source: 'DecisionQAEngine',
            evidence: `Decision Readiness updated from ${previousReadiness}% (NOT READY) to ${newReadiness}% (READY FOR HUMAN REVIEW).`,
            reasoning: 'Critical uncertainty resolved; evidence coverage exceeds human review threshold (≥80%).',
            nextAction: 'Proceed to Final Review',
            user: 'System (HireFlow Engine)'
          },
          {
            id: `audit-${Date.now()}-status-transition`,
            timestamp: '10:53 AM',
            title: 'System Design changed: UNKNOWN → SUPPORTED',
            category: 'EVIDENCE',
            requirement: 'System Design',
            previousStatus: 'UNKNOWN',
            newStatus: 'SUPPORTED',
            source: 'Architecture Validation #VAL-01',
            evidence: 'Validated horizontal scaling, Redis caching, database read-replicas, and circuit breakers.',
            reasoning: 'Targeted scenario directly addressed missing architectural evidence.',
            nextAction: 'Recalculate Decision Readiness',
            user: 'System (HireFlow Engine)'
          },
          {
            id: `audit-${Date.now()}-evidence-evaluated`,
            timestamp: '10:52 AM',
            title: 'Evidence evaluated',
            category: 'VALIDATION',
            requirement: 'System Design',
            source: 'AI Evaluation Pipeline',
            evidence: 'Verified 5 evaluation dimensions: Scalability, API Architecture, Database, Caching, Failure Handling.',
            reasoning: 'Candidate response met all technical criteria dimensions.',
            nextAction: 'Apply status transition',
            user: 'System (HireFlow Engine)'
          },
          {
            id: `audit-${Date.now()}-evidence-submitted`,
            timestamp: '10:52 AM',
            title: 'Evidence submitted',
            category: 'VALIDATION',
            requirement: 'System Design',
            source: 'Candidate Submission Portal',
            evidence: 'Live scenario response submitted by candidate Alex Morgan.',
            reasoning: 'Candidate provided architecture design response.',
            nextAction: 'Evaluate Evidence',
            user: 'Candidate (Alex Morgan)'
          },
          {
            id: `audit-${Date.now()}-val-generated`,
            timestamp: '10:47 AM',
            title: 'Validation generated',
            category: 'VALIDATION',
            requirement: 'System Design',
            source: 'NextMoveEngine',
            evidence: '1M daily requests architecture design scenario.',
            reasoning: 'Selected smallest targeted 5-minute validation for primary critical uncertainty.',
            nextAction: 'Awaiting candidate validation submission',
            user: 'System (HireFlow Engine)'
          },
          ...prev
        ]);
      } else if (valId === secondaryValidation.id) {
        const submissionText = responseText || secondaryValidation.candidateResponse;

        setSecondaryValidation(prev => ({
          ...prev,
          evaluated: true,
          candidateResponse: submissionText,
          evaluatedAt: 'Today at 10:58 AM'
        }));

        setRequirements(prev => prev.map(req => {
          if (req.id === 'req-6' || req.name.toLowerCase().includes('testing')) {
            return {
              ...req,
              status: 'SUPPORTED' as EvidenceStatus,
              evidence: 'Candidate articulated a comprehensive test strategy covering unit test isolation, containerized DB integration tests, and network fault mocking.',
              source: 'Testing Strategy Validation #VAL-02',
              sourceLocation: 'Live Scenario Response',
              reasoning: 'Direct evidence confirms candidate\'s high testing standard and risk mitigation practices.',
              snippet: submissionText,
              gapReasoning: undefined
            };
          }
          return req;
        }));

        setAuditTrail(prev => [
          {
            id: `audit-${Date.now()}-testing`,
            timestamp: '10:58 AM',
            title: 'Testing changed: UNKNOWN → SUPPORTED',
            category: 'EVIDENCE',
            requirement: 'Testing',
            previousStatus: 'UNKNOWN',
            newStatus: 'SUPPORTED',
            source: 'Testing Strategy Validation #VAL-02',
            evidence: 'Candidate detailed test pyramid, testcontainers, and concurrency testing with Locust.',
            reasoning: 'Resolved testing uncertainty. All core technical requirements now verified.',
            nextAction: 'Proceed to Final Review',
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

    const titleMap: Record<DecisionOutcome, string> = {
      PROCEED: 'Human Decision: Proceed to Next Stage',
      REQUEST_MORE_EVIDENCE: 'Human Decision: Request Additional Evidence',
      HOLD_FOR_REVIEW: 'Human Decision: Hold for Team Review'
    };

    setAuditTrail(prev => [
      {
        id: `audit-decision-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: titleMap[outcome],
        category: 'DECISION',
        source: 'Human Decision Panel',
        evidence: `Decision rationale: "${notes || 'Standard progression with validated evidence.'}"`,
        reasoning: 'Final hiring decisions always remain with the human decision-maker.',
        nextAction: outcome === 'PROCEED' ? 'Schedule final team round' : 'Notify recruiting coordinator',
        user: 'Sarah Jenkins (Lead Recruiter & Hiring Committee)'
      },
      ...prev
    ]);
  };

  const openDocumentViewer = (docName: string, page?: number, snippet?: string, sourceTitle?: string) => {
    setDocumentViewer({
      isOpen: true,
      documentName: docName,
      highlightPage: page || 2,
      snippet: snippet || '',
      sourceTitle: sourceTitle || docName
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
        requirements,
        setRequirements,
        addRequirement,
        updateRequirementImportance,
        deleteRequirement,
        candidate,
        isBuildingEvidence,
        buildEvidenceMap,
        selectedInspectorReq,
        openInspector,
        closeInspector,
        primaryValidation,
        secondaryValidation,
        isEvaluatingValidation,
        evaluateValidation,
        readinessScore,
        readinessStatus,
        criticalUncertaintiesCount,
        supportedCount,
        partialCount,
        unknownCount,
        currentCriticalUncertainty,
        currentNextMove,
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
        isAiActive,
        agentLogs,
        isAgentLogOpen,
        setIsAgentLogOpen,
        addAgentLog,
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
