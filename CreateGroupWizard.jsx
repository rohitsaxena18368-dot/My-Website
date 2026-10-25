import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import logoImg from '../assets/logo.jpg';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  UserCheck, 
  Layers, 
  HelpCircle, 
  Cpu, 
  Users, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  Sparkles,
  Lock
} from 'lucide-react';

export const CreateGroupWizard = ({ isOpen, onClose, onGroupCreated }) => {
  const { currentUser } = useAuth();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [leaderName, setLeaderName] = useState(currentUser?.name || '');
  const [leaderRollNo, setLeaderRollNo] = useState(currentUser?.rollNo || '');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');

  const [projectTitle, setProjectTitle] = useState('');
  const [groupName, setGroupName] = useState('');

  const [realLifeProblem, setRealLifeProblem] = useState('');
  const [realLifeApplication, setRealLifeApplication] = useState('');

  // Team Members
  const [members, setMembers] = useState([
    { name: '', rollNo: '', role: 'Hardware & Sensor Lead' }
  ]);

  // Initial Components
  const [components, setComponents] = useState([
    { name: '', qty: 1, specs: '', purpose: '' }
  ]);

  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Member Management
  const addMemberRow = () => {
    setMembers([...members, { name: '', rollNo: '', role: 'Team Member' }]);
  };

  const removeMemberRow = (index) => {
    const updated = members.filter((_, idx) => idx !== index);
    setMembers(updated);
  };

  const updateMember = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  // Component Management
  const addComponentRow = () => {
    setComponents([...components, { name: '', qty: 1, specs: '', purpose: '' }]);
  };

  const removeInitialComponentRow = (index) => {
    const updated = components.filter((_, idx) => idx !== index);
    setComponents(updated);
  };

  const updateComponent = (index, field, value) => {
    const updated = [...components];
    updated[index][field] = value;
    setComponents(updated);
  };

  // Step Validation
  const validateStep = () => {
    setError('');

    if (step === 1) {
      if (!leaderName.trim()) {
        setError('Please enter Group Leader Full Name.');
        return false;
      }
      if (!leaderRollNo.trim()) {
        setError('Leader Roll Number is strictly COMPULSORY (अनिवार्य)!');
        return false;
      }

      // Check if Leader is enrolled in an incomplete group
      const leaderCheck = storage.checkMemberActiveGroup(leaderRollNo);
      if (leaderCheck.isEnrolled) {
        setError(
          `Leader (Roll No: ${leaderRollNo.toUpperCase()}) pehle se hi active group "${leaderCheck.groupName}" (${leaderCheck.projectTitle}) me registered hain! Jab tak wo project complete nahi ho jata, tab tak aap naya group create ya join nahi kar sakte.`
        );
        return false;
      }
    }

    if (step === 2) {
      if (!projectTitle.trim()) {
        setError('Please enter Project Title / Name.');
        return false;
      }
      if (!groupName.trim()) {
        setError('Please enter Group Name.');
        return false;
      }
    }

    if (step === 3) {
      if (!realLifeProblem.trim() || realLifeProblem.trim().length < 15) {
        setError('Please describe what real-life problem this project solves (minimum 15 characters).');
        return false;
      }
    }

    if (step === 4) {
      if (!realLifeApplication.trim() || realLifeApplication.trim().length < 15) {
        setError('Please describe the real-life applications and use cases (minimum 15 characters).');
        return false;
      }
    }

    if (step === 5) {
      const leaderCleanRoll = leaderRollNo.trim().toUpperCase();
      const seenRolls = [leaderCleanRoll];

      // Validate members: every member must have name and roll no, no duplicates, and no active enrollment elsewhere
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (!m.name.trim() && !m.rollNo.trim()) continue; // skip blank row

        if (m.name.trim() && !m.rollNo.trim()) {
          setError(`Member #${i + 1} (${m.name}) ka Roll Number compulsory hai! Please enter roll number.`);
          return false;
        }

        const mRoll = m.rollNo.trim().toUpperCase();

        if (mRoll === leaderCleanRoll) {
          setError(`Member #${i + 1} (${m.name}) ka Roll Number Leader ke Roll Number (${leaderCleanRoll}) se match kar raha hai! Duplicate roll number allowed nahi hai.`);
          return false;
        }

        if (seenRolls.includes(mRoll)) {
          setError(`Roll Number "${mRoll}" duplicate hai! Har member ka Roll Number unique hona chahiye.`);
          return false;
        }
        seenRolls.push(mRoll);

        // Strict Rule: Check if member is already enrolled in another incomplete group
        const memberCheck = storage.checkMemberActiveGroup(mRoll);
        if (memberCheck.isEnrolled) {
          setError(
            `Member "${m.name}" (Roll No: ${mRoll}) already active group "${memberCheck.groupName}" ka hissa hai! Jab tak pehla project complete nahi ho jata, tab tak ye dusre group me add nahi ho sakte.`
          );
          return false;
        }
      }
    }

    if (step === 6) {
      const validComps = components.filter(c => c.name.trim());
      if (validComps.length === 0) {
        setError('Please register at least 1 initial hardware/software component for the lab project.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    // Filter valid members
    const cleanMembers = members.filter(m => m.name.trim() && m.rollNo.trim());
    const cleanComponents = components.filter(c => c.name.trim());

    const leaderPayload = {
      name: leaderName.trim(),
      rollNo: leaderRollNo.trim().toUpperCase(),
      role: 'leader',
      roleLabel: 'Group Leader'
    };

    const groupPayload = {
      projectTitle: projectTitle.trim(),
      groupName: groupName.trim(),
      realLifeProblem: realLifeProblem.trim(),
      realLifeApplication: realLifeApplication.trim(),
      leaderEmail: leaderEmail.trim(),
      leaderPhone: leaderPhone.trim(),
      members: cleanMembers,
      components: cleanComponents
    };

    const result = onGroupCreated(groupPayload, leaderPayload);
    if (result && result.error) {
      setError(result.error);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-[#071f3a] text-white p-6 relative border-b-2 border-[#d4af37]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3.5 mb-3">
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-blue-400 shadow-md flex-shrink-0">
              <img src={logoImg} alt="DRONACHARYA Logo" className="w-full h-full object-cover rounded-full bg-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                Formal Project Registration • Step {step} of {totalSteps}
              </span>
              <h2 className="text-lg font-bold font-display text-white">
                DRONACHARYA R&D LAB MANAGMENT
              </h2>
              <p className="text-xs text-slate-300">
                Department of Research & Academic Innovation • Prototyping Ledger
              </p>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center space-x-1.5 mt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full flex-1 transition-all ${
                  i <= step ? 'bg-amber-400' : 'bg-white/20'
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {/* STEP 1: Leader Identification */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Step 1: Group Leader Information (ग्रुप लीडर की जानकारी)</h3>
                <p className="text-xs text-slate-500">Every project group must have a registered leader with a verified roll number.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Group Leader Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rohit Kumar"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      College Roll Number <span className="text-rose-500">* (Compulsory)</span>
                    </label>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded font-medium">
                      Mandatory
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 21ECE045"
                    value={leaderRollNo}
                    onChange={(e) => setLeaderRollNo(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    College Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="rohit.21ece045@dronacharya.ac.in"
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={leaderPhone}
                    onChange={(e) => setLeaderPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Strict Multi-Group Enrollment Rule Notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Group Enrollment Policy:</strong> Ek member ya leader ek samay me keval ek active project ka hissa ho sakta hai. Pehla group complete hone ke baad hi agle group me add ho sakte hain.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Project Title & Group Name */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Step 2: Project Title & Group Name (प्रोजेक्ट और ग्रुप का नाम)</h3>
                <p className="text-xs text-slate-500">Official identification for your R&D lab team.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous AI Drone for Disaster Search & Rescue"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Clear, technical title describing what your innovation delivers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Team / Group Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AeroDrona Innovators"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 3: Real Life Problem Solved */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Step 3: Real-Life Problem Statement (रियल लाइफ में क्या प्रॉब्लम सॉल्व कर रहा है)</h3>
                <p className="text-xs text-slate-500">Explain the core pain-point, challenge, or human problem your hardware project solves.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Problem Solved by the Project <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. During natural disasters like floods, earthquakes, and landslides, first responders cannot reach trapped victims quickly due to blocked roads and hazardous terrain, leading to critical delays in emergency medical supplies and search operations..."
                  value={realLifeProblem}
                  onChange={(e) => setRealLifeProblem(e.target.value)}
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Tip: Real-life problems are reviewed by Faculty and HOD during project approval and will be printed on the official summary report PDF.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Real Life Applications */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Step 4: Real-Life Application & Impact (रियल लाइफ एप्लीकेशन क्या है)</h3>
                <p className="text-xs text-slate-500">Specify where, by whom, and in which industry or society your project will be deployed.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Practical Real-Life Applications <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Disaster management authorities (NDRF/SDRF), remote medical emergency supply drops, military border surveillance, and post-cyclone survivor localization with thermal vision..."
                  value={realLifeApplication}
                  onChange={(e) => setRealLifeApplication(e.target.value)}
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none resize-none"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 5: Team Members & Compulsory Roll Numbers */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 5: Group Team Members (ग्रुप के सदस्य)</h3>
                  <p className="text-xs text-slate-500">
                    Leader keval members ko kam ya jyada kar sakega. Har member ka Roll No. compulsory hai.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addMemberRow}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>

              {/* Strict Multi-Group Enrollment Rule */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Verification:</strong> Agar koi member pehle se kisi doosre active project me enrolled hai, toh system use add nahi hone dega jab tak unka pehla project complete na ho jaye.
                </span>
              </div>

              {/* Leader card indicator */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                    L
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">{leaderName} (Leader)</span>
                    <span className="text-slate-400 font-mono ml-2">Roll: {leaderRollNo}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Team Leader
                </span>
              </div>

              {/* Members Rows */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {members.map((member, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Member #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeMemberRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <input
                          type="text"
                          placeholder="Member Full Name"
                          value={member.name}
                          onChange={(e) => updateMember(idx, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Roll No. (Compulsory)"
                          value={member.rollNo}
                          onChange={(e) => updateMember(idx, 'rollNo', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Role / Responsibility"
                          value={member.role}
                          onChange={(e) => updateMember(idx, 'role', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Initial Components Needed */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 6: Components Requisition (कंपोनेंट्स की लिस्ट)</h3>
                  <p className="text-xs text-slate-500">Register required sensors, microcontrollers, and hardware modules.</p>
                </div>
                <button
                  type="button"
                  onClick={addComponentRow}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Component</span>
                </button>
              </div>

              {/* STRICT RULE NOTICE */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">R&D Lab Protocol Notice:</span>
                  <p className="mt-0.5 text-amber-800">
                    Ek baar component add hone ke baad student ya leader use delete nahi kar sakta. Keval naye component add kar sakte hain ya replace kar sakte hain. Component ko eliminate keval Faculty ya HOD kar sakte hain.
                  </p>
                </div>
              </div>

              {/* Component Rows */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {components.map((comp, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Component #{idx + 1}</span>
                      {components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInitialComponentRow(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Component Name (e.g. Pixhawk 4 Controller)"
                          value={comp.name}
                          onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty (e.g. 1)"
                          value={comp.qty}
                          onChange={(e) => updateComponent(idx, 'qty', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Purpose / Specs"
                          value={comp.purpose}
                          onChange={(e) => updateComponent(idx, 'purpose', e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-1 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition hover:scale-[1.02]"
              >
                <span>Continue to Step {step + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center space-x-1 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 transition hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                <span>Register & Launch R&D Project</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
