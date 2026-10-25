import React from 'react';
import { Clock, Users, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LabAttendanceBoard = ({ groups, onSelectGroup }) => {
  const activeLabGroups = groups.filter(g => g.currentlyInLab);

  if (activeLabGroups.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs my-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-500">
          <Clock className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Central Laboratory Status: Standby & Available</h4>
        <p className="text-xs text-slate-500 mt-0.5 max-w-lg mx-auto">
          No hardware teams are currently clocked into the physical prototyping benches. Project leaders stamp check-in upon entering.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#071f3a] text-white rounded-2xl p-6 shadow-md my-6 border border-slate-800 border-l-4 border-l-[#d4af37]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
            Active Laboratory Working Sessions ({activeLabGroups.length} Ongoing)
          </h3>
        </div>
        <span className="text-[11px] text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded border border-emerald-500/40 font-mono font-semibold">
          Live Attendance Register
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeLabGroups.map((group) => {
          const currentSession = (group.labAttendance || []).find(a => a.checkOutTime === null) || group.labAttendance?.[0];

          return (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded">
                  {group.groupName}
                </span>
                <span className="text-[11px] font-mono text-emerald-300 font-bold">
                  In: {currentSession?.checkInTime || 'Active'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-blue-200 transition line-clamp-1">
                {group.projectTitle}
              </h4>

              <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                <span className="text-slate-400">Activity: </span>
                {currentSession?.activity || 'Prototyping Session'}
              </p>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Leader: {group.leader.name}</span>
                <span className="text-blue-300 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                  <span>Manage</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
