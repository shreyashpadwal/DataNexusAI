/**
 * Architecture — system architecture and interview-ready explanation.
 */
import { ShieldCheck, GitBranch, Layers, Cpu, ArrowDown } from 'lucide-react'
import SecuritySummary from '../components/SecuritySummary'

const FLOW = [
  { label: 'React Frontend',     sub: 'Vite · TypeScript · Tailwind',   color: 'border-indigo-500/30 text-indigo-300',  bg: 'bg-indigo-500/5' },
  { label: 'FastAPI Backend',    sub: 'Python · Pydantic · Uvicorn',    color: 'border-blue-500/30 text-blue-300',      bg: 'bg-blue-500/5' },
  { label: 'LangGraph Router',   sub: 'Classifies: SQL vs ETL',         color: 'border-violet-500/30 text-violet-300',  bg: 'bg-violet-500/5' },
  { label: 'SQL / ETL Agent',    sub: 'Groq LLM · Pandas',             color: 'border-purple-500/30 text-purple-300',  bg: 'bg-purple-500/5' },
  { label: 'SQL Validation',     sub: 'sqlglot · SELECT-only',          color: 'border-emerald-500/30 text-emerald-300',bg: 'bg-emerald-500/5' },
  { label: 'PostgreSQL',         sub: 'SQLAlchemy · Parameterized ops', color: 'border-amber-500/30 text-amber-300',    bg: 'bg-amber-500/5' },
  { label: 'Results → React',   sub: 'JSON · Charts · Tables',         color: 'border-indigo-500/30 text-indigo-300',  bg: 'bg-indigo-500/5' },
]

const HOW_IT_WORKS = [
  { n: '1', title: 'User asks a question',     body: 'Natural-language question entered in the React frontend. No SQL knowledge required.' },
  { n: '2', title: 'FastAPI receives request', body: 'FastAPI validates the request with Pydantic, assigns a request_id, and records timing.' },
  { n: '3', title: 'LangGraph routes it',      body: 'Router Agent classifies the request as SQL (database query) or ETL (file processing).' },
  { n: '4', title: 'Groq generates SQL',       body: 'SQL Agent reads the database schema and generates a SELECT statement using openai/gpt-oss-20b.' },
  { n: '5', title: 'SQL is validated',         body: 'sqlglot parses the SQL and rejects anything that is not a safe SELECT. DROP, DELETE, UPDATE are blocked.' },
  { n: '6', title: 'PostgreSQL is queried',    body: 'Validated SQL executes against PostgreSQL via SQLAlchemy. Raw result rows are captured.' },
  { n: '7', title: 'Answer is generated',      body: 'Groq converts the raw data rows into a clear, natural-language insight. Frontend renders answer + chart.' },
]

const TECH_STACK = [
  { layer: 'Frontend',   items: ['React 18', 'Vite', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Axios'] },
  { layer: 'Backend',    items: ['FastAPI', 'SQLAlchemy', 'Pydantic v2', 'Uvicorn', 'Python 3.12'] },
  { layer: 'AI / Agent', items: ['LangGraph', 'LangChain', 'Groq API', 'openai/gpt-oss-20b'] },
  { layer: 'Data',       items: ['PostgreSQL', 'Pandas', 'sqlglot'] },
]

export default function Architecture() {
  return (
    <div className="space-y-6 max-w-4xl">

      {/* Architecture diagram */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">System Architecture</h2>
        </div>

        <div className="flex flex-col items-center gap-0">
          {FLOW.map(({ label, sub, color, bg }, i) => (
            <div key={label} className="flex flex-col items-center w-full max-w-xs">
              <div className={`w-full text-center px-5 py-3.5 rounded-xl border ${color} ${bg} transition-all duration-200 hover:scale-105`}>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs opacity-60 mt-0.5">{sub}</p>
              </div>
              {i < FLOW.length - 1 && (
                <div className="flex flex-col items-center gap-0.5 my-1">
                  <div className="w-px h-4 bg-[var(--border-mid)]" />
                  <ArrowDown className="w-3 h-3 text-[var(--text-dim)]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">How DataNexus AI Works</h2>
        </div>

        <div className="space-y-0">
          {HOW_IT_WORKS.map(({ n, title, body }, i) => (
            <div key={n} className="flex gap-4">
              {/* Left — number + connector */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30
                                flex items-center justify-center text-indigo-300 text-xs font-bold">
                  {n}
                </div>
                {i < HOW_IT_WORKS.length - 1 && <div className="w-px flex-1 bg-[var(--border)] my-1 min-h-[24px]" />}
              </div>

              {/* Right — content */}
              <div className="pb-6 flex-1">
                <p className="font-semibold text-[var(--text-primary)] text-sm">{title}</p>
                <p className="text-sm text-[var(--text-dim)] mt-1 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tech Stack</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {TECH_STACK.map(({ layer, items }) => (
            <div key={layer}>
              <p className="section-label mb-2">{layer}</p>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <span key={item}
                        className="px-2.5 py-1 text-xs text-[var(--text-secondary)] rounded-lg font-medium"
                        style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-mid)' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <SecuritySummary />
    </div>
  )
}
