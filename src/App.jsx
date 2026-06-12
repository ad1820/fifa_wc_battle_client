import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MatchArena from './pages/MatchArena';
import Leaderboard from './pages/Leaderboard';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const ProtectedRoute = ({ children }) => {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flex: 1 }}>
            <AiOutlineLoading3Quarters size={48} color="var(--primary-neon)" className="spin" />
        </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/match" 
        element={
          <ProtectedRoute>
            <MatchArena />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/leaderboard" 
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
