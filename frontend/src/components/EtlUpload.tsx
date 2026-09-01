/**
 * EtlUpload — polished CSV upload and ETL processing page.
 * Clearly communicates PostgreSQL persistence on success.
 */
import { useState, useCallback, useRef } from 'react'
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Database,
         Trash2, Shield, AlertCircle, ChevronRight, ArrowRight, Sparkles } from 'lucide-react'
import { uploadCsv, type EtlResponse } from '../api/api'

interface Props {
  onNavigateToAnalyst?: () => void
}

const ALLOWED_OPS: Record<string, { label: string; desc: string }> = {
  normalize_columns:     { label: 'Normalize columns',     desc: 'Standardized column name formatting' },
  remove_duplicates:     { label: 'Remove duplicates',     desc: 'Deduplicated identical rows' },
  handle_missing_values: { label: 'Handle missing values', desc: 'Filled or dropped empty cells' },
}

type PipelineStepState = 'idle' | 'done' | 'active'

function PipelineStep({
  icon: Icon,
  label,
  desc,
  state,
  isLast,
}: {
  icon: React.ElementType
  label: string
  desc: string
  state: PipelineStepState
  isLast?: boolean
}) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="flex flex-col items-center text-center min-w-[80px]">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
          state === 'done'   ? 'bg-emerald-500/15 border border-emerald-500/30' :
          state === 'active' ? 'bg-indigo-500/15 border border-indigo-500/30' :
                               'bg-[var(--bg-hover)] border border-[var(--border)]'
        }`}>
          {state === 'done'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            : state === 'active'
              ? <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              : <Icon className="w-4 h-4 text-[var(--text-dim)]" />
          }
        </div>
        <span className={`text-xs font-medium mt-1.5 ${
          state === 'done'   ? 'text-emerald-400' :
          state === 'active' ? 'text-indigo-300' :
                               'text-[var(--text-dim)]'
        }`}>{label}</span>
        <span className="hidden sm:block text-xs text-[var(--text-dim)] leading-tight mt-0.5 max-w-[72px]">{desc}</span>
      </div>
      {!isLast && <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 -mx-0.5 transition-colors ${
        state === 'done' ? 'text-emerald-600' : 'text-slate-800'
      }`} />}
    </div>
  )
}

type ProcessingState = 'idle' | 'uploading' | 'processing' | 'success' | 'error'

