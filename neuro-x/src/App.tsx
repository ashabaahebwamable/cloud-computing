import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPage from './pages/LoginPage.js';
import RadiologistDashboard from './pages/RadiologistDashboard.js';
import SpecialistDashboard from './pages/SpecialistDashboard.js';
import { User } from './types/index.js';
import { logout } from './api/client.js';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('neurox_user');
      const token = localStorage.getItem('neurox_token');
      return storedUser && token ? (JSON.parse(storedUser) as User) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (userData: User, token: string, shiftId: number) => {
    const userWithTime: User = { ...userData, loginTime: new Date().toISOString() };
    localStorage.setItem('neurox_user', JSON.stringify(userWithTime));
    localStorage.setItem('neurox_token', token);
    localStorage.setItem('neurox_shift_id', String(shiftId));
    setUser(userWithTime);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore logout errors — clear session regardless
    }
    localStorage.removeItem('neurox_user');
    localStorage.removeItem('neurox_token');
    localStorage.removeItem('neurox_shift_id');
    setUser(null);
  };

  const getDashboardPath = (u: User) => {
    return u.role === 'Radiologist' ? '/radiologist' : '/specialist';
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0f1a] text-slate-50 selection:bg-cyan-500/30 selection:text-cyan-200">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Login */}
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to={getDashboardPath(user)} replace />
                ) : (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LoginPage onLogin={handleLogin} />
                  </motion.div>
                )
              }
            />

            {/* Radiologist dashboard */}
            <Route
              path="/radiologist"
              element={
                user ? (
                  user.role === 'Radiologist' ? (
                    <motion.div
                      key="radiologist"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RadiologistDashboard user={user} onLogout={handleLogout} />
                    </motion.div>
                  ) : (
                    <Navigate to="/specialist" replace />
                  )
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Specialist dashboard (Doctor / Anesthesiologist) */}
            <Route
              path="/specialist"
              element={
                user ? (
                  user.role !== 'Radiologist' ? (
                    <motion.div
                      key="specialist"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SpecialistDashboard user={user} onLogout={handleLogout} />
                    </motion.div>
                  ) : (
                    <Navigate to="/radiologist" replace />
                  )
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Catch-all */}
            <Route
              path="*"
              element={
                user ? (
                  <Navigate to={getDashboardPath(user)} replace />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </AnimatePresence>

        <Toaster position="top-right" theme="dark" richColors />
      </div>
    </Router>
  );
}
