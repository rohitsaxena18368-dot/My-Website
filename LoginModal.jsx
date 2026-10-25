import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.jpg';
import { 
  X, 
  ShieldCheck, 
  GraduationCap, 
  Award, 
  UserCheck, 
  AlertCircle, 
  Building2, 
  Briefcase, 
  Lock,
  ChevronRight
} from 'lucide-react';

export const LoginModal = ({ isOpen, onClose }) => {
  const { loginCustom } = useAuth();

  // Form State
  const [role, setRole] = useState('leader');
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [department, setDepartment] = useState('Department of Electronics & Communication Engg.');
  const [designation, setDesignation] = useState('Student Researcher (B.Tech Final Year)');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    if (selectedRole === 'hod') {
      setDesignation('Head of Department (HOD) & Innovation Board Chair');
      setDepartment('Department of Research & Innovation / ECE');
    } else if (selectedRole === 'faculty') {
      setDesignation('Associate Professor & R&D Lab Project Guide');
      setDepartment('Department of Electronics & Communication Engg.');
    } else if (selectedRole === 'leader') {
      setDesignation('Student Project Lead (Hardware & System Architect)');
      setDepartment('Department of Electronics & Communication Engg.');
    } else if (selectedRole === 'member') {
      setDesignation('Research Team Member (Student)');
      setDepartment('Department of Computer Science & Engg.');
    } else {
      setDesignation('Academic Observer / Student Viewer');
      setDepartment('General Academic Section');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Official Full Name is required as per University Academic Records.');
      return;
    }

    // Roll number is compulsory for students
    if ((role === 'leader' || role === 'member') && !rollNo.trim()) {
      setError('Student Roll Number is strictly COMPULSORY (अनिवार्य).');
      return;
    }

    // Employee ID is compulsory for faculty/hod
    if ((role === 'faculty' || role === 'hod') && !idNumber.trim()) {
      setError('Official Faculty / Employee ID is strictly required for administrative verification.');
      return;
    }

    loginCustom({
      name: name.trim(),
      rollNo: (role === 'leader' || role === 'member') ? rollNo.trim().toUpperCase() : null,
      idNumber: (role === 'faculty' || role === 'hod') ? idNumber.trim().toUpperCase() : null,
      role,
      department: department.trim(),
      designation: designation.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Formal Institutional Header Bar */}
        <div className="bg-[#071f3a] text-white p-6 relative border-b-2 border-[#d4af37]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-blue-400 shadow-md flex-shrink-0">
              <img src={logoImg} alt="DRONACHARYA Emblem" className="w-full h-full object-cover rounded-full bg-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                Institutional Academic Portal
              </span>
              <h2 className="text-lg font-bold font-display tracking-tight text-white">
                DRONACHARYA R&D LAB MANAGMENT
              </h2>
              <p className="text-xs text-slate-300">
                Formal Identity Authentication & Credential Verification
              </p>
            </div>
          </div>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Role Selector Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Authorized Institutional Role <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { 
                  id: 'hod', 
                  title: 'Head of Department (HOD)', 
                  desc: 'Executive & Departmental Elimination Authority', 
                  icon: Award 
                },
                { 
                  id: 'faculty', 
                  title: 'Faculty Project Guide', 
                  desc: 'Academic Supervisor & Lab Evaluation', 
                  icon: ShieldCheck 
                },
                { 
                  id: 'leader', 
                  title: 'Research Group Leader', 
                  desc: 'Project Lead (Manages Members & Requisitions)', 
                  icon: GraduationCap 
                },
                { 
                  id: 'member', 
                  title: 'Research Team Member', 
                  desc: 'Hardware Prototyping & Lab Attendance', 
                  icon: UserCheck 
                }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRoleChange(item.id)}
                    className={`p-2.5 text-left rounded-xl border transition-all flex items-start space-x-2.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Full Name <span className="text-rose-500">* (As per College Register)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. Sandeep Sharma / Prof. R.K. Verma / Rohit Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition"
              required
            />
          </div>

          {/* Roll Number or Employee ID */}
          {(role === 'leader' || role === 'member') ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  College Roll Number <span className="text-rose-500">* (Compulsory)</span>
                </label>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Mandatory Validation
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g. 21ECE045"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Your roll number ensures project verification and single-active-group enforcement.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Faculty / Employee ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. EMP-HOD-001 or EMP-FAC-014"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition"
                required
              />
            </div>
          )}

          {/* Academic Department & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department / Discipline
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Academic Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#071f3a] hover:bg-[#0b2d52] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Verify Institutional Credentials & Enter Portal</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Official Access Register • Dronacharya College of Engineering
        </div>
      </div>
    </div>
  );
};