export default function EtlUpload({ onNavigateToAnalyst }: Props) {
  const [file,         setFile]         = useState<File | null>(null)
  const [instructions, setInstructions] = useState('Remove duplicates and handle missing values.')
  const [dragging,     setDragging]     = useState(false)
  const [procState,    setProcState]    = useState<ProcessingState>('idle')
  const [result,       setResult]       = useState<EtlResponse | null>(null)
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const loading = procState === 'uploading' || procState === 'processing'

  const accept = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.csv')) { setErrorMsg('Only .csv files are accepted.'); return }
    if (f.size > 5 * 1024 * 1024)              { setErrorMsg('File must be under 5 MB.'); return }
    setFile(f); setErrorMsg(null); setResult(null); setProcState('idle')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) accept(f)
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) accept(f)
  }

  const handleUpload = async () => {
    if (!file || loading) return
    setProcState('uploading')
    setResult(null)
    setErrorMsg(null)

    // Short delay to show "uploading" state visually
    await new Promise(r => setTimeout(r, 400))
    setProcState('processing')

    try {
      const res = await uploadCsv(file, instructions)
      if (res.success) {
        setResult(res)
        setProcState('success')
      } else {
        setErrorMsg(res.error ?? 'ETL processing failed.')
        setResult(res)
        setProcState('error')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErrorMsg(msg ?? 'Cannot reach backend. Is the server running on port 8000?')
      setProcState('error')
    }
  }

  const reset = () => {
    setFile(null); setResult(null); setErrorMsg(null); setProcState('idle')
    if (inputRef.current) inputRef.current.value = ''
  }

  const fmtBytes = (b: number) =>
    b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`

  // Pipeline step states
  const pipelineSteps: { icon: React.ElementType; label: string; desc: string; state: PipelineStepState }[] = [
    { icon: Upload,       label: 'Upload',   desc: 'Receive CSV',        state: procState !== 'idle' ? 'done' : 'idle' },
    { icon: FileText,     label: 'Inspect',  desc: 'Read columns',       state: procState === 'uploading' ? 'active' : procState !== 'idle' ? 'done' : 'idle' },
    { icon: Shield,       label: 'Clean',    desc: 'Apply ops',          state: procState === 'processing' ? 'active' : (procState === 'success' || procState === 'error') ? 'done' : 'idle' },
    { icon: CheckCircle2, label: 'Validate', desc: 'Verify data',        state: procState === 'processing' ? 'active' : (procState === 'success' || procState === 'error') ? 'done' : 'idle' },
    { icon: Database,     label: '✓ PostgreSQL', desc: 'Persist rows',   state: procState === 'success' ? 'done' : 'idle' },
  ]

  return (
    <div className="space-y-5">

      {/* Pipeline */}
      <div className="card-sm">
        <div className="flex items-center justify-start overflow-x-auto gap-1 py-1">
          {pipelineSteps.map((step, i) => (
            <PipelineStep key={step.label} {...step} isLast={i === pipelineSteps.length - 1} />
          ))}
        </div>
      </div>

      {/* ── SUCCESS STATE ─────────────────────────────────────── */}
      {procState === 'success' && result && (
        <div className="card animate-fade-in space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-300 text-sm">ETL Processing Complete ✓</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {result.rows_loaded > 0
                    ? `${result.rows_loaded} new record${result.rows_loaded !== 1 ? 's' : ''} persisted to PostgreSQL.`
                    : `All ${result.rows_skipped} records already existed — no duplicates inserted.`}
                </p>
              </div>
            </div>
            <span className="badge badge-green text-xs flex-shrink-0">✓ Persisted</span>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Rows Received',    value: result.rows_read,           color: 'text-[var(--text-primary)]' },
              { label: 'Valid Rows',        value: result.rows_read - 0,       color: 'text-[var(--text-primary)]' },
              { label: 'New Inserted',      value: result.rows_loaded,         color: 'text-emerald-300' },
              { label: 'Duplicates Skipped', value: result.rows_skipped,       color: 'text-amber-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-center">
                <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Persistence details */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-900/40 space-y-2">
            <p className="section-label mb-3">Persistence details</p>
            {[
              { label: 'Database',               value: 'PostgreSQL' },
              { label: 'Destination table',      value: result.destination ?? 'etl_staging' },
              { label: 'Rows received',          value: String(result.rows_read) },
              { label: 'Rows inserted',          value: String(result.rows_loaded) },
              { label: 'Duplicates skipped',     value: String(result.rows_skipped) },
              { label: 'CSV duplicates removed', value: String(result.duplicates_removed) },
              { label: 'Missing values fixed',   value: String(result.missing_values_handled) },
              { label: 'Status',                 value: result.rows_loaded > 0 ? 'New records inserted' : 'All duplicates — skipped' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">{label}</span>
                <span className={`font-medium font-mono ${
                  label === 'Status' ? (result.rows_loaded > 0 ? 'text-emerald-400' : 'text-amber-400') :
                  label === 'Database' || label === 'Destination table' ? 'text-indigo-300' :
                  'text-[var(--text-secondary)]'
                }`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Operations performed */}
          {result.operations_performed.length > 0 && (
            <div className="space-y-2">
              <p className="section-label">Operations performed</p>
              {result.operations_performed.map(op => (
                <div key={op} className="flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[var(--text-secondary)]">{ALLOWED_OPS[op]?.label ?? op}</span>
                    {ALLOWED_OPS[op]?.desc && (
                      <span className="text-[var(--text-dim)] ml-1.5">— {ALLOWED_OPS[op].desc}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Answer */}
          {result.answer && (
            <p className="text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] pt-4">
              {result.answer}
            </p>
          )}

          {/* Duration */}
          {result.duration_ms != null && (
            <p className="text-xs text-[var(--text-dim)]">
              Completed in {result.duration_ms >= 1000
                ? `${(result.duration_ms / 1000).toFixed(1)}s`
                : `${Math.round(result.duration_ms)}ms`}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 border-t border-[var(--border)] pt-4">
            {onNavigateToAnalyst && (
              <button onClick={onNavigateToAnalyst} className="btn-primary flex-1 py-2.5">
                <Sparkles className="w-4 h-4" />
                Ask DataNexus AI about this data
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button onClick={reset} className="btn-secondary flex-1 sm:flex-none py-2.5">
              Upload another file
            </button>
          </div>
        </div>
      )}

      {/* ── ERROR STATE ───────────────────────────────────────── */}
      {procState === 'error' && errorMsg && (
        <div className="card animate-fade-in border-red-900/30 bg-red-950/5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-300">Processing failed</p>
              <p className="text-xs text-red-500 mt-1 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
          <button onClick={reset} className="btn-secondary text-xs py-2">
            Try again
          </button>
        </div>
      )}

      {/* ── UPLOAD FORM (idle / loading) ───────────────────────── */}
      {procState !== 'success' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left — Drop zone + form */}
          <div className="lg:col-span-3 space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !file && !loading && inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl
                          border-2 border-dashed transition-all duration-200
                          ${dragging
                            ? 'border-indigo-500/50 bg-indigo-500/5 cursor-copy'
                            : file
                              ? 'border-[var(--border)] bg-[var(--bg-card)] cursor-default'
                              : 'border-[var(--border)] hover:border-[var(--border-mid)] hover:bg-[var(--bg-surface)] cursor-pointer'
                          } ${loading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <input ref={inputRef} type="file" accept=".csv" onChange={onFileChange} className="hidden" />

              {file ? (
                <div className="text-center space-y-3 w-full">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{file.name}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">{fmtBytes(file.size)}</p>
                  </div>
                  {!loading && (
                    <button onClick={e => { e.stopPropagation(); reset() }}
                            className="btn-ghost text-xs py-1.5 px-3 mx-auto">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-3 pointer-events-none">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-mid)] flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[var(--text-dim)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">Drop your CSV file here</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">or click to browse · Max 5 MB · CSV only</p>
                  </div>
                  <span className="badge badge-slate text-xs">.csv only</span>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs text-[var(--text-dim)] font-medium">Processing instructions</label>
              <input
                type="text"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                disabled={loading}
                placeholder="e.g. Remove duplicates and handle missing values"
                className="input-field disabled:opacity-50"
              />
            </div>

            {/* Inline error for file issues */}
            {errorMsg && procState === 'idle' && (
              <div className="flex items-center gap-2 text-xs text-red-400 animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {procState === 'uploading' ? 'Uploading…' : 'Processing & loading to PostgreSQL…'}
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Process & Load to PostgreSQL
                </>
              )}
            </button>
          </div>

          {/* Right — Security info */}
          <div className="lg:col-span-2">
            <div className="card-sm space-y-3">
              <p className="section-label flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Security controls
              </p>
              {[
                'CSV type & size validated before processing',
                'Operations from a predefined allowlist only',
                'No arbitrary code execution',
                'Loaded via parameterized SQL inserts',
                'Core database tables remain read-only',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-xs text-[var(--text-dim)]">
                  <span className="text-emerald-600 flex-shrink-0 mt-0.5">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
