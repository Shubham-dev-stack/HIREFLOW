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
  Loader2
} from 'lucide-react';

export const RoleSetupScreen: React.FC = () => {
  const { 
    role, 
    setRole, 
    requirements, 
    addRequirement, 
    updateRequirementImportance, 
    deleteRequirement,
    analyzeRole,
    isAnalyzingRole,
    setCurrentStep,
    hasRoleBeenAnalyzed
  } = useHireFlow();

  const [newReqName, setNewReqName] = useState('');
  const [newReqImportance, setNewReqImportance] = useState<Importance>('High');
  const [isAdding, setIsAdding] = useState(false);

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
    <div className="max-w-5xl mx-auto py-12 px-8 space-y-10 animate-fade-in">
      {/* Screen Question & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            01 • Role Setup
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            What are we evaluating?
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Define the target role parameters and extract foundational criteria for candidate evidence mapping.
          </p>
        </div>

        {hasRoleBeenAnalyzed && (
          <button
            onClick={() => setCurrentStep('02_CANDIDATES')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
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
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1.5 font-medium">
                Role Title
              </label>
              <input
                type="text"
                value={role.title}
                onChange={(e) => setRole({ ...role, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
                placeholder="Senior Backend Engineer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1.5 font-medium">
                  Department
                </label>
                <input
                  type="text"
                  value={role.department}
                  onChange={(e) => setRole({ ...role, department: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1.5 font-medium">
                  Location / Mode
                </label>
                <input
                  type="text"
                  value={role.location}
                  onChange={(e) => setRole({ ...role, location: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
                  Job Description
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Verbatim Specification</span>
              </div>
              <textarea
                rows={11}
                value={role.description}
                onChange={(e) => setRole({ ...role, description: e.target.value })}
                className="w-full p-3.5 text-xs font-mono text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed resize-none"
              />
            </div>

            <button
              onClick={analyzeRole}
              disabled={isAnalyzingRole}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all disabled:opacity-60"
            >
              {isAnalyzingRole ? (
                <>
                  <Loader2 size={14} className="animate-spin text-emerald-400" />
                  <span>Extracting Verifiable Requirements...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-emerald-400" />
                  <span>Analyze Role Requirements</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Clean Requirement Rows */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            {/* Header Summary Pill */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Extracted Requirements
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Criteria used to map candidate evidence.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-900">
                  {requirements.length} requirements
                </span>
                <div className="text-[11px] font-mono text-slate-400">
                  {criticalCount} Critical · {highCount} High · {mediumCount} Medium
                </div>
              </div>
            </div>

            {/* Clean Rows */}
            <div className="divide-y divide-slate-100">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  className="py-3 flex items-center justify-between group hover:bg-slate-50/60 px-2 -mx-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-slate-900 transition-colors" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{req.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                        {req.reasoning}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <select
                      value={req.importance}
                      onChange={(e) => updateRequirementImportance(req.id, e.target.value as Importance)}
                      className="text-xs font-medium bg-transparent border-0 text-slate-600 focus:outline-none focus:ring-0 cursor-pointer text-right"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>

                    <ImportanceBadge importance={req.importance} size="sm" />
                    <ProvenanceBadge source={req.provenance || 'heuristic'} />

                    <button
                      onClick={() => deleteRequirement(req.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
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
              <form onSubmit={handleAddSubmit} className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newReqName}
                    onChange={(e) => setNewReqName(e.target.value)}
                    placeholder="Requirement name..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                    autoFocus
                  />
                  <select
                    value={newReqImportance}
                    onChange={(e) => setNewReqImportance(e.target.value as Importance)}
                    className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-2.5 py-1 text-slate-500 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Plus size={13} />
                  <span>Add requirement</span>
                </button>

                <button
                  onClick={() => setCurrentStep('02_CANDIDATES')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-emerald-700 transition-colors"
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
