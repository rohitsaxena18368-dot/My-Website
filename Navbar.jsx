import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpg';
import { 
  ShieldCheck, 
  User, 
  Users, 
  PlusCircle, 
  LogOut, 
  Search,
  Lock,
  Award,
  GraduationCap,
  ChevronDown,
  Building2,
  Clock
} from 'lucide-react';

export const Navbar = ({ onOpenCreateGroup, onOpenLogin, groups, searchTerm, setSearchTerm, activeFilter, setActiveFilter }) => {
  const { currentUser, isAuthenticated, logout, isFaculty, isHOD } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const currentlyInLabCount = groups.filter(g => g.currentlyInLab).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      
      {/* Top Formal Institutional Banner */}
      <div className="bg-[#071f3a] text-white text-[11px] px-4 py-1.5 border-b border-[#d4af37]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-wider text-slate-100">DRONACHARYA COLLEGE OF ENGINEERING</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 font-medium hidden md:inline">Department of Research & Innovation</span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-slate-300 hidden lg:inline">Central Hardware Prototyping Laboratory</span>
          </div>

          <div className="flex items-center space-x-3 text-[10px]">
            {currentlyInLabCount > 0 ? (
              <span className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{currentlyInLabCount} Active Laboratory Session(s)</span>
              </span>
            ) : (
              <span className="text-slate-300">Lab Status: Ready for Requisitions</span>
            )}
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 hidden sm:inline">AICTE & NAAC Accredited</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Formal Portal Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none" 
            onClick={() => setActiveFilter('all')}
          >
            <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#071f3a] to-blue-600 shadow-md flex-shrink-0">
              <img 
                src={logoImg} 
                alt="DRONACHARYA Logo" 
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-extrabold text-[#071f3a] tracking-tight font-display">
                  DRONACHARYA <span className="text-blue-700">R&D LAB MANAGMENT</span>
                </span>
                <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block">
                  Official Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block tracking-wide">
                Where Electronics Takes Flight • Prototyping Ledger & Attendance Register
              </p>
            </div>
          </div>

          {/* Search Filter Box */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by project, team name, roll no, or component..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl outline-none transition placeholder:text-slate-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Actions & Formal User State */}
          <div className="flex items-center space-x-3">
            {/* Register New Project Group Button */}
            <button
              onClick={onOpenCreateGroup}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#071f3a] text-white hover:bg-[#0c2e55] shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Register Project Group</span>
              <span className="sm:hidden">New Group</span>
            </button>

            {/* Authenticated User / Sign-In Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-left transition"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                    isHOD ? 'bg-amber-700' : isFaculty ? 'bg-indigo-700' : 'bg-[#071f3a]'
                  }`}>
                    {isHOD ? <Award className="w-4 h-4" /> : isFaculty ? <ShieldCheck className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                  </div>

                  <div className="hidden lg:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {currentUser.rollNo ? `Roll: ${currentUser.rollNo}` : currentUser.roleLabel}
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Active Verified Identity
                      </p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500">{currentUser.roleLabel}</p>
                      {currentUser.rollNo && (
                        <p className="text-[11px] font-mono font-bold text-blue-700 mt-1">
                          Roll No: {currentUser.rollNo}
                        </p>
                      )}
                      {currentUser.idNumber && (
                        <p className="text-[11px] font-mono font-bold text-amber-800 mt-1">
                          Employee ID: {currentUser.idNumber}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">{currentUser.department}</p>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenLogin();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 text-left transition"
                      >
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Switch Identity / Re-authenticate</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 text-left transition"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out of Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 hover:border-slate-400 bg-white text-slate-800 transition shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-blue-700" />
                <span>Identity Sign-In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
