import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, Database, LineChart, ShieldCheck, Cpu, Sparkles, ArrowRight, 
  Lock, User, Code2, Server, Upload, Wand2, Search, CheckCircle2, 
  Menu, X, GitPullRequest, ArrowDown, ChevronRight
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans selection:bg-indigo-500/30">
      {/* 1. HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-glass)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
              <LineChart className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              DataNexus <span className="text-indigo-500 font-medium">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">How It Works</a>
            <a href="#technology" className="hover:text-[var(--text-primary)] transition-colors">Technology</a>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary py-2 px-4 shadow-[0_0_10px_rgba(99,102,241,0.2)] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-[var(--bg-surface)] border-b border-[var(--border)] p-4 flex flex-col gap-4 shadow-xl">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[var(--text-secondary)] font-medium p-2 hover:bg-[var(--bg-hover)] rounded-lg">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-[var(--text-secondary)] font-medium p-2 hover:bg-[var(--bg-hover)] rounded-lg">How It Works</a>
            <a href="#technology" onClick={() => setMobileMenuOpen(false)} className="text-[var(--text-secondary)] font-medium p-2 hover:bg-[var(--bg-hover)] rounded-lg">Technology</a>
            <div className="h-px w-full bg-[var(--border)] my-2" />
            <Link to="/login" className="text-[var(--text-secondary)] font-medium p-2 text-center border border-[var(--border)] rounded-lg">Sign In</Link>
            <Link to="/register" className="btn-primary w-full py-3 justify-center">Get Started</Link>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="badge badge-indigo mb-8 z-10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Data Analytics</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 max-w-5xl z-10 leading-[1.1]">
          Turn Your Data <br className="hidden sm:block" />
          Into <span className="text-gradient">Intelligent Decisions.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mb-10 leading-relaxed z-10">
          Upload your data, let AI clean and analyze it, and ask questions in natural language. DataNexus AI combines AI agents, SQL, and PostgreSQL to turn raw data into actionable insights.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 z-10 w-full sm:w-auto">
          <Link to="/register" className="btn-primary py-4 px-8 text-base w-full sm:w-auto shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
            Get Started <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <a href="#how-it-works" className="btn-secondary py-4 px-8 text-base w-full sm:w-auto">
            See How It Works
          </a>
        </div>
        
        <p className="text-sm text-[var(--text-muted)] flex items-center justify-center gap-2 flex-wrap z-10">
          Powered by LangGraph &bull; Groq &bull; FastAPI &bull; PostgreSQL
        </p>
      </section>

      {/* 3. HERO PRODUCT PREVIEW */}
      <section className="max-w-6xl mx-auto px-6 mb-32 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="rounded-2xl border border-[var(--border-mid)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden flex flex-col relative z-10">
          {/* Browser Header */}
          <div className="h-12 border-b border-[var(--border)] bg-[var(--bg-card)] flex items-center px-4 gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/90" />
              <div className="w-3 h-3 rounded-full bg-amber-400/90" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/90" />
            </div>
            <div className="mx-auto text-xs text-[var(--text-muted)] font-medium flex items-center gap-2 bg-[var(--bg-base)] px-4 py-1.5 rounded-md border border-[var(--border)]">
              <Lock className="w-3 h-3" /> datanexus.ai/analyst
            </div>
            <div className="w-12" /> {/* Spacer for centering */}
          </div>
          
          {/* Fake Dashboard Body */}
          <div className="p-0 sm:p-6 bg-[var(--bg-base)] flex gap-6">
            {/* Fake Sidebar */}
            <div className="hidden md:block w-64 border-r border-[var(--border)] pr-6 space-y-2 py-4 sm:py-0">
              <div className="h-10 bg-[var(--bg-hover)] rounded-xl flex items-center px-3 gap-3 border border-[var(--border-mid)]">
                 <Brain className="w-4 h-4 text-indigo-500" />
                 <span className="text-sm font-medium">AI Analyst</span>
              </div>
              <div className="h-10 rounded-xl flex items-center px-3 gap-3 text-[var(--text-muted)]">
                 <Database className="w-4 h-4" />
                 <span className="text-sm font-medium">Data Preparation</span>
              </div>
              <div className="h-10 rounded-xl flex items-center px-3 gap-3 text-[var(--text-muted)]">
                 <Server className="w-4 h-4" />
                 <span className="text-sm font-medium">Architecture</span>
              </div>
            </div>
            
            {/* Fake Main Content */}
            <div className="flex-1 space-y-6 p-4 sm:p-0">
               {/* Stats Row */}
               <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { l: 'Total Users', c: 'bg-blue-500/10' },
                    { l: 'Vehicles', c: 'bg-violet-500/10' },
                    { l: 'Total Rides', c: 'bg-indigo-500/10' },
                    { l: 'Revenue', c: 'bg-emerald-500/10' },
                    { l: 'Avg Rating', c: 'bg-amber-500/10' },
                    { l: 'ETL Rows', c: 'bg-pink-500/10' }
                  ].map((s, i) => (
                    <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3 flex flex-col gap-2">
                       <div className={`w-7 h-7 rounded-lg ${s.c} flex items-center justify-center`} />
                       <div className="h-4 w-16 bg-[var(--text-primary)] opacity-80 rounded" />
                       <div className="text-[10px] text-[var(--text-muted)]">{s.l}</div>
                    </div>
                  ))}
               </div>
               
               {/* Fake Chat Box */}
               <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl px-5 py-3 text-sm">
                      What is the total revenue?
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Brain className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="text-sm leading-relaxed">
                        Based on the data, the total revenue is <span className="font-bold text-emerald-500">₹26,473</span>. 
                        This spans across all completed rides in the current dataset.
                      </div>
                      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden max-w-lg">
                        <div className="px-4 py-2 border-b border-[var(--border)] flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-hover)]">
                           <Code2 className="w-3.5 h-3.5" /> Generated SQL
                        </div>
                        <pre className="p-4 text-xs font-mono m-0 overflow-x-auto" style={{ color: '#059669' }}>
