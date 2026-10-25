import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => storage.getCurrentUser());

  useEffect(() => {
    storage.setCurrentUser(currentUser);
  }, [currentUser]);

  const logout = () => {
    setCurrentUser(null);
    storage.setCurrentUser(null);
  };

  const loginCustom = ({ name, rollNo, role, idNumber, department, designation }) => {
    const roleLabels = {
      hod: 'Head of Department (HOD)',
      faculty: 'Faculty Project Guide / Lab In-Charge',
      leader: 'Project Group Leader',
      member: 'Research Team Member',
      guest: 'Academic Observer / Viewer'
    };

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      role: role,
      roleLabel: roleLabels[role] || 'Institutional User',
      rollNo: (role === 'leader' || role === 'member') ? rollNo?.trim().toUpperCase() : null,
      idNumber: (role === 'faculty' || role === 'hod') ? idNumber?.trim().toUpperCase() : null,
      department: department?.trim() || 'Department of Research & Innovation',
      designation: designation?.trim() || (role === 'hod' ? 'Head of Department' : role === 'faculty' ? 'Associate Professor' : 'Student Researcher'),
      canEliminateGroups: role === 'hod' || role === 'faculty',
      canEliminateComponents: role === 'hod' || role === 'faculty',
      authenticatedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    };

    setCurrentUser(newUser);
    return newUser;
  };

  const isAuthenticated = !!currentUser;
  const isHOD = currentUser?.role === 'hod';
  const isFaculty = currentUser?.role === 'faculty' || currentUser?.role === 'hod';
  const canEliminate = isFaculty;

  const isLeaderOf = (group) => {
    if (!group || !currentUser) return false;
    if (currentUser.role !== 'leader') return false;
    if (currentUser.rollNo && group.leader?.rollNo && currentUser.rollNo.toUpperCase() === group.leader.rollNo.toUpperCase()) {
      return true;
    }
    if (currentUser.name && group.leader?.name && currentUser.name.trim().toLowerCase() === group.leader.name.trim().toLowerCase()) {
      return true;
    }
    return false;
  };

  const isMemberOf = (group) => {
    if (!group || !currentUser) return false;
    if (isLeaderOf(group)) return true;
    if (!currentUser.rollNo) return false;
    return (group.members || []).some(
      (m) => m.rollNo && m.rollNo.toUpperCase() === currentUser.rollNo.toUpperCase()
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        logout,
        loginCustom,
        isHOD,
        isFaculty,
        canEliminate,
        isLeaderOf,
        isMemberOf
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
