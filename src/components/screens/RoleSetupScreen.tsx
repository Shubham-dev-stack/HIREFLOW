import React, { useState } from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { ImportanceBadge } from '../common/ImportanceBadge';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { Importance } from '../../types';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Loader2,
  UploadCloud,
  AlertCircle
} from 'lucide-react';
import { DocumentParser } from '../../services/analysis/documentParser';

export const RoleSetupScreen: React.FC = () => {
  const { 
    role, 
    setRole, 
    requirements, 
    addRequirement, 
    updateRequirementImportance, 
    deleteRequirement,
    analyzeRole,
    loadDemoRole,
    isAnalyzingRole,
    setCurrentStep,
    hasRoleBeenAnalyzed
  } = useHireFlow();

  const [newReqName, setNewReqName] = useState('');
  const [newReqImportance, setNewReqImportance] = useState<Importance>('High');
  const [isAdding, setIsAdding] = useState(false);
  const [isParsingJD, setIsParsingJD] = useState(false);
  const [jdFileError, setJdFileError] = useState<string | null>(null);

  const handleJDFileUpload = async (file: File) => {
    setIsParsingJD(true);
    setJdFileError(null);
    try {
      const parsed = await DocumentParser.parseFile(file);
      if (parsed.error) {
        setJdFileError(parsed.error);
      } else {
        setRole(prev => ({
          ...prev,
          description: parsed.fullText,
          title: prev.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
        }));
      }
    } catch (err: any) {
      setJdFileError(err?.message || 'Failed to read file');
    } finally {
      setIsParsingJD(false);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqName.trim()) return;
    addRequirement(newReqName.trim(), newReqImportance);
    setNewReqName('');
    setIsAdding(false);
  };

  const criticalCount = requirements.filter(r => r.importance === 'Critical').length;
  const highCount = requirements.filter(r => r.importance === 'High').length;
  const mediumCount = requirements.filter(r => r.importance === 'Medium').length;

  return (
    <div className="max-w-5xl mx-auto py-12 px-8 space-y-10 animate-fade-in text-slate-900 dark:text-[#F1F5F9]">
      {/* Screen Question & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#2D3748]">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            01 • Role Setup
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
            What are we evaluating?
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 max-w-xl leading-relaxed">
            Define the target role parameters and extract foundational criteria for candidate evidence mapping.
          </p>
        </div>

        {hasRoleBeenAnalyzed && (
          <button
            onClick={() => setCurrentStep('02_CANDIDATES')}
            className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <span>Continue to Candidates</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Two-Column Clean Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Role Details & JD Input */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                Role Title
              </label>
              <input
                type="text"
                value={role.title}
                onChange={(e) => setRole({ ...role, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm font-semibold bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-emerald-500 text-slate-900 dark:text-white transition-colors"
                placeholder="Senior Backend Engineer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                  Department
                </label>
                <input
                  type="text"
                  value={role.department}
                  onChange={(e) => setRole({ ...role, department: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                  Location / Mode
                </label>
                <input
                  type="text"
                  value={role.location}
                  onChange={(e) => setRole({ ...role, location: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                  Job Description
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Verbatim Specification</span>
              </div>

              {/* JD File Dropzone */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleJDFileUpload(file);
                }}
                className="mb-2 p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-lg bg-slate-50/50 dark:bg-[#0F1117] flex items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <UploadCloud size={16} className="text-slate-400 shrink-0" />
                  <span>Drop a JD file (<strong>.pdf, .docx, .txt, .md</strong>) or</span>
                  <label className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer hover:underline">
                    browse
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.md"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleJDFileUpload(file);
                      }}
                    />
                  </label>
                </div>
                {isParsingJD && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Loader2 size={12} className="animate-spin text-emerald-500" />
                    <span>Extracting...</span>
                  </div>
                )}
              </div>

              {jdFileError && (
                <div className="mb-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{jdFileError}</span>
                </div>
              )}

              <textarea
                rows={9}
                value={role.description}
                onChange={(e) => setRole({ ...role, description: e.target.value })}
                className="w-full p-3.5 text-xs font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-emerald-500 leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={analyzeRole}
                disabled={isAnalyzingRole}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all disabled:opacity-60"
              >
                {isAnalyzingRole ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-emerald-400 dark:text-slate-950" />
                    <span>Extracting Verifiable Requirements...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-emerald-400 dark:text-slate-950" />
                    <span>Extract Verifiable Requirements</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={loadDemoRole}
                className="px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-[#2D3748] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono transition-colors shrink-0"
                title="Load benchmark Senior Backend Engineer role"
              >
                Load Benchmark Role
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Requirement Rows */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-6 shadow-xs space-y-5 transition-colors">
            {/* Header Summary Pill */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D3748]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Extracted Requirements
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                  Criteria used to map candidate evidence.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {requirements.length} requirements
                </span>
                <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                  {criticalCount} Critical · {highCount} High · {mediumCount} Medium
                </div>
              </div>
            </div>

            {/* Clean Rows */}
            <div className="divide-y divide-slate-100 dark:divide-[#2D3748]">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  className="py-3 flex items-center justify-between group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 -mx-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-slate-900 dark:group-hover:bg-emerald-400 transition-colors" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{req.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-[#94A3B8] line-clamp-1 max-w-xs">
                        {req.reasoning}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <select
                      value={req.importance}
                      onChange={(e) => updateRequirementImportance(req.id, e.target.value as Importance)}
                      className="text-xs font-medium bg-transparent border-0 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-0 cursor-pointer text-right"
                    >
                      <option value="Critical" className="dark:bg-[#1A1F2E]">Critical</option>
                      <option value="High" className="dark:bg-[#1A1F2E]">High</option>
                      <option value="Medium" className="dark:bg-[#1A1F2E]">Medium</option>
                      <option value="Low" className="dark:bg-[#1A1F2E]">Low</option>
                    </select>

                    <ImportanceBadge importance={req.importance} size="sm" />
                    <ProvenanceBadge source={req.provenance || 'heuristic'} />

                    <button
                      onClick={() => deleteRequirement(req.id)}
                      className="text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Requirement or Bottom Action */}
            {isAdding ? (
              <form onSubmit={handleAddSubmit} className="pt-2 border-t border-slate-100 dark:border-[#2D3748] space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newReqName}
                    onChange={(e) => setNewReqName(e.target.value)}
                    placeholder="Requirement name..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#0F1117] border border-slate-200 dark:border-[#2D3748] rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-emerald-500 text-slate-900 dark:text-white"
                    autoFocus
                  />
                  <select
                    value={newReqImportance}
                    onChange={(e) => setNewReqImportance(e.target.value as Importance)}
                    className="px-2 py-1.5 text-xs bg-slate-50 dark:bg-[#0F1117] border border-slate-200 dark:border-[#2D3748] rounded-md text-slate-900 dark:text-white"
                  >
                    <option value="Critical" className="dark:bg-[#1A1F2E]">Critical</option>
                    <option value="High" className="dark:bg-[#1A1F2E]">High</option>
                    <option value="Medium" className="dark:bg-[#1A1F2E]">Medium</option>
                    <option value="Low" className="dark:bg-[#1A1F2E]">Low</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-2.5 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 rounded-md font-semibold hover:bg-slate-800 dark:hover:bg-emerald-400"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-3 border-t border-slate-100 dark:border-[#2D3748] flex items-center justify-between">
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Plus size={13} />
                  <span>Add requirement</span>
                </button>

                <button
                  onClick={() => setCurrentStep('02_CANDIDATES')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <span>Continue to Candidates →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
