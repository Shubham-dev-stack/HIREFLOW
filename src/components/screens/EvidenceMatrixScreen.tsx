import React, { useState, useMemo } from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { StatusBadge } from '../common/StatusBadge';
import { ImportanceBadge } from '../common/ImportanceBadge';
import { EvidenceInspectorDrawer } from './EvidenceInspectorDrawer';
import { Candidate, Requirement, EvidenceStatus } from '../../types';
import { DecisionQAEngine } from '../../services/analysis/decisionQA';
import { CandidateQueryParser, EvidenceFilterChip } from '../../services/analysis/candidateQueryParser';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  HelpCircle,
  FileText,
  Info,
  Layers,
  Sparkles,
  Search,
  X,
  LayoutGrid,
  List,
  User,
  Loader2,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Clock
} from 'lucide-react';

type CandidateGroup = 'all' | 'fully_evidenced' | 'blocked_one_gap' | 'insufficient';

interface CandidateEvaluationSummary {
  candidate: Candidate;
  readiness: number;
  criticalGapsCount: number;
  group: 'fully_evidenced' | 'blocked_one_gap' | 'insufficient';
}

export const EvidenceMatrixScreen: React.FC = () => {
  const { 
    roleRequirements,
    requirements, 
    openInspector, 
    setCurrentStep, 
    candidate,
    candidates,
    activeCandidateId,
    setActiveCandidateId,
    buildEvidenceMap,
    isBuildingEvidence,
    hasEvidenceBeenBuilt,
    supportedCount,
    partialCount,
    unknownCount
  } = useHireFlow();

  const [activeGroup, setActiveGroup] = useState<CandidateGroup>('all');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<EvidenceFilterChip[]>([]);

  // Compute evaluation summary and bucket for each candidate
  const candidateSummaries: CandidateEvaluationSummary[] = useMemo(() => {
    return candidates.map(c => {
      if (!c.hasEvidenceBeenBuilt || !c.requirements || c.requirements.length === 0) {
        const criticalCount = roleRequirements.filter(r => r.importance === 'Critical').length;
        return {
          candidate: c,
          readiness: 0,
          criticalGapsCount: criticalCount,
          group: 'insufficient'
        };
      }

      const assessments = c.requirements.map(r => ({
        requirementId: r.id,
        name: r.name,
        importance: r.importance,
        status: r.status,
        evidence: [],
        primarySnippet: r.snippet || r.evidence,
        reasoning: r.reasoning,
        source: r.source,
        sourceLocation: r.sourceLocation
      }));

      const evaluation = DecisionQAEngine.evaluate(assessments);
      const criticalGaps = c.requirements.filter(
        r => r.importance === 'Critical' && (r.status === 'UNKNOWN' || r.status === 'CONFLICT')
      );

      let group: 'fully_evidenced' | 'blocked_one_gap' | 'insufficient';
      if (evaluation.readiness >= 80 && criticalGaps.length === 0) {
        group = 'fully_evidenced';
      } else if (criticalGaps.length === 1) {
        group = 'blocked_one_gap';
      } else {
        group = 'insufficient';
      }

      return {
        candidate: c,
        readiness: evaluation.readiness,
        criticalGapsCount: criticalGaps.length,
        group
      };
    });
  }, [candidates, roleRequirements]);

  // Group counts
  const fullyEvidencedCount = candidateSummaries.filter(s => s.group === 'fully_evidenced').length;
  const blockedOneGapCount = candidateSummaries.filter(s => s.group === 'blocked_one_gap').length;
  const insufficientCount = candidateSummaries.filter(s => s.group === 'insufficient').length;

  // Filter candidates by active bucket
  const groupFilteredCandidates = useMemo(() => {
    if (activeGroup === 'all') return candidates;
    return candidateSummaries
      .filter(s => s.group === activeGroup)
      .map(s => s.candidate);
  }, [activeGroup, candidateSummaries, candidates]);

  // Apply natural language query filters
  const filteredCandidates = useMemo(() => {
    if (activeFilters.length === 0) return groupFilteredCandidates;
    return CandidateQueryParser.filterCandidates(groupFilteredCandidates, activeFilters);
  }, [groupFilteredCandidates, activeFilters]);

  // Handle Natural Language search query submit
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const parseResult = await CandidateQueryParser.parseAsync(
        searchQuery, 
        roleRequirements.map(r => r.name)
      );
      if (parseResult.chips.length > 0) {
        setActiveFilters(prev => {
          const combined = [...prev, ...parseResult.chips];
          return combined.filter((f, idx, arr) => 
            arr.findIndex(o => o.requirementName.toLowerCase() === f.requirementName.toLowerCase() && o.status === f.status) === idx
          );
        });
        setSearchQuery('');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const removeFilter = (indexToRemove: number) => {
    setActiveFilters(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchQuery('');
  };

  const handleCellClick = (c: Candidate, req: Requirement) => {
    if (c.id !== activeCandidateId) {
      setActiveCandidateId(c.id);
    }
    const candidateReq = c.requirements?.find(r => r.id === req.id) || req;
    openInspector(candidateReq);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-8 space-y-8 animate-fade-in relative text-slate-900 dark:text-[#F1F5F9]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#2D3748]">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            03 • Evidence Coverage & Candidate Pool
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight font-display">
            What do we actually know?
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 leading-relaxed">
            Multi-candidate cross-referenced evidence matrix and competency verification across target role requirements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/80 dark:border-[#2D3748] text-xs font-mono">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-[#1A1F2E] text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Multi-candidate comparison matrix"
            >
              <LayoutGrid size={13} />
              <span>Matrix Grid</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-[#1A1F2E] text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Detailed candidate cards view"
            >
              <List size={13} />
              <span>Detail Cards</span>
            </button>
          </div>

          <button
            onClick={() => setCurrentStep('04_DECISION_QA')}
            className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <span>Continue to Decision QA</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* USER ADDITION 1: Empty state for active candidate if evidence unbuilt */}
      {!hasEvidenceBeenBuilt && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Evidence not yet built for {candidate.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Raw documents have been uploaded, but the AI evidence extraction and competency indexing pipeline has not been executed yet for this candidate.
              </p>
            </div>
          </div>

          <button
            onClick={buildEvidenceMap}
            disabled={isBuildingEvidence || candidate.documents.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer disabled:opacity-60"
          >
            {isBuildingEvidence ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>Building Evidence Map...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Build Evidence Map</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Dynamic Candidate Grouping Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveGroup('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
              activeGroup === 'all'
                ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 border-slate-900 dark:border-emerald-400 font-bold shadow-xs'
                : 'bg-white dark:bg-[#1A1F2E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2D3748] hover:border-slate-400'
            }`}
          >
            <span>All Candidates</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
              {candidates.length}
            </span>
          </button>

          <button
            onClick={() => setActiveGroup('fully_evidenced')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
              activeGroup === 'fully_evidenced'
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 border-emerald-600 dark:border-emerald-400 font-bold shadow-xs'
                : 'bg-white dark:bg-[#1A1F2E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2D3748] hover:border-slate-400'
            }`}
          >
            <ShieldCheck size={13} className={activeGroup === 'fully_evidenced' ? 'text-white dark:text-slate-950' : 'text-emerald-500'} />
            <span>Fully Evidenced</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
              {fullyEvidencedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveGroup('blocked_one_gap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
              activeGroup === 'blocked_one_gap'
                ? 'bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-950 border-amber-600 dark:border-amber-400 font-bold shadow-xs'
                : 'bg-white dark:bg-[#1A1F2E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2D3748] hover:border-slate-400'
            }`}
          >
            <ShieldAlert size={13} className={activeGroup === 'blocked_one_gap' ? 'text-white dark:text-slate-950' : 'text-amber-500'} />
            <span>Blocked on 1 Critical Gap</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
              {blockedOneGapCount}
            </span>
          </button>

          <button
            onClick={() => setActiveGroup('insufficient')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
              activeGroup === 'insufficient'
                ? 'bg-rose-600 dark:bg-rose-500 text-white dark:text-slate-950 border-rose-600 dark:border-rose-400 font-bold shadow-xs'
                : 'bg-white dark:bg-[#1A1F2E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2D3748] hover:border-slate-400'
            }`}
          >
            <HelpCircle size={13} className={activeGroup === 'insufficient' ? 'text-white dark:text-slate-950' : 'text-rose-500'} />
            <span>Insufficient Evidence</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
              {insufficientCount}
            </span>
          </button>
        </div>
      </div>

      {/* Natural Language Candidate Pool Query Bar */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter pool e.g., 'candidates with verified distributed systems' or 'show blocked on system design'..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F1117] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-emerald-400 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isSearching ? <Loader2 size={13} className="animate-spin" /> : <Filter size={13} />}
            <span>Filter</span>
          </button>
        </form>

        {/* Filter Chips Bar */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-[#2D3748]">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Filters:</span>
            {activeFilters.map((filter, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                <span>
                  <strong className="text-emerald-900 dark:text-emerald-200">{filter.status}:</strong> {filter.requirementName}
                </span>
                <button
                  onClick={() => removeFilter(idx)}
                  className="hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                  title="Remove filter"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            <button
              onClick={clearAllFilters}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer ml-1"
            >
              Clear all
            </button>

            <span className="text-xs text-slate-400 font-mono ml-auto">
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </span>
          </div>
        )}
      </div>

      {/* SKELETON SHIMMER PLACEHOLDER WHEN BUILDING EVIDENCE */}
      {isBuildingEvidence ? (
        <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl shadow-xs overflow-hidden p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Cross-Referencing Evidence & Indexing Citations...
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Verifying {roleRequirements.length} role requirements against ingested documents for candidate pool.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse flex items-center px-4 gap-4">
                <div className="w-1/3 space-y-2">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === 'matrix' ? (
        <>
          {/* DESKTOP & TABLET TABLE (md and up) */}
          <div className="hidden md:block bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#2D3748] bg-slate-50/70 dark:bg-[#0F1117]">
                    <th className="p-4 text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[240px] w-1/3">
                      Target Requirement
                    </th>
                    {filteredCandidates.map((c: Candidate) => {
                      const isSelected = c.id === activeCandidateId;
                      const summary = candidateSummaries.find(s => s.candidate.id === c.id);
                      const score = summary ? summary.readiness : 0;
                      const hasEvidence = c.hasEvidenceBeenBuilt;

                      return (
                        <th
                          key={c.id}
                          onClick={() => setActiveCandidateId(c.id)}
                          className={`p-4 text-xs font-mono min-w-[180px] cursor-pointer transition-colors border-l border-slate-200 dark:border-[#2D3748] ${
                            isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 truncate">
                              <User size={13} className={isSelected ? 'text-emerald-500' : 'text-slate-400'} />
                              <span className={`font-bold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                {c.name}
                              </span>
                            </div>

                            {hasEvidence ? (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono shrink-0 ${
                                score >= 80 
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                              }`}>
                                {score}%
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                Unbuilt
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-sans text-slate-400 font-normal mt-0.5">
                            {c.documents.length} document{c.documents.length === 1 ? '' : 's'}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-[#2D3748] text-xs">
                  {roleRequirements.map((req, index) => (
                    <motion.tr 
                      key={req.id} 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.03 }}
                      className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      {/* Requirement Label Column */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {req.name}
                            </span>
                            <ImportanceBadge importance={req.importance} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-sans">
                            {req.evidence || 'Verifiable competency criteria'}
                          </p>
                        </div>
                      </td>

                      {/* Candidate Cells */}
                      {filteredCandidates.map((c: Candidate) => {
                        const isSelected = c.id === activeCandidateId;
                        const candReq = c.requirements?.find((r: Requirement) => r.id === req.id || r.name.toLowerCase() === req.name.toLowerCase());
                        const hasEvidence = c.hasEvidenceBeenBuilt && candReq;

                        return (
                          <td
                            key={c.id}
                            onClick={() => {
                              if (hasEvidence && candReq) {
                                handleCellClick(c, candReq);
                              }
                            }}
                            className={`p-4 border-l border-slate-200 dark:border-[#2D3748] transition-colors ${
                              hasEvidence ? 'cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50' : ''
                            } ${isSelected ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''}`}
                          >
                            {hasEvidence && candReq ? (
                              <div className="space-y-1.5">
                                <StatusBadge status={candReq.status} provenance={candReq.provenance || 'heuristic'} size="sm" />
                                <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 font-sans">
                                  {candReq.snippet || candReq.evidence}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-start gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  <Clock size={11} />
                                  <span>Unbuilt</span>
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCandidateId(c.id);
                                    buildEvidenceMap();
                                  }}
                                  className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                >
                                  Build Map →
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE STACKED CARDS VIEW (< md / below 768px) */}
          {/* Each card represents a requirement and displays ALL candidates */}
          <div className="md:hidden space-y-4">
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1">
              Multi-Candidate Comparison View · Tap any candidate row to inspect evidence
            </div>

            {roleRequirements.map((req, index) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-4 shadow-xs space-y-3"
              >
                {/* Card Header: Requirement Name & Importance */}
                <div className="border-b border-slate-100 dark:border-[#2D3748] pb-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {req.name}
                    </h3>
                    <ImportanceBadge importance={req.importance} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                    {req.evidence || 'Verifiable competency criteria'}
                  </p>
                </div>

                {/* Candidate Comparison Rows for this Requirement */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Candidates ({filteredCandidates.length}):
                  </span>
                  {filteredCandidates.map((c: Candidate) => {
                    const isSelected = c.id === activeCandidateId;
                    const candReq = c.requirements?.find((r: Requirement) => r.id === req.id || r.name.toLowerCase() === req.name.toLowerCase());
                    const hasEvidence = c.hasEvidenceBeenBuilt && candReq;

                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          if (hasEvidence && candReq) {
                            handleCellClick(c, candReq);
                          }
                        }}
                        className={`p-3 rounded-lg border transition-all ${
                          hasEvidence
                            ? 'cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                            : 'bg-slate-50/30 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/50'
                        } ${isSelected ? 'ring-1 ring-emerald-500/40' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <User size={12} className={isSelected ? 'text-emerald-500' : 'text-slate-400'} />
                            <span className={`text-xs font-semibold truncate ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {c.name}
                            </span>
                          </div>

                          {hasEvidence && candReq ? (
                            <StatusBadge status={candReq.status} provenance={candReq.provenance || 'heuristic'} size="sm" />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                              <Clock size={10} />
                              <span>Unbuilt</span>
                            </span>
                          )}
                        </div>

                        {hasEvidence && candReq ? (
                          <div className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 font-sans">
                            {candReq.snippet || candReq.evidence}
                          </div>
                        ) : (
                          <div className="mt-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                            <span>Evidence unbuilt</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCandidateId(c.id);
                                buildEvidenceMap();
                              }}
                              className="underline hover:text-emerald-500 cursor-pointer"
                            >
                              Build Map →
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        /* DETAIL CARDS VIEW (Active Candidate) */
        <div className="space-y-3.5">
          {requirements.map((req, index) => {
            const isSupported = req.status === 'SUPPORTED';
            const isPartial = req.status === 'PARTIAL';
            const isUnknown = req.status === 'UNKNOWN';
            const isConflict = req.status === 'CONFLICT';

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: index * 0.03 }}
                onClick={() => openInspector(req)}
                className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      isSupported 
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700' 
                        : isPartial
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700'
                        : isConflict
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {isSupported ? (
                        <Check size={12} strokeWidth={2.5} />
                      ) : isPartial ? (
                        <AlertCircle size={12} />
                      ) : isConflict ? (
                        <AlertCircle size={12} className="text-rose-600 dark:text-rose-400" />
                      ) : (
                        <HelpCircle size={12} />
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      {req.name}
                    </h3>

                    <ImportanceBadge importance={req.importance} size="sm" />
                  </div>

                  <StatusBadge status={req.status} provenance={req.provenance || 'heuristic'} size="sm" />
                </div>

                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans mt-1">
                  {req.evidence}
                </p>

                <div className="flex items-center gap-2.5 pt-2.5 font-mono text-[11px]">
                  <div className="w-20 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex border border-slate-200/80 dark:border-slate-700 shrink-0">
                    <div
                      className="h-full bg-emerald-500"
                      title={`${req.corroboratedCount ?? 0} corroborated`}
                      style={{
                        width: `${((req.corroboratedCount ?? 0) / Math.max(1, (req.corroboratedCount ?? 0) + (req.claimedCount ?? 0))) * 100}%`
                      }}
                    />
                    <div
                      className="h-full bg-amber-400"
                      title={`${req.claimedCount ?? 0} self-claimed`}
                      style={{
                        width: `${((req.claimedCount ?? 0) / Math.max(1, (req.corroboratedCount ?? 0) + (req.claimedCount ?? 0))) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-slate-500 dark:text-[#94A3B8] font-medium">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{req.corroboratedCount ?? 0} corroborated</span> · <span className="text-amber-800 dark:text-amber-400 font-bold">{req.claimedCount ?? 0} claimed</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-[#2D3748] text-xs font-mono text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-slate-400 dark:text-slate-500" />
                    <span>{req.source}</span>
                    {req.sourceLocation && req.source !== 'No sufficient source' && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-slate-500 dark:text-slate-400">{req.sourceLocation}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-slate-900 dark:text-white font-semibold text-[11px] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    <span>Inspect AI Analysis</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Evidence Status Standard Legend */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold tracking-wider uppercase text-[11px]">
          <Layers size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span>EVIDENCE STATUS CRITERIA & STANDARDS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748] flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
            <div>
              <strong className="text-emerald-700 dark:text-emerald-400">SUPPORTED:</strong> Strong corroborated evidence found across independent sources.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748] flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
            <div>
              <strong className="text-amber-700 dark:text-amber-400">PARTIAL:</strong> Evidence exists but below the requirement's rigorous evidence standard.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748] flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0 mt-1" />
            <div>
              <strong className="text-slate-800 dark:text-slate-300">UNKNOWN:</strong> No verifiable evidence found (<span className="italic">absence ≠ negative capability</span>).
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748] flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
            <div>
              <strong className="text-rose-700 dark:text-rose-400">CONFLICT:</strong> Contradicting evidence identified between two or more documents.
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Inspector Drawer */}
      <EvidenceInspectorDrawer />
    </div>
  );
};
