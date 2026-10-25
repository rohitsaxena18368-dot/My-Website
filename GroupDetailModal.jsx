import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import logoImg from '../assets/logo.jpg';
import { 
  X, 
  Users, 
  Cpu, 
  Clock, 
  FileText, 
  PlayCircle, 
  Plus, 
  RotateCw, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  LogIn, 
  LogOut, 
  ExternalLink, 
  Edit3, 
  Save, 
  Video,
  Info
} from 'lucide-react';
import { generateProjectSummaryPdf } from '../services/pdfGenerator';

export const GroupDetailModal = ({ 
  group, 
  isOpen, 
  onClose, 
  onUpdateGroup,
  onAddComponent,
  onReplaceComponent,
  onEliminateComponent,
  onCheckIn,
  onCheckOut,
  onCompleteProject,
  onEliminateGroup,
  onRestoreGroup
}) => {
  const { currentUser, isFaculty, isHOD, canEliminate, isLeaderOf } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'components' | 'attendance' | 'video' | 'faculty'

  // Edit Mode for Leader
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [editProblem, setEditProblem] = useState(group?.realLifeProblem || '');
  const [editApplication, setEditApplication] = useState(group?.realLifeApplication || '');
  const [editTitle, setEditTitle] = useState(group?.projectTitle || '');

  // Add Member State (Leader Only)
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRollNo, setNewMemberRollNo] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Research Member');
  const [memberError, setMemberError] = useState('');

  // Add Component State
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [compName, setCompName] = useState('');
  const [compQty, setCompQty] = useState(1);
  const [compSpecs, setCompSpecs] = useState('');
  const [compPurpose, setCompPurpose] = useState('');

  // Replace Component State
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replacementName, setReplacementName] = useState('');
  const [replacementQty, setReplacementQty] = useState(1);
  const [replacementSpecs, setReplacementSpecs] = useState('');
  const [replacementReason, setReplacementReason] = useState('');

  // Eliminate Component State (Faculty / HOD Only)
  const [eliminateTargetComp, setEliminateTargetComp] = useState(null);
  const [eliminateCompReason, setEliminateCompReason] = useState('');

  // Check In State
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInActivity, setCheckInActivity] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState([]);

  // Check Out State
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [checkOutNotes, setCheckOutNotes] = useState('');

  // Complete Project & Video Upload State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Faculty Eliminate Group State
  const [showEliminateGroupModal, setShowEliminateGroupModal] = useState(false);
  const [groupEliminationReason, setGroupEliminationReason] = useState('');

  if (!isOpen || !group) return null;

  const userIsLeader = isLeaderOf(group);
  const isCompleted = group.status === 'completed';
  const isEliminated = group.status === 'eliminated';
  const canPerformLabAction = !isCompleted && !isEliminated;

  // Handlers for Overview Edit
  const handleSaveOverview = () => {
    onUpdateGroup(group.id, {
      projectTitle: editTitle.trim(),
      realLifeProblem: editProblem.trim(),
      realLifeApplication: editApplication.trim()
    });
    setIsEditingOverview(false);
  };

  // Handlers for Add Member (Leader Only)
  const handleAddMember = (e) => {
    e.preventDefault();
    setMemberError('');

    if (!newMemberName.trim()) {
      setMemberError('Member Name is required.');
      return;
    }
    if (!newMemberRollNo.trim()) {
      setMemberError('Roll Number is STRICTLY COMPULSORY for all members!');
      return;
    }

    const cleanRoll = newMemberRollNo.trim().toUpperCase();

    // Check if roll number matches group leader
    if (group.leader?.rollNo && group.leader.rollNo.toUpperCase() === cleanRoll) {
      setMemberError(`Roll No. "${cleanRoll}" is group ke Leader ka roll number hai!`);
      return;
    }

    // Check if already in current group members
    if ((group.members || []).some(m => m.rollNo && m.rollNo.toUpperCase() === cleanRoll)) {
      setMemberError(`Roll No. "${cleanRoll}" pehle se hi is group me add hai!`);
      return;
    }

    // Strict Rule: Check if member is enrolled in another incomplete/in-progress group
    const activeCheck = storage.checkMemberActiveGroup(cleanRoll, group.id);
    if (activeCheck.isEnrolled) {
      setMemberError(
        `Roll No. "${cleanRoll}" already active group "${activeCheck.groupName}" (${activeCheck.projectTitle}) me enrolled hai! Ek member dusre group me tab tak add nahi ho sakta jab tak unka pehla project complete na ho jaye.`
      );
      return;
    }

    const newMemberObj = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      rollNo: cleanRoll,
      role: newMemberRole.trim() || 'Team Member'
    };

    const updatedMembers = [...(group.members || []), newMemberObj];
    onUpdateGroup(group.id, { members: updatedMembers });

    setNewMemberName('');
    setNewMemberRollNo('');
    setNewMemberRole('Research Member');
    setShowAddMember(false);
  };

  const handleRemoveMember = (memberId) => {
    if (!userIsLeader) return;
    if (window.confirm("Are you sure you want to remove this member from the group?")) {
      const updatedMembers = (group.members || []).filter(m => m.id !== memberId);
      onUpdateGroup(group.id, { members: updatedMembers });
    }
  };

  // Handlers for Components
  const handleAddComponentSubmit = (e) => {
    e.preventDefault();
    if (!compName.trim()) return;

    onAddComponent(group.id, {
      name: compName.trim(),
      qty: parseInt(compQty, 10) || 1,
      specs: compSpecs.trim(),
      purpose: compPurpose.trim()
    });

    setCompName('');
    setCompQty(1);
    setCompSpecs('');
    setCompPurpose('');
    setShowAddComponent(false);
  };

  const handleReplaceSubmit = (e) => {
    e.preventDefault();
    if (!replaceTarget || !replacementName.trim() || !replacementReason.trim()) return;

    onReplaceComponent(group.id, replaceTarget.id, {
      name: replacementName.trim(),
      qty: parseInt(replacementQty, 10) || replaceTarget.qty,
      specs: replacementSpecs.trim()
    }, replacementReason.trim());

    setReplaceTarget(null);
    setReplacementName('');
    setReplacementQty(1);
    setReplacementSpecs('');
    setReplacementReason('');
  };

  const handleEliminateCompSubmit = (e) => {
    e.preventDefault();
    if (!eliminateTargetComp || !eliminateCompReason.trim()) return;

    onEliminateComponent(group.id, eliminateTargetComp.id, eliminateCompReason.trim());
    setEliminateTargetComp(null);
    setEliminateCompReason('');
  };

  // Check In / Check Out Handlers
  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    const attendees = selectedAttendees.length > 0 ? selectedAttendees : [group.leader.name];
    onCheckIn(group.id, attendees, checkInActivity.trim());
    setShowCheckInModal(false);
    setCheckInActivity('');
    setSelectedAttendees([]);
  };

  const handleCheckOutSubmit = (e) => {
    e.preventDefault();
    onCheckOut(group.id, null, checkOutNotes.trim());
    setShowCheckOutModal(false);
    setCheckOutNotes('');
  };

  // Project Complete Handler
  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    onCompleteProject(group.id, {
      title: videoTitle.trim() || 'Project Demonstration Video',
      url: videoUrl.trim() || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      uploadedAt: new Date().toISOString().split('T')[0]
    });
    setShowCompleteModal(false);
  };

  // Eliminate Group Handler (Faculty / HOD Only)
  const handleEliminateGroupSubmit = (e) => {
    e.preventDefault();
    if (!groupEliminationReason.trim()) return;
    onEliminateGroup(group.id, groupEliminationReason.trim());
    setShowEliminateGroupModal(false);
    setGroupEliminationReason('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Ribbon & Header */}
        <div className="bg-[#071f3a] text-white p-6 relative flex-shrink-0 border-b-2 border-[#d4af37]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Title with Official Logo */}
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#d4af37] via-amber-300 to-white shadow-md flex-shrink-0 mt-0.5">
              <img src={logoImg} alt="DRONACHARYA Logo" className="w-full h-full object-cover rounded-full bg-white" />
            </div>
            <div className="flex-1 pr-6">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  {group.groupName}
                </span>

                {group.currentlyInLab && (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-900 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                    <span>Currently Working in R&D Lab</span>
                  </span>
                )}

                {isCompleted ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Project Completed & Certified</span>
                  </span>
                ) : isEliminated ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Group Eliminated by Faculty</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Prototyping In-Progress</span>
                  </span>
                )}
              </div>

              {/* Project Title */}
              <h2 className="text-xl sm:text-2xl font-bold font-display leading-tight">
                {group.projectTitle}
              </h2>
            </div>
          </div>

          {/* Meta & Download PDF Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center space-x-4 text-slate-300">
              <span>Leader: <strong className="text-white">{group.leader.name}</strong></span>
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-blue-200">
                Roll: {group.leader.rollNo}
              </span>
              <span>{(group.members || []).length + 1} Total Team Members</span>
            </div>

            <button
              onClick={() => generateProjectSummaryPdf(group)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-md transition hover:scale-[1.02]"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Download Official PDF Summary Report</span>
            </button>
          </div>

          {/* Elimination Banner if eliminated */}
          {isEliminated && group.elimination && (
            <div className="mt-3 p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Elimination Notice: </span>
                <span>Eliminated by {group.elimination.eliminatedBy} ({group.elimination.role}) on {group.elimination.date}. Reason: "{group.elimination.reason}"</span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex items-center space-x-2 overflow-x-auto flex-shrink-0">
          {[
            { id: 'overview', label: 'Overview & Team', icon: Users },
            { id: 'components', label: `Components (${group.components?.length || 0})`, icon: Cpu },
            { id: 'attendance', label: `Lab Entry/Exit (${group.labAttendance?.length || 0})`, icon: Clock },
            { id: 'video', label: group.video ? 'Video & Report' : 'Complete Project', icon: Video },
            ...(canEliminate ? [{ id: 'faculty', label: 'Faculty / HOD Controls', icon: ShieldAlert }] : [])
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-white shadow-sm rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: OVERVIEW & TEAM */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Leader Edit Toolbar */}
              {userIsLeader && !isCompleted && !isEliminated && (
                <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
                  <div className="flex items-center space-x-2 text-xs text-blue-900">
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">
                      You are the registered Group Leader. You can edit allowed group details and manage team members.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (!isEditingOverview) {
                        setEditTitle(group.projectTitle);
                        setEditProblem(group.realLifeProblem);
                        setEditApplication(group.realLifeApplication);
                      }
                      setIsEditingOverview(!isEditingOverview);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                  >
                    {isEditingOverview ? 'Cancel Editing' : 'Edit Details'}
                  </button>
                </div>
              )}

              {/* Real-Life Problem & Application Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Real-Life Problem */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Real-Life Problem Solved
                    </span>
                  </div>
                  {isEditingOverview ? (
                    <textarea
                      rows={4}
                      value={editProblem}
                      onChange={(e) => setEditProblem(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {group.realLifeProblem}
                    </p>
                  )}
                </div>

                {/* Real-Life Applications */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Real-Life Practical Applications
                    </span>
                  </div>
                  {isEditingOverview ? (
                    <textarea
                      rows={4}
                      value={editApplication}
                      onChange={(e) => setEditApplication(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {group.realLifeApplication}
                    </p>
                  )}
                </div>
              </div>

              {isEditingOverview && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveOverview}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}

              {/* Team Members Roster */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Project Team Members & Compulsory Roll Numbers
                    </h3>
                    <p className="text-xs text-slate-500">
                      Har member ka Roll No. compulsari h dalna. Member ko kam ya jyada keval Group Leader kar sakta h.
                    </p>
                  </div>

                  {userIsLeader && !isCompleted && !isEliminated && (
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  )}
                </div>

                {/* Add Member Form inline (Leader only) */}
                {showAddMember && (
                  <form onSubmit={handleAddMember} className="mb-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900">Add New Team Member (Leader Privilege)</span>
                      <button 
                        type="button" 
                        onClick={() => setShowAddMember(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {memberError && (
                      <p className="text-xs text-rose-600 font-semibold">{memberError}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Student Full Name *"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Roll Number * (Compulsory)"
                        value={newMemberRollNo}
                        onChange={(e) => setNewMemberRollNo(e.target.value)}
                        className="px-3 py-1.5 text-xs font-mono uppercase bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Role / Assigned Task"
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAddMember(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                      >
                        Save Member
                      </button>
                    </div>
                  </form>
                )}

                {/* Team Roster Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Compulsory Roll No.</th>
                        <th className="py-2.5 px-3">Assigned Responsibility</th>
                        {userIsLeader && !isCompleted && !isEliminated && (
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {/* Leader Row */}
                      <tr className="bg-blue-50/40">
                        <td className="py-2.5 px-3 font-bold text-blue-700">
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">
                            Leader
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {group.leader.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                          {group.leader.rollNo}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          Team Lead & System Architect ({group.leader.email || 'Contact Info Registered'})
                        </td>
                        {userIsLeader && !isCompleted && !isEliminated && (
                          <td className="py-2.5 px-3 text-right text-[11px] text-slate-400 italic">
                            Protected
                          </td>
                        )}
                      </tr>

                      {/* Members Rows */}
                      {(group.members || []).map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 font-medium text-slate-500">
                            Member
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {m.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                            {m.rollNo}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {m.role || 'Hardware / Software Specialist'}
                          </td>
                          {userIsLeader && !isCompleted && !isEliminated && (
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleRemoveMember(m.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 transition"
                                title="Remove member from team"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPONENTS INVENTORY & STRICT MANAGEMENT */}
          {activeTab === 'components' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Lab Rule Alert Bar */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-950 font-bold">
                    Strict Component Tracking Protocol (कम्पोनेंट नियम)
                  </strong>
                  <span>
                    Ek baar component add hone ke baad group use hata nahi sakta, keval naye add ya replace kar sakta hai. 
                    Components ko ELIMINATE keval Faculty ya HOD kar sakte hain. Sabhi actions ka audit log public rehta hai.
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Registered Components & Hardware Modules</h3>
                  <p className="text-xs text-slate-500">Complete bill of materials tracked by R&D lab store.</p>
                </div>

                {!isCompleted && !isEliminated && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowAddComponent(true)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Component</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Add Component Form Modal / Drawer */}
              {showAddComponent && (
                <form onSubmit={handleAddComponentSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Add New Component to Lab Roster</span>
                    <button type="button" onClick={() => setShowAddComponent(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Component Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. ESP32 Dev Board or LiDAR Sensor"
                        value={compName}
                        onChange={(e) => setCompName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={compQty}
                        onChange={(e) => setCompQty(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Specifications</label>
                      <input
                        type="text"
                        placeholder="e.g. 5V, 16MHz"
                        value={compSpecs}
                        onChange={(e) => setCompSpecs(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Purpose in Project *</label>
                    <input
                      type="text"
                      placeholder="e.g. Main telemetry and GPS waypoint transmitter"
                      value={compPurpose}
                      onChange={(e) => setCompPurpose(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddComponent(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                    >
                      Save Component
                    </button>
                  </div>
                </form>
              )}

              {/* Replace Component Modal Form */}
              {replaceTarget && (
                <form onSubmit={handleReplaceSubmit} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-950">Replace Component: {replaceTarget.name}</span>
                      <p className="text-[11px] text-amber-800">
                        The original component will be marked as REPLACED and preserved in history.
                      </p>
                    </div>
                    <button type="button" onClick={() => setReplaceTarget(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Replacement Component Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. BLHeli_S 35A ESC"
                        value={replacementName}
                        onChange={(e) => setReplacementName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={replacementQty}
                        onChange={(e) => setReplacementQty(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Specifications</label>
                      <input
                        type="text"
                        placeholder="e.g. 4S capable DShot600"
                        value={replacementSpecs}
                        onChange={(e) => setReplacementSpecs(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reason for Replacement *</label>
                    <input
                      type="text"
                      placeholder="e.g. Burnt during high-load test / Needed higher torque metal gear"
                      value={replacementReason}
                      onChange={(e) => setReplacementReason(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setReplaceTarget(null)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
                    >
                      Confirm Replacement
                    </button>
                  </div>
                </form>
              )}

              {/* Faculty Eliminate Component Form */}
              {eliminateTargetComp && (
                <form onSubmit={handleEliminateCompSubmit} className="p-4 bg-rose-50 rounded-2xl border border-rose-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-950">Faculty Authority: Eliminate Component</span>
                      <p className="text-[11px] text-rose-800">
                        Eliminating component: <strong>{eliminateTargetComp.name}</strong>. Provide official reason.
                      </p>
                    </div>
                    <button type="button" onClick={() => setEliminateTargetComp(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-rose-900 mb-1">Official Elimination Reason *</label>
                    <input
                      type="text"
                      placeholder="e.g. Safety hazard / Unapproved voltage rating / Disallowed hardware"
                      value={eliminateCompReason}
                      onChange={(e) => setEliminateCompReason(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-lg outline-none focus:border-rose-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEliminateTargetComp(null)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
                    >
                      Confirm Component Elimination
                    </button>
                  </div>
                </form>
              )}

              {/* Components Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Component Description</th>
                      <th className="py-2.5 px-3">Qty</th>
                      <th className="py-2.5 px-3">Purpose & Specs</th>
                      <th className="py-2.5 px-3">Logged By</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(group.components || []).map((comp) => {
                      const isActive = comp.status === 'active';
                      const isReplaced = comp.status === 'replaced';
                      const isCompEliminated = comp.status === 'eliminated';

                      return (
                        <tr key={comp.id} className={isReplaced ? 'bg-amber-50/30 opacity-75' : isCompEliminated ? 'bg-rose-50/40 opacity-70' : 'hover:bg-slate-50'}>
                          <td className="py-2.5 px-3">
                            {isActive ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            ) : isReplaced ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Replaced
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                Eliminated
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            <div>{comp.name}</div>
                            {comp.specs && (
                              <div className="text-[10px] text-slate-400 font-mono">{comp.specs}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                            {comp.qty}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                            {comp.purpose}
                            {comp.eliminatedReason && (
                              <div className="text-[10px] text-rose-600 font-medium">Reason: {comp.eliminatedReason}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {comp.addedBy}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="inline-flex items-center space-x-1 justify-end">
                              {/* Replace button (available for active components) */}
                              {isActive && !isCompleted && !isEliminated && (
                                <button
                                  type="button"
                                  onClick={() => setReplaceTarget(comp)}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1"
                                  title="Replace with an upgraded or alternate component"
                                >
                                  <RotateCw className="w-3 h-3" />
                                  <span>Replace</span>
                                </button>
                              )}

                              {/* Student delete restriction notice */}
                              {!canEliminate && isActive && (
                                <span className="text-[10px] text-slate-400 px-1 py-0.5 bg-slate-100 rounded" title="Students cannot delete components">
                                  No Delete
                                </span>
                              )}

                              {/* Faculty/HOD Eliminate Button */}
                              {canEliminate && isActive && (
                                <button
                                  type="button"
                                  onClick={() => setEliminateTargetComp(comp)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold flex items-center space-x-1"
                                  title="Faculty/HOD privilege: Eliminate component"
                                >
                                  <Trash2 className="w-3 h-3 text-rose-600" />
                                  <span>Eliminate</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Component Audit History Trail (Visible to all) */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Component Audit History (पब्लिक हिस्ट्री लॉग)
                </h4>
                <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-4 space-y-2.5 max-h-56 overflow-y-auto">
                  {(group.componentHistory || []).map((entry) => (
                    <div key={entry.id} className="text-xs p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            entry.action === 'ADDED' ? 'bg-blue-100 text-blue-800' :
                            entry.action === 'REPLACED' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {entry.action}
                          </span>
                          <span className="font-bold text-slate-800">{entry.componentName}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {entry.reason}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          By: <strong className="text-slate-600">{entry.authorName}</strong> ({entry.authorRole})
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {entry.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LAB ENTRY & EXIT TRACKER */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Lab Status & Action Card */}
              <div className="p-5 rounded-2xl border bg-gradient-to-r from-slate-900 to-dronacharya-900 text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300">
                    Live Lab Attendance Monitor
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <h3 className="text-lg font-bold">
                      {group.currentlyInLab ? 'Group is Currently Working in R&D Lab' : 'Group is Currently Checked-Out'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {canPerformLabAction 
                      ? 'Record entry and exit times for every lab session until project completion.' 
                      : 'Project is marked finished or eliminated. Lab entry is closed.'}
                  </p>
                </div>

                {canPerformLabAction && (
                  <div>
                    {group.currentlyInLab ? (
                      <button
                        onClick={() => setShowCheckOutModal(true)}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Check Out & Log Work Done</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowCheckInModal(true)}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg transition"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Check In to R&D Lab</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Check In Modal / Form */}
              {showCheckInModal && (
                <form onSubmit={handleCheckInSubmit} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950">Record Lab Entry (Check-In)</span>
                    <button type="button" onClick={() => setShowCheckInModal(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Session Activity Plan / Hardware Task *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Soldering motor shield, calibrating sensors, PID tuning..."
                      value={checkInActivity}
                      onChange={(e) => setCheckInActivity(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Select Members Present for this Lab Session:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center space-x-1.5 text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAttendees.includes(group.leader.name)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedAttendees([...selectedAttendees, group.leader.name]);
                            else setSelectedAttendees(selectedAttendees.filter(n => n !== group.leader.name));
                          }}
                        />
                        <span className="font-semibold">{group.leader.name} (Leader)</span>
                      </label>

                      {(group.members || []).map((m) => (
                        <label key={m.id} className="inline-flex items-center space-x-1.5 text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAttendees.includes(m.name)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedAttendees([...selectedAttendees, m.name]);
                              else setSelectedAttendees(selectedAttendees.filter(n => n !== m.name));
                            }}
                          />
                          <span>{m.name} ({m.rollNo})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCheckInModal(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                    >
                      Stamp Lab Entry Time Now
                    </button>
                  </div>
                </form>
              )}

              {/* Check Out Modal / Form */}
              {showCheckOutModal && (
                <form onSubmit={handleCheckOutSubmit} className="p-4 bg-amber-50/60 rounded-2xl border border-amber-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950">Record Lab Exit (Check-Out)</span>
                    <button type="button" onClick={() => setShowCheckOutModal(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Work Performed Summary / Results Achieved *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Successfully calibrated Pixhawk compass sensor, completed solder joints on ESC power board, zero thermal warnings."
                      value={checkOutNotes}
                      onChange={(e) => setCheckOutNotes(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-amber-500 resize-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCheckOutModal(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-slate-950 rounded-lg shadow-sm"
                    >
                      Stamp Exit Time & Close Session
                    </button>
                  </div>
                </form>
              )}

              {/* Attendance Log Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Lab Attendance & Hours Log Table (लैब में आने-जाने का रिकॉर्ड)
                </h4>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Entry Time (आए थे)</th>
                        <th className="py-2.5 px-3">Exit Time (गए थे)</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Activity & Work Performed</th>
                        <th className="py-2.5 px-3">Attended By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(group.labAttendance || []).map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                            {att.date}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-700 font-mono font-bold whitespace-nowrap">
                            {att.checkInTime}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                            {att.checkOutTime ? (
                              <span className="text-slate-700">{att.checkOutTime}</span>
                            ) : (
                              <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                                Active Session
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {att.hours ? `${att.hours} hrs` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-sm">
                            {att.activity}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {(att.attendedMembers || []).join(', ')}
                          </td>
                        </tr>
                      ))}

                      {(!group.labAttendance || group.labAttendance.length === 0) && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">
                            No lab sessions recorded yet. Click "Check In to R&D Lab" when entering.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECT COMPLETION & VIDEO DEMONSTRATION */}
          {activeTab === 'video' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Project Status Banner */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Project Completion Status
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    {isCompleted ? (
                      <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Project Officially Completed & Documented
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-slate-800">
                        Prototyping In-Progress (Not Yet Submitted as Complete)
                      </span>
                    )}
                  </div>
                </div>

                {!isCompleted && !isEliminated && userIsLeader && (
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    Mark Project Completed & Add Video
                  </button>
                )}
              </div>

              {/* Complete Project Form */}
              {showCompleteModal && (
                <form onSubmit={handleCompleteSubmit} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-950">Submit Project for Final Completion</span>
                      <p className="text-[11px] text-emerald-800">
                        Upload or link project demo video. Lab entry will be finalized and PDF report unlocked.
                      </p>
                    </div>
                    <button type="button" onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Video Demonstration Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Autonomous AI Drone Flight Test & Obstacle Avoidance Demo"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Video URL / Embed Link (YouTube, Drive, or MP4) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://www.youtube.com/embed/YOUR_ID or direct MP4 link"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCompleteModal(false)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                    >
                      Complete & Generate Final Summary
                    </button>
                  </div>
                </form>
              )}

              {/* Video Player Display */}
              {group.video ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
                  <div className="p-3 bg-slate-800 text-white flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-emerald-400" />
                      <span>{group.video.title || 'Project Demonstration Video'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Uploaded on {group.video.uploadedAt}
                    </span>
                  </div>

                  <div className="aspect-video w-full bg-black flex items-center justify-center">
                    {group.video.url?.includes('youtube') || group.video.url?.includes('embed') ? (
                      <iframe
                        src={group.video.url}
                        title="Demo Video"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        controls
                        src={group.video.url}
                        className="w-full h-full max-h-[420px] object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                  <Video className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Showcase Video Uploaded Yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    When the team completes project testing, the Group Leader can upload/link the hardware demonstration video here.
                  </p>
                </div>
              )}

              {/* Generate PDF summary box */}
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-blue-950">
                    Official College Summary Report (PDF)
                  </h4>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Includes leader & member roll numbers, real-life problem statement, all components used, and complete lab entry/exit history.
                  </p>
                </div>
                <button
                  onClick={() => generateProjectSummaryPdf(group)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition hover:scale-[1.02]"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download PDF Report Now</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: FACULTY & HOD CONTROLS */}
          {activeTab === 'faculty' && canEliminate && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="p-4 bg-amber-500/10 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Faculty / HOD Special Administration Panel</strong>
                  <span>
                    As an authorized Faculty Member or Head of Department, you hold apex rights to eliminate any non-compliant group, eliminate components, or reverse administrative actions.
                  </span>
                </div>
              </div>

              {/* Eliminate Group Section */}
              <div className="p-5 border border-rose-200 bg-rose-50/50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-rose-950">Group Elimination Authority</h4>
                    <p className="text-xs text-rose-700">
                      Eliminate this group from active R&D lab prototyping (e.g. plagiarism, ethical breach, or failure).
                    </p>
                  </div>

                  {isEliminated ? (
                    <button
                      onClick={() => onRestoreGroup(group.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      Restore Group to Active
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowEliminateGroupModal(true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      Eliminate Group
                    </button>
                  )}
                </div>

                {showEliminateGroupModal && (
                  <form onSubmit={handleEliminateGroupSubmit} className="pt-3 border-t border-rose-200 space-y-3">
                    <label className="block text-xs font-semibold text-rose-900">
                      Mandatory Reason for Group Elimination *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Failed mid-term progress review / Non-attendance in lab"
                      value={groupEliminationReason}
                      onChange={(e) => setGroupEliminationReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-rose-300 rounded-lg outline-none focus:border-rose-600"
                      required
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowEliminateGroupModal(false)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
                      >
                        Confirm Elimination
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-mono">Group ID: {group.id}</span>
            <span>•</span>
            <span>Registered: {group.createdAt}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
