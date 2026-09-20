import React, { useState } from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { StatusBadge } from '../common/StatusBadge';
import { AuditEvent } from '../../types';
import { 
  History, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Check, 
  Eye, 
  FileText
} from 'lucide-react';

export const AuditTrailScreen: React.FC = () => {
  const { 
    auditTrail, 
    selectedAuditEvent, 
    setSelectedAuditEvent, 
    candidate, 
    role 
  } = useHireFlow();

  const [activeEvent, setActiveEvent] = useState<AuditEvent>(
    selectedAuditEvent || auditTrail[0] || {}
  );

  const handleEventClick = (event: AuditEvent) => {
    setActiveEvent(event);
    setSelectedAuditEvent(event);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Governance & Lineage
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Decision Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Immutable chronological record of evidence classifications, validations, and status transitions.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded bg-slate-100 text-slate-700 font-medium">
          {auditTrail.length} Logged Events
        </span>
      </div>

      {/* Two-Column Lineage View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Timeline list */}
        <div className="md:col-span-6 space-y-2.5">
          {auditTrail.map((event) => {
            const isSelected = activeEvent?.id === event.id;

            return (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {event.timestamp}
                  </span>
                  <span className={`font-mono text-[10px] uppercase tracking-wider ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                    {event.category}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between">
                  <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {event.title}
                  </h4>
                  <ChevronRight size={13} className={isSelected ? 'text-emerald-400' : 'text-slate-300'} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Lineage Details */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900">
                Event Lineage Details
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">
                {activeEvent.timestamp}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider block mb-1">
                  Event
                </span>
                <div className="font-bold text-slate-900 text-sm">{activeEvent.title}</div>
              </div>

              {/* Status Transition (if present) */}
              {(activeEvent.previousStatus || activeEvent.newStatus) && (
                <div>
                  <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider block mb-1">
                    Status Transition
                  </span>
                  <div className="flex items-center gap-2 pt-0.5">
                    {activeEvent.previousStatus ? (
                      <StatusBadge status={activeEvent.previousStatus} size="sm" />
                    ) : (
                      <span className="text-slate-400 font-mono">UNSET</span>
                    )}
                    <ArrowRight size={13} className="text-slate-400" />
                    {activeEvent.newStatus && (
                      <StatusBadge status={activeEvent.newStatus} size="sm" />
                    )}
                  </div>
                </div>
              )}

              <div>
                <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider block mb-1">
                  Source
                </span>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono text-slate-800">
                  {activeEvent.source || 'Direct System Extraction'}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider block mb-1">
                  Evidence / Payload
                </span>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-sans">
                  "{activeEvent.evidence || 'No payload'}"
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider block mb-1">
                  Reasoning
                </span>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-sans">
                  {activeEvent.reasoning || 'Evaluated against evidence thresholds.'}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider block mb-1">
                  Operator
                </span>
                <div className="text-slate-600 font-mono">
                  {activeEvent.user || 'HireFlow Engine'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
