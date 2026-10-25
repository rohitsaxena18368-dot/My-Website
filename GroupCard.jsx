import React from 'react';
import { 
  Users, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  FileText, 
  PlayCircle, 
  ChevronRight, 
  AlertCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { generateProjectSummaryPdf } from '../services/pdfGenerator';

export const GroupCard = ({ group, onSelectGroup }) => {
  const isCompleted = group.status === 'completed';
  const isEliminated = group.status === 'eliminated';
  const activeComponentsCount = (group.components || []).filter(c => c.status === 'active').length;

  const handleDownloadPdf = (e) => {
    e.stopPropagation();
    generateProjectSummaryPdf(group);
  };

  return (
    <div
      onClick={() => onSelectGroup(group)}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-400 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between overflow-hidden group"
    >
      <div>
        {/* Card Header & Status Banner */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100/80">
              {group.groupName}
            </span>

            <div className="flex items-center space-x-1.5">
              {group.currentlyInLab && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>In Lab Now</span>
                </span>
              )}

              {isCompleted ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Completed</span>
                </span>
              ) : isEliminated ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  <span>Eliminated</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                  <Clock className="w-3 h-3 text-sky-600" />
                  <span>In Progress</span>
                </span>
              )}
            </div>
          </div>

          {/* Project Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug font-display">
            {group.projectTitle}
          </h3>

          {/* Real-Life Problem Snippet */}
          <div className="mt-3">
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              <span className="font-semibold text-slate-700">Problem: </span>
              {group.realLifeProblem}
            </p>
          </div>

          {/* Real-Life Application Snippet */}
          <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 line-clamp-1">
            <span className="font-semibold text-slate-800">Application: </span>
            {group.realLifeApplication}
          </div>
        </div>

        {/* Team & Components Meta */}
        <div className="px-5 py-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Group Leader (Roll No.)
            </span>
            <div className="font-semibold text-slate-800 truncate mt-0.5">
              {group.leader.name}
            </div>
            <span className="inline-block text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1 rounded">
              {group.leader.rollNo}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Team & Hardware
            </span>
            <div className="flex items-center space-x-3 mt-1 text-slate-700 font-medium">
              <span className="flex items-center space-x-1" title={`${(group.members || []).length + 1} Total members`}>
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{(group.members || []).length + 1}</span>
              </span>
              <span className="flex items-center space-x-1" title={`${activeComponentsCount} Active Components`}>
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeComponentsCount} comps</span>
              </span>
              {group.video && (
                <span className="flex items-center text-emerald-600" title="Project Video Uploaded">
                  <PlayCircle className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer / Actions */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 rounded-xl border border-slate-200 transition"
          title="Download Official PDF Summary Report"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Summary PDF</span>
        </button>

        <span className="inline-flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
          <span>View Profile</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </span>
      </div>
    </div>
  );
};
