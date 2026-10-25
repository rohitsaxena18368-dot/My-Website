import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { GroupCard } from './components/GroupCard';
import { GroupDetailModal } from './components/GroupDetailModal';
import { CreateGroupWizard } from './components/CreateGroupWizard';
import { LoginModal } from './components/LoginModal';
import { LabAttendanceBoard } from './components/LabAttendanceBoard';
import logoImg from './assets/logo.jpg';
import { 
  PlusCircle, 
  Search, 
  FlaskConical, 
  Filter, 
  Sparkles, 
  BookOpen, 
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  Layers,
  User
} from 'lucide-react';

export function App() {
  const { currentUser, isFaculty, isHOD } = useAuth();

  const [groups, setGroups] = useState(() => storage.getGroups());
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'in-progress' | 'completed' | 'in-lab' | 'eliminated'
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const refreshGroups = () => {
    const updated = storage.getGroups();
    setGroups(updated);
    if (selectedGroup) {
      const refreshedSelected = updated.find(g => g.id === selectedGroup.id);
      setSelectedGroup(refreshedSelected || null);
    }
  };

  // Group Handlers
  const handleCreateGroup = (groupPayload, leaderPayload) => {
    const result = storage.createGroup(groupPayload, leaderPayload);
    if (result && result.error) {
      showToast(result.error);
      return result;
    }
    refreshGroups();
    showToast(`Project group "${result.groupName}" successfully registered!`);
    setSelectedGroup(result);
    return result;
  };

  const handleUpdateGroup = (groupId, updates) => {
    storage.updateGroupDetailsByLeader(groupId, updates, currentUser);
    refreshGroups();
    showToast("Group details updated successfully.");
  };

  const handleAddComponent = (groupId, compData) => {
    storage.addComponent(groupId, compData, currentUser);
    refreshGroups();
    showToast(`Component "${compData.name}" added to lab inventory.`);
  };

  const handleReplaceComponent = (groupId, oldCompId, newCompData, reason) => {
    storage.replaceComponent(groupId, oldCompId, newCompData, reason, currentUser);
    refreshGroups();
    showToast(`Component replaced with "${newCompData.name}". Audit log updated.`);
  };

  const handleEliminateComponent = (groupId, compId, reason) => {
    storage.eliminateComponent(groupId, compId, reason, currentUser);
    refreshGroups();
    showToast(`Component eliminated under Faculty/HOD authority.`);
  };

  const handleCheckIn = (groupId, attendedMembers, activity) => {
    storage.checkInToLab(groupId, attendedMembers, activity, currentUser);
    refreshGroups();
    showToast("Checked into R&D Lab! Session timer active.");
  };

  const handleCheckOut = (groupId, attendanceId, workDoneNotes) => {
    storage.checkOutFromLab(groupId, attendanceId, workDoneNotes);
    refreshGroups();
    showToast("Checked out from R&D Lab. Work notes stamped.");
  };

  const handleCompleteProject = (groupId, videoData) => {
    storage.completeProject(groupId, videoData);
    refreshGroups();
    showToast("🎉 Congratulations! Project marked COMPLETED. Official PDF Summary Report unlocked!");
  };

  const handleEliminateGroup = (groupId, reason) => {
    storage.eliminateGroup(groupId, reason, currentUser);
    refreshGroups();
    showToast(`Group eliminated by ${currentUser.name}.`);
  };

  const handleRestoreGroup = (groupId) => {
    storage.restoreGroup(groupId);
    refreshGroups();
    showToast("Group restored to Active status.");
  };

  const handleResetData = () => {
    storage.resetAllData();
    refreshGroups();
    showToast("Reset all data to default college engineering projects.");
  };

  // Filtered Groups
  const filteredGroups = groups.filter((g) => {
    // Search query match
    const term = searchTerm.toLowerCase().trim();
    let matchesSearch = true;

    if (term) {
      const matchTitle = g.projectTitle?.toLowerCase().includes(term);
      const matchGroupName = g.groupName?.toLowerCase().includes(term);
      const matchLeader = g.leader?.name?.toLowerCase().includes(term);
      const matchLeaderRoll = g.leader?.rollNo?.toLowerCase().includes(term);
      const matchProblem = g.realLifeProblem?.toLowerCase().includes(term);
      const matchApp = g.realLifeApplication?.toLowerCase().includes(term);
      const matchMember = (g.members || []).some(m => 
        m.name?.toLowerCase().includes(term) || m.rollNo?.toLowerCase().includes(term)
      );
      const matchComp = (g.components || []).some(c => 
        c.name?.toLowerCase().includes(term)
      );

      matchesSearch = matchTitle || matchGroupName || matchLeader || matchLeaderRoll || matchProblem || matchApp || matchMember || matchComp;
    }

    if (!matchesSearch) return false;

    // Filter by tab
    if (activeFilter === 'in-progress') return g.status === 'in-progress';
    if (activeFilter === 'completed') return g.status === 'completed';
    if (activeFilter === 'in-lab') return g.currentlyInLab;
    if (activeFilter === 'eliminated') return g.status === 'eliminated';

    return true; // 'all'
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        onOpenCreateGroup={() => setIsCreateOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        groups={groups}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {/* Guest Mode Advisory Banner if Not Authenticated */}
      {!currentUser && (
        <div className="bg-slate-100 border-b border-slate-200 text-slate-700 text-xs py-2 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="font-semibold text-slate-900">Institutional Observer Mode Active:</span>
              <span className="text-slate-600 hidden sm:inline">
                You are currently viewing the public laboratory register in read-only mode.
              </span>
            </div>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="text-blue-800 hover:text-blue-950 font-bold underline text-xs"
            >
              Authenticate Institutional Identity (HOD / Faculty / Leader / Member) &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Hero Welcome & College Lab Banner */}
      <div className="bg-gradient-to-b from-[#071f3a] via-[#0b2d52] to-[#071f3a] text-white border-b-4 border-[#d4af37]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-[#d4af37] via-amber-200 to-white shadow-2xl flex-shrink-0">
                <img
                  src={logoImg}
                  alt="DRONACHARYA Emblem"
                  className="w-full h-full object-cover rounded-full bg-white shadow-inner"
                />
              </div>
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-amber-300 border border-amber-400/30 mb-2">
                  <span>CENTRAL RESEARCH & DEVELOPMENT INNOVATION PORTAL</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                  DRONACHARYA <span className="text-amber-400">R&D LAB MANAGMENT</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed font-light">
                  Department of Electronics & Communication • Automated Project Lifecycle, Mandatory Student Roll Number Validation, Hardware Requisition Ledger & Laboratory Entry/Exit Register.
                </p>
              </div>
            </div>

            {/* Formal Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>Register Research Group</span>
              </button>

              <button
                onClick={() => setIsLoginOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
              >
                <User className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentUser ? 'Switch / Re-Authenticate' : 'Institutional Sign-In'}</span>
              </button>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <DashboardStats
              groups={groups}
              activeFilter={activeFilter}
              onFilterClick={(filter) => setActiveFilter(filter)}
            />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        
        {/* Live Lab Attendance Real-Time Board */}
        <LabAttendanceBoard
          groups={groups}
          onSelectGroup={(g) => setSelectedGroup(g)}
        />

        {/* Section Header & Search / Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Departmental Project Register & Research Dossiers</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {filteredGroups.length} Active Dossier(s)
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified component requisitions, member credentials, real-life problem statements, and laboratory attendance history.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'in-progress', label: 'Prototyping In-Progress' },
              { id: 'completed', label: 'Certified Completed' },
              { id: 'in-lab', label: 'Inside Lab Now' },
              { id: 'eliminated', label: 'Eliminated Archive' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-[#071f3a] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onSelectGroup={(g) => setSelectedGroup(g)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 sm:p-14 text-center border border-slate-200 max-w-lg mx-auto shadow-xs my-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <FlaskConical className="w-7 h-7 text-[#071f3a]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              {groups.length === 0 
                ? 'Departmental Project Ledger is Currently Empty' 
                : 'No Matching Research Dossiers Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-sm mx-auto">
              {groups.length === 0 
                ? 'No project groups are currently registered in the database. Research leaders can authenticate and register their innovative hardware projects.' 
                : searchTerm 
                ? `No group matched your search query "${searchTerm}". Please refine your search criteria.`
                : 'No projects match this departmental filter.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition"
                >
                  Clear Search Filter
                </button>
              )}
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#071f3a] hover:bg-[#0c2e55] text-xs font-bold text-white rounded-xl shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Register Research Project</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img src={logoImg} alt="Dronacharya Logo" className="w-6 h-6 rounded-full object-cover" />
            <span className="font-bold text-slate-800">DRONACHARYA R&D LAB MANAGMENT</span>
            <span className="text-slate-300">•</span>
            <span>Where Electronics Takes Flight</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Roll Numbers Verified</span>
            <span>•</span>
            <span>Component Protection Active</span>
            <span>•</span>
            <span>PDF Summary Reports Enabled</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GroupDetailModal
        group={selectedGroup}
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        onUpdateGroup={handleUpdateGroup}
        onAddComponent={handleAddComponent}
        onReplaceComponent={handleReplaceComponent}
        onEliminateComponent={handleEliminateComponent}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onCompleteProject={handleCompleteProject}
        onEliminateGroup={handleEliminateGroup}
        onRestoreGroup={handleRestoreGroup}
      />

      <CreateGroupWizard
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onGroupCreated={handleCreateGroup}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </div>
  );
}
