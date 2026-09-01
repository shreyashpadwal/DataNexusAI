import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedLayout from './layouts/ProtectedLayout';
import Dashboard from './pages/Dashboard';
import DataDashboard from './pages/DataDashboard';
import ETL from './pages/ETL';
import Architecture from './pages/Architecture';
import QueryHistoryPage from './pages/QueryHistoryPage';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import Contact from './pages/Contact';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center text-[var(--text-muted)] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Checking authentication...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center text-[var(--text-muted)] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/analyst" replace />;
  }
  
  return <>{children}</>;
}

function ETLWrapper() {
  const navigate = useNavigate();
  return <ETL onNavigateToAnalyst={() => navigate('/analyst')} />;
}

import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
              <Route path="analyst" element={<Dashboard />} />
              <Route path="data-preparation" element={<ETLWrapper />} />
              <Route path="data-dashboard" element={<DataDashboard />} />
              <Route path="architecture" element={<Architecture />} />
              <Route path="query-history" element={<QueryHistoryPage />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              
              {/* Fallbacks */}
              <Route path="dashboard" element={<Navigate to="/analyst" replace />} />
              <Route path="etl" element={<Navigate to="/data-preparation" replace />} />
              <Route path="*" element={<Navigate to="/analyst" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
