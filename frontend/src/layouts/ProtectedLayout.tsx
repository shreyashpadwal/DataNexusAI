import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { BarChart2, Upload, GitBranch, Menu, X, Brain, Zap, LogOut,
         Clock, HelpCircle, Info, Mail, LayoutDashboard } from 'lucide-react'
import StatusBar from '../components/StatusBar'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

const NAV_GROUPS = [
  {
    label: 'ANALYTICS',
    items: [
      { id: '/analyst',          label: 'AI Analyst',      Icon: Brain,            sub: 'Natural language analytics' },
      { id: '/data-preparation', label: 'Data Preparation', Icon: Upload,           sub: 'CSV upload & processing' },
      { id: '/data-dashboard',   label: 'Dashboard',        Icon: LayoutDashboard,  sub: 'Metrics & visualizations' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: '/query-history',    label: 'Query History',   Icon: Clock,       sub: 'Recent AI queries' },
      { id: '/architecture',     label: 'Architecture',     Icon: GitBranch,   sub: 'System design & stack' },
    ],
  },
  {
    label: 'INFO',
    items: [
      { id: '/how-it-works',     label: 'How It Works',    Icon: HelpCircle,  sub: 'Pipeline walkthrough' },
      { id: '/about',            label: 'About',           Icon: Info,        sub: 'About DataNexus AI' },
      { id: '/contact',          label: 'Contact',         Icon: Mail,        sub: 'Feedback & connect' },
    ],
  },
]

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/analyst':          { title: 'AI Analyst',         subtitle: 'Ask questions about your data and get instant, explainable insights.' },
  '/data-preparation': { title: 'Data Preparation',   subtitle: 'Upload CSV files and process them through the ETL Agent pipeline.' },
  '/data-dashboard':   { title: 'Data Dashboard',     subtitle: 'Visual overview of your PostgreSQL data — metrics, charts, and insights.' },
  '/architecture':     { title: 'System Architecture', subtitle: 'How DataNexus AI works — tech stack, data flow, and security controls.' },
  '/query-history':    { title: 'Query History',       subtitle: 'Browse, search, and replay your recent AI Analyst queries.' },
  '/how-it-works':     { title: 'How It Works',        subtitle: 'Step-by-step walkthrough of the DataNexus AI pipeline.' },
  '/about':            { title: 'About',               subtitle: 'About DataNexus AI — AI-powered analytics platform.' },
  '/contact':          { title: 'Contact',             subtitle: 'Get in touch or send feedback about DataNexus AI.' },
}

export default function ProtectedLayout() {
  const [sidebarOpen, setSidebar] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  
  const currentPath = location.pathname
  const meta = PAGE_META[currentPath] || PAGE_META['/analyst']

  const handleNav = (path: string) => {
    navigate(path)
    setSidebar(false)
  }

  // Get user initials
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* ── Mobile overlay ───────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm sm:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className={`
        fixed sm:sticky top-0 z-30 h-screen w-64 flex flex-col flex-shrink-0
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
      `}
        style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-[var(--border)] flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0"
               style={{ boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}>
            <BarChart2 className="w-4 h-4 text-[var(--text-primary)]" />
          </div>
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)] leading-none">DataNexus</div>
            <div className="text-xs text-indigo-400 leading-none mt-0.5">AI</div>
          </div>
          <button
            onClick={() => setSidebar(false)}
            className="ml-auto sm:hidden text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label}>
              <p className={`section-label px-2 mb-2 ${gi > 0 ? 'mt-4' : ''}`}>{group.label}</p>
              {group.items.map(({ id, label, Icon, sub }) => (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
                    transition-all duration-150 group
                    ${currentPath === id
                      ? 'bg-indigo-600/15 border border-indigo-500/20 text-indigo-300'
                      : 'text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent'
                    }
                  `}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                    ${currentPath === id ? 'bg-indigo-600/20' : 'bg-[var(--bg-hover)] group-hover:bg-[var(--bg-hover)]'}`}>
                    <Icon className={`w-3.5 h-3.5 ${currentPath === id ? 'text-indigo-400' : 'text-[var(--text-muted)] group-hover:text-[var(--text-muted)]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium leading-none ${currentPath === id ? 'text-indigo-200' : ''}`}>
                      {label}
                    </div>
                    <div className="text-xs text-[var(--text-dim)] mt-0.5 truncate">{sub}</div>
                  </div>
                  {currentPath === id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom — Stack info + status */}
        <div className="px-3 pb-4 space-y-3 border-t border-[var(--border)] pt-3">
          <div className="px-2 space-y-2">
            <p className="section-label">Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {['LangGraph', 'Groq', 'FastAPI', 'PostgreSQL'].map(t => (
                <span key={t} className="text-xs text-[var(--text-dim)] px-2 py-0.5 rounded-md"
                      style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-mid)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="px-2">
            <StatusBar />
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="sticky top-0 z-10 h-14 flex items-center gap-4 px-5 border-b border-[var(--border)] flex-shrink-0"
                style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(12px)' }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebar(true)}
            className="sm:hidden btn-ghost p-1.5"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {meta.title}
            </h1>
          </div>

          {/* AI badge */}
          <div className="hidden sm:flex items-center gap-1.5 badge badge-indigo mr-2">
            <Zap className="w-3 h-3" />
            <span>AI Powered</span>
          </div>

          <ThemeToggle />

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 hover:bg-[var(--bg-hover)] p-1.5 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-semibold border border-indigo-500/30">
                {initials}
              </div>
            </button>
            
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-hover)]/50">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors text-left"
                    >
                      Profile
                    </button>
                    <button 
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors text-left"
                    >
                      Settings
                    </button>
                    <div className="h-px bg-[var(--border)] my-1" />
                    <button 
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
            {/* Page subtitle */}
            <p className="text-sm text-[var(--text-muted)] mb-6">{meta.subtitle}</p>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
