/**
 * About - project overview and capabilities page.
 */
import { Brain, Upload, Code2, Lightbulb, Database, ShieldCheck, Layers } from 'lucide-react'

const CAPABILITIES = [
  { Icon: Brain,       title: 'AI Data Analyst',        body: 'Ask questions about your data using plain English. No SQL knowledge required.' },
  { Icon: Upload,      title: 'Automated ETL',           body: 'Upload, inspect, clean, validate, and persist CSV data through an AI-coordinated pipeline.' },
  { Icon: Code2,       title: 'Intelligent SQL',         body: 'Automatically generate precise, validated SQL from natural-language questions.' },
  { Icon: Lightbulb,   title: 'Explainable Results',     body: 'Receive clear, human-readable insights rather than only raw query data.' },
  { Icon: Database,    title: 'PostgreSQL Integration',  body: 'Reliable, persistent, relational data storage with full structured query support.' },
  { Icon: ShieldCheck, title: 'Secure Processing',       body: 'Validated operations, parameterized DB interactions, and strict auth-data separation.' },
]

const STACK = ['React 18', 'TypeScript', 'FastAPI', 'LangGraph', 'Groq', 'PostgreSQL', 'Pandas', 'Tailwind CSS']

export default function About() {
  return (
    <div className="space-y-6 max-w-4xl">

      {/* Overview */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">About DataNexus AI</h2>
          <p className="text-sm text-indigo-400 mt-1 font-medium">AI-powered analytics for data you can actually understand.</p>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          DataNexus AI is an AI-powered data analytics platform that enables users to interact with structured data
          using natural language instead of manually writing SQL queries. It combines LangGraph-based AI agents,
          automated ETL processing, PostgreSQL persistence, and explainable AI insights into a unified analytics workflow.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {STACK.map(t => (
            <span key={t} className="px-2.5 py-1 text-xs text-[var(--text-secondary)] rounded-lg font-medium"
                  style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-mid)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Problem */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">What Problem Does It Solve?</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Traditional analytics workflows require users to understand SQL syntax, database schemas, and data-cleaning
          pipelines — a significant barrier for non-technical users who simply want answers from their data.
        </p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          DataNexus AI removes this barrier by allowing users to upload raw CSV data, process it through an automated
          ETL pipeline, and then query it using plain English. The system handles SQL generation, validation, execution,
          and insight generation — the user just asks a question.
        </p>
      </div>

      {/* Capabilities */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Key Capabilities</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAPABILITIES.map(({ Icon, title, body }) => (
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

      {/* Honest disclaimer */}
      <div className="card-sm" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-mid)' }}>
        <p className="text-xs text-[var(--text-dim)] leading-relaxed">
          <span className="text-[var(--text-muted)] font-medium">Note: </span>
          DataNexus AI is a portfolio/demo project demonstrating applied AI engineering — LangGraph agent orchestration,
          secure ETL pipelines, and natural-language database querying. All capabilities shown are real and functional.
        </p>
      </div>

    </div>
  )
}