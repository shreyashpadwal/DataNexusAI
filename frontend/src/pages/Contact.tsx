/**
 * Contact - feedback form + connect links.
 * Demo form only - no real email backend. Shows honest success state.
 */
import { useState } from 'react'
import { Send, Github, Linkedin, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react'

interface FormData { name: string; email: string; subject: string; message: string }
interface Errors   { name?: string; email?: string; subject?: string; message?: string }

function validate(f: FormData): Errors {
  const e: Errors = {}
  if (!f.name.trim())    e.name = 'Name is required.'
  if (!f.email.trim())   e.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address.'
  if (!f.subject.trim()) e.subject = 'Subject is required.'
  if (!f.message.trim()) e.message = 'Message is required.'
  else if (f.message.trim().length < 10) e.message = 'Message must be at least 10 characters.'
  return e
}

export default function Contact() {
  const [form,      setForm]      = useState<FormData>({ name: '', email: '', subject: '', message: '' })
  const [errors,    setErrors]    = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800)) // simulate slight delay
    setLoading(false)
    setSubmitted(true)
  }

  const reset = () => {
    setForm({ name: '', email: '', subject: '', message: '' })
    setErrors({})
    setSubmitted(false)
  }

  const CONNECT = [
    { Icon: Github,   label: 'GitHub',   href: 'https://github.com',   sub: 'View the project repository' },
    { Icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com', sub: 'Connect professionally' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Form */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="card text-center py-12 space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-300 text-sm">Message received!</p>
                <p className="text-xs text-[var(--text-muted)] mt-2 max-w-sm mx-auto leading-relaxed">
                  Thank you for your feedback. This form is ready for backend integration —
                  in a production deployment, your message would be delivered to the project maintainer.
                </p>
              </div>
              <button onClick={reset} className="btn-secondary text-xs py-2 mx-auto">
                <MessageSquare className="w-3.5 h-3.5" />Send another message
              </button>
            </div>
          ) : (
            <div className="card">
              <div className="flex items-center gap-2 mb-5">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Send a Message</h2>
              </div>
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--text-dim)] font-medium">Name <span className="text-red-500">*</span></label>
                    <input type="text" value={form.name} onChange={set('name')} placeholder="Your name" className="input-field" />
                    {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--text-dim)] font-medium">Email <span className="text-red-500">*</span></label>
                    <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className="input-field" />
                    {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-dim)] font-medium">Subject <span className="text-red-500">*</span></label>
                  <input type="text" value={form.subject} onChange={set('subject')} placeholder="What is this about?" className="input-field" />
                  {errors.subject && <p className="text-xs text-red-400">{errors.subject}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-dim)] font-medium">Message <span className="text-red-500">*</span></label>
                  <textarea value={form.message} onChange={set('message')} rows={5}
                    placeholder="Your feedback, bug report, or message..." className="input-field resize-none" />
                  {errors.message && <p className="text-xs text-red-400">{errors.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                           : <><Send className="w-4 h-4" />Send Message</>}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Connect</h3>
            {CONNECT.map(({ Icon, label, href, sub }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors group"
                style={{ border: '1px solid var(--border)' }}>
                <div className="w-9 h-9 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-mid)] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                  <p className="text-xs text-[var(--text-dim)]">{sub}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--text-dim)] flex-shrink-0" />
              </a>
            ))}
            <p className="text-xs text-[var(--text-dim)] pt-1">Links will be updated with actual project URLs.</p>
          </div>

          <div className="card-sm" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-mid)' }}>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              <span className="text-[var(--text-muted)] font-medium">Portfolio Project — </span>
              DataNexus AI is a demo application. Use the form above for feedback or collaboration inquiries.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}