<span className="text-indigo-500 font-bold">SELECT</span> SUM(revenue)
<span className="text-indigo-500 font-bold">FROM</span> rides;
                        </pre>
                      </div>
                    </div>
                  </div>
               </div>
               
               {/* Fake Input */}
               <div className="relative rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-mid)] p-4 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-400 ml-2 hidden sm:block" />
                  <div className="flex-1 text-sm text-[var(--text-dim)] pl-2">Ask a question about your data...</div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VALUE PROPOSITION */}
      <section className="py-24 px-6 bg-[var(--bg-surface)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">From Raw Data to Real Insights</h2>
          
          <div className="flex flex-col md:flex-row justify-center items-start gap-8 md:gap-4 relative">
            {/* Steps */}
            {[
              { num: '01', icon: Upload, title: 'Upload', desc: 'Securely upload your raw CSV data files.' },
              { num: '02', icon: Wand2, title: 'Clean', desc: 'AI-assisted ETL processing prepares the data.' },
              { num: '03', icon: Search, title: 'Analyze', desc: 'Ask questions using natural language.' },
              { num: '04', icon: CheckCircle2, title: 'Decide', desc: 'Get explainable, data-backed insights.' }
            ].map((step, i) => (
              <React.Fragment key={step.num}>
                <div className="flex-1 flex flex-col items-center text-center relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border)] flex items-center justify-center mb-6 relative group hover:border-indigo-500/50 transition-colors">
                    <span className="absolute -top-3 -left-3 text-[10px] font-bold bg-[var(--bg-base)] border border-[var(--border)] px-2 py-1 rounded-md text-[var(--text-muted)]">
                      {step.num}
                    </span>
                    <step.icon className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed px-4">{step.desc}</p>
                </div>
                {/* Arrow connector */}
                {i < 3 && (
                  <div className="hidden md:flex flex-col justify-center h-16 pt-2">
                    <ChevronRight className="w-5 h-5 text-[var(--border-mid)]" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURES SECTION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to understand your data</h2>
          <p className="text-[var(--text-secondary)]">A complete toolkit designed for intelligent analytics.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: 'AI Data Analyst', desc: 'Ask questions about your data using natural language, just like chatting with a human.' },
            { icon: Database, title: 'Automated ETL', desc: 'Upload CSV files and automatically clean, validate, and prepare your data for analysis.' },
            { icon: Code2, title: 'Natural Language to SQL', desc: 'Convert business questions into accurate SQL queries automatically behind the scenes.' },
            { icon: LineChart, title: 'Explainable Insights', desc: 'Understand not only the answer, but how the AI reached it with execution traces.' },
            { icon: Server, title: 'PostgreSQL Integration', desc: 'Persist cleaned data in a reliable, high-performance PostgreSQL database.' },
            { icon: ShieldCheck, title: 'Secure Architecture', desc: 'Parameterized queries, controlled operations, and protected database workflows.' },
          ].map((f, i) => (
            <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] p-6 rounded-2xl hover:border-indigo-500/30 hover:bg-[var(--bg-hover)] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold mb-3">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 bg-[var(--bg-surface)] border-y border-[var(--border)] overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">How DataNexus AI Works</h2>
          
          <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl p-8 relative">
            <div className="flex flex-col items-center">
              {[
                { title: 'CSV Upload', icon: Upload },
                { title: 'ETL Agent & Data Cleaning', icon: Wand2 },
                { title: 'PostgreSQL Database', icon: Database },
                { title: 'Natural Language Query', icon: Search },
                { title: 'SQL Generation & Execution', icon: Code2 },
                { title: 'AI Insight Generation', icon: Brain }
              ].map((step, i, arr) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-mid)] px-6 py-3 rounded-xl w-full max-w-sm shadow-sm relative z-10">
                    <step.icon className="w-5 h-5 text-indigo-500" />
                    <span className="font-semibold text-sm">{step.title}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="h-8 w-px bg-indigo-500/30 my-1 relative z-0 flex flex-col items-center justify-center">
                       <ArrowDown className="w-3 h-3 text-indigo-500/50 absolute" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <div className="mt-10">
              <Link to="/architecture" className="btn-secondary">
                Explore the Architecture <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TECHNOLOGY SECTION */}
      <section id="technology" className="py-24 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Built With Modern Technologies</h2>
        <p className="text-[var(--text-secondary)] mb-12">Leveraging the best of modern AI and data engineering.</p>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {[
            { name: 'LangGraph', desc: 'Agent Orchestration' },
            { name: 'Groq', desc: 'Lightning Fast LLM' },
            { name: 'FastAPI', desc: 'High-Perf Backend' },
            { name: 'PostgreSQL', desc: 'Relational Database' },
            { name: 'React', desc: 'Interactive UI' },
            { name: 'TypeScript', desc: 'Type Safety' },
            { name: 'SQL', desc: 'Data Querying' },
            { name: 'Python', desc: 'Data Processing' }
          ].map(tech => (
            <div key={tech.name} className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-5 py-4 min-w-[160px] hover:border-indigo-500/40 transition-colors">
              <span className="font-bold text-sm mb-1">{tech.name}</span>
              <span className="text-xs text-[var(--text-muted)]">{tech.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 8. SECURITY / TRUST SECTION */}
      <section className="py-16 px-6 bg-[var(--bg-surface)] border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Built With Data Safety in Mind</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              DataNexus AI integrates strict application-level guardrails to ensure your analytics environment remains stable and secure.
            </p>
          </div>
          <div className="flex-1 w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-2xl p-6">
            <ul className="space-y-4">
              {[
                'Parameterized SQL queries',
                'Controlled ETL operations',
                'Strict CSV validation',
                'No arbitrary code execution',
                'Secure PostgreSQL persistence',
                'Protected application routes'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/5 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Ask Your Data Anything?</h2>
          <p className="text-lg text-[var(--text-secondary)] mb-10">
            Upload your dataset and start discovering insights with DataNexus AI today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary py-4 px-10 text-base shadow-[0_0_20px_rgba(99,102,241,0.3)] w-full sm:w-auto">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary py-4 px-10 text-base w-full sm:w-auto">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-[var(--bg-surface)] border-t border-[var(--border)] pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <LineChart className="w-5 h-5 text-indigo-500" />
              <span className="text-lg font-bold tracking-tight">
                DataNexus <span className="text-indigo-500">AI</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm">
              AI-powered data analytics for smarter decisions. Turn raw business data into intelligent, explainable insights using AI, SQL, and PostgreSQL.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              <li><a href="#features" className="hover:text-indigo-500 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-indigo-500 transition-colors">How It Works</a></li>
              <li><a href="#technology" className="hover:text-indigo-500 transition-colors">Technology</a></li>
              <li><Link to="/architecture" className="hover:text-indigo-500 transition-colors">Architecture</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              <li><Link to="/login" className="hover:text-indigo-500 transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-indigo-500 transition-colors">Get Started</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-[var(--border)] text-sm text-[var(--text-muted)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 DataNexus AI. Built for intelligent data analysis.</p>
        </div>
      </footer>
    </div>
  );
}
