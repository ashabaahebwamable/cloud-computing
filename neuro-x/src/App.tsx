import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('neurox_user');
    const token = localStorage.getItem('neurox_token');
    return (storedUser && token) ? JSON.parse(storedUser) : null;
  });

  const handleLogin = (userData: any, token: string) => {
    localStorage.setItem('neurox_user', JSON.stringify(userData));
    localStorage.setItem('neurox_token', token);
    setUser(userData);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('neurox_token');
    if (token) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('neurox_user');
    localStorage.removeItem('neurox_token');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30 selection:text-blue-400">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/*" 
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
        </Routes>
        <Toaster position="top-right" theme="dark" richColors />
      </div>
    </Router>
  );
}
