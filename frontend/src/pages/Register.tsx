import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LineChart, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { register } from '../api/api';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An error occurred during registration');
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
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Create an account</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Start exploring your data with AI</p>
          
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Account created successfully. Please sign in.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-mid)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="John Doe"
                required
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-[var(--bg-base)] border border-[var(--border-mid)] rounded-xl pl-4 pr-12 py-3 text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[var(--text-primary)] font-medium transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)] mt-2 flex justify-center items-center h-12 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
