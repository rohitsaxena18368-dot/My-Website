import React from 'react';
import { Users, FlaskConical, CheckCircle2, Clock, Cpu, ShieldAlert } from 'lucide-react';

export const DashboardStats = ({ groups, onFilterClick, activeFilter }) => {
  const totalGroups = groups.length;
  const inProgress = groups.filter(g => g.status === 'in-progress').length;
  const completed = groups.filter(g => g.status === 'completed').length;
  const eliminated = groups.filter(g => g.status === 'eliminated').length;
  const currentlyInLab = groups.filter(g => g.currentlyInLab).length;

  const totalComponents = groups.reduce((acc, g) => {
    return acc + (g.components ? g.components.filter(c => c.status === 'active').length : 0);
  }, 0);

  const stats = [
    {
      id: 'all',
      label: 'Registered Research Groups',
      count: totalGroups,
      icon: Users,
      color: 'blue',
      description: 'Departmental project dossiers'
    },
    {
      id: 'in-progress',
      label: 'Prototyping In-Progress',
      count: inProgress,
      icon: FlaskConical,
      color: 'sky',
      description: 'Hardware actively under test'
    },
    {
      id: 'completed',
      label: 'Certified Completed',
      count: completed,
      icon: CheckCircle2,
      color: 'emerald',
      description: 'Audited & summary PDF ready'
    },
    {
      id: 'in-lab',
      label: 'Active Lab Sessions Now',
      count: currentlyInLab,
      icon: Clock,
      color: 'amber',
      pulse: currentlyInLab > 0,
      description: 'Present inside laboratory'
    },
    {
      id: 'eliminated',
      label: 'Administrative Archive',
      count: eliminated,
      icon: ShieldAlert,
      color: 'rose',
      description: 'Board eliminated projects'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 my-6">
      {stats.map((item) => {
        const Icon = item.icon;
        const isActive = activeFilter === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onFilterClick(item.id)}
            className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${
              isActive
                ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            {item.pulse && (
              <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}

            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                item.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                item.color === 'sky' ? 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white' :
                item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                item.color === 'amber' ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white' :
                'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 font-display">
                {item.count}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-800 leading-tight">
              {item.label}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
              {item.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
