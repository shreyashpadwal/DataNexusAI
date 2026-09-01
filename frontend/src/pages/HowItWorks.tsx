/**
 * HowItWorks - step-by-step pipeline walkthrough page.
 */
import { ArrowDown, Layers, Cpu, GitBranch, CheckCircle2, Sparkles, Database, ShieldCheck } from 'lucide-react'

const PIPELINE = [
  { n: '01', label: 'UPLOAD DATA',            body: 'Upload CSV files through the Data Preparation module. Files are validated for type, size, and structure before processing.' },
  { n: '02', label: 'ETL PROCESSING',          body: 'The ETL Agent uses Pandas to inspect, clean, remove duplicates, handle missing values, and normalize column names.' },
  { n: '03', label: 'POSTGRESQL STORAGE',      body: 'Validated records are persisted into the etl_staging table in PostgreSQL using parameterized SQLAlchemy inserts. Duplicate rows are automatically skipped.' },
  { n: '04', label: 'NATURAL LANGUAGE QUERY',  body: 'The user asks a question in plain English — e.g. "What is the total revenue?" No SQL knowledge required.' },
  { n: '05', label: 'LANGGRAPH ROUTER',         body: 'A LangGraph-powered router classifies the request as SQL analytics or ETL processing and routes it to the appropriate agent.' },
  { n: '06', label: 'SQL AGENT (GROQ)',         body: 'For analytics queries, the SQL Agent reads the database schema and generates a precise SELECT statement using the Groq LLM.' },
  { n: '07', label: 'SQL VALIDATION',           body: 'sqlglot parses the generated SQL. Only safe SELECT statements are allowed. DROP, DELETE, UPDATE, and auth-related queries are blocked.' },
  { n: '08', label: 'POSTGRESQL EXECUTION',     body: 'The validated SQL executes against PostgreSQL via SQLAlchemy. Raw result rows are captured and returned to the pipeline.' },
  { n: '09', label: 'AI INSIGHT',               body: 'Groq converts raw query results into a concise, explainable natural-language insight. The frontend renders the answer, SQL, and tabular data.' },
]

const WHY_CARDS = [
  { Icon: Sparkles,    title: 'Natural Language Analytics', body: 'Ask questions about your data in plain English without writing SQL or understanding database schemas.' },
  { Icon: Layers,      title: 'Automated ETL',              body: 'Upload, inspect, clean, validate, and persist CSV data automatically through an AI-coordinated pipeline.' },
  { Icon: Database,    title: 'PostgreSQL Data Layer',      body: 'All data is stored in a reliable relational database with full integrity, indexing, and structured queries.' },
  { Icon: CheckCircle2,title: 'Explainable AI Insights',   body: 'Results are transformed into clear, understandable summaries instead of returning only raw data rows.' },
]

const TECH_STACK = [
  { layer: 'Frontend',    items: ['React 18', 'Vite', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Axios'] },
  { layer: 'Backend',     items: ['FastAPI', 'SQLAlchemy', 'Pydantic v2', 'Uvicorn', 'Python 3.12'] },
  { layer: 'AI / Agents', items: ['LangGraph', 'LangChain', 'Groq API', 'openai/gpt-oss-120b'] },
  { layer: 'Data',        items: ['PostgreSQL', 'Pandas', 'sqlglot'] },
]

export default function HowItWorks() {
  return (
    <div className="space-y-6 max-w-4xl">

      {/* Pipeline */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">The DataNexus AI Pipeline</h2>
        </div>
        <div className="space-y-0">
          {PIPELINE.map(({ n, label, body }, i) => (
            <div key={n} className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold">{n}</div>
                {i < PIPELINE.length - 1 && (
                  <div className="flex flex-col items-center gap-0.5 my-1">
                    <div className="w-px h-4 bg-[var(--border-mid)]" />
                    <ArrowDown className="w-3 h-3 text-[var(--text-dim)]" />
                  </div>
                )}
              </div>
              <div className="pb-5 flex-1">
                <p className="font-semibold text-[var(--text-primary)] text-sm">{label}</p>
                <p className="text-sm text-[var(--text-dim)] mt-1 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why DataNexus AI */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Why DataNexus AI?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WHY_CARDS.map(({ Icon, title, body }) => (
            <div key={title} className="card-hover">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="font-semibold text-[var(--text-primary)] text-sm mb-1.5">{title}</p>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Technology Stack</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {TECH_STACK.map(({ layer, items }) => (
            <div key={layer}>
              <p className="section-label mb-2">{layer}</p>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <span key={item} className="px-2.5 py-1 text-xs text-[var(--text-secondary)] rounded-lg font-medium"
                        style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-mid)' }}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}