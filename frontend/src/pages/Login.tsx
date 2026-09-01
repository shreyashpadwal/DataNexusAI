import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { login } from '../api/api';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { loginState } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      loginState(res.access_token, { id: 0, name: '', email: '' }); // Will be synced by getMe later, or we can await getMe here
      navigate('/analyst');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('An error occurred during sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col justify-center items-center p-6 selection:bg-indigo-500/30 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-transform">
            <LineChart className="w-5 h-5 text-[var(--text-primary)]" />
          </div>
          <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">DataNexus <span className="text-indigo-400 font-medium">AI</span></span>
        </Link>
        
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Welcome back</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Sign in to continue to your dashboard</p>
          
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-mid)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-base)] border border-[var(--border-mid)] rounded-xl pl-4 pr-12 py-3 text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[var(--text-primary)] font-medium transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)] mt-2 flex justify-center items-center h-12 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
