/**
 * SecuritySummary — accurate, honest security controls display.
 */
import { ShieldCheck } from 'lucide-react'

const CONTROLS = [
  { item: 'Read-only SQL enforcement',       desc: 'sqlglot validates every query — only SELECT is allowed' },
  { item: 'Controlled database writes',      desc: 'Only ETL pipeline writes to etl_staging via SQLAlchemy' },
  { item: 'Parameterized operations',        desc: 'No string-interpolated SQL anywhere in the codebase' },
  { item: 'Environment-based secrets',       desc: 'API keys and DB URL in .env — never in source or frontend' },
  { item: 'No arbitrary code execution',     desc: 'Zero exec() / eval() / os.system() in application code' },
  { item: 'CSV file validation',             desc: 'Type (.csv only), size (5 MB), row count (10K) enforced' },
  { item: 'ETL operation allowlist',         desc: 'LLM picks from normalize / deduplicate / fill — nothing else' },
  { item: 'LLM receives schema only',        desc: 'Groq sees table structure — not user data or credentials' },
]

export default function SecuritySummary() {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Security Design</h3>
          <p className="text-xs text-[var(--text-muted)]">Controls active in this deployment</p>
        </div>
      </div>

      <div className="space-y-3">
        {CONTROLS.map(({ item, desc }) => (
          <div key={item} className="flex items-start gap-3">
            <span className="text-emerald-500 text-xs mt-0.5 flex-shrink-0">✓</span>
            <div>
              <span className="text-sm text-[var(--text-secondary)]">{item}</span>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--text-dim)] mt-5 pt-4 border-t border-[var(--border)] leading-relaxed">
        Designed for local analytics and portfolio demonstration.
        Not production-hardened — would require authentication, rate limiting, and HTTPS for real deployment.
      </p>
    </div>
  )
}
