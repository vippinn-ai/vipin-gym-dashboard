import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { AlertTriangle, ArrowUpRight, BookOpen, ChartNoAxesCombined, ClipboardList, Dumbbell, FileSpreadsheet, HeartPulse, Images, LayoutDashboard, Salad, Search, ShieldCheck } from 'lucide-react'
import type { SourceRef } from './types'

export const navItems = [
  ['/', 'Overview', LayoutDashboard],
  ['/training', 'Training', Dumbbell],
  ['/progress', 'Progress', ChartNoAxesCombined],
  ['/recovery', 'Recovery', HeartPulse],
  ['/nutrition', 'Nutrition', Salad],
  ['/coaching', 'Coaching', ClipboardList],
  ['/evidence', 'Evidence', Images],
  ['/archive', 'Archive', BookOpen],
  ['/verify', 'To verify', AlertTriangle],
  ['/sources', 'Sources', FileSpreadsheet],
] as const

export function Layout({ children }: { children: ReactNode }) {
  return <div className="app-shell">
    <header className="masthead">
      <NavLink to="/" className="brand" aria-label="Training Ledger home">
        <span className="brand-mark">VL</span>
        <span><strong>Vipin's</strong><em>Training Ledger</em></span>
      </NavLink>
      <div className="masthead-status"><span className="live-dot" /> Source-linked coaching record</div>
    </header>
    <aside className="side-rail" aria-label="Primary navigation">
      <nav>{navItems.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="rail-note"><ShieldCheck size={18}/><span>Every uncertainty stays visible.</span></div>
    </aside>
    <main id="main-content">{children}</main>
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navItems.slice(0, 5).map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'}><Icon size={20}/><span>{label}</span></NavLink>)}
    </nav>
  </div>
}

export function PageIntro({ eyebrow, title, children, action }: { eyebrow: string; title: string; children: ReactNode; action?: ReactNode }) {
  return <header className="page-intro reveal">
    <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><div className="lede">{children}</div></div>
    {action && <div className="page-action">{action}</div>}
  </header>
}

export function Stat({ label, value, note, accent = false }: { label: string; value: ReactNode; note?: string; accent?: boolean }) {
  return <article className={`stat-card reveal ${accent ? 'accent' : ''}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</article>
}

export function Section({ title, kicker, children, className = '' }: { title: string; kicker?: string; children: ReactNode; className?: string }) {
  return <section className={`panel reveal ${className}`}><header className="panel-head"><div>{kicker && <p className="eyebrow">{kicker}</p>}<h2>{title}</h2></div></header>{children}</section>
}

export function SourceBadge({ source }: { source?: SourceRef }) {
  if (!source) return null
  const query = new URLSearchParams({ sheet: source.sheet ?? '', row: String(source.row ?? ''), anchor: source.anchor ?? '' }).toString()
  return <NavLink className="source-badge" to={`/sources?${query}`} title={`Open source: ${source.file}`}><ArrowUpRight size={12}/>{source.sheet ? `${source.sheet} · ${source.row}` : source.anchor ?? source.file}</NavLink>
}

export function ToneBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'green' | 'amber' | 'red' | 'neutral' }) {
  return <span className={`tone-badge ${tone}`}>{children}</span>
}

export function SearchBox({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="search-box"><Search size={17}/><span className="sr-only">Search</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder}/></label>
}

export const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`.replace(/\/+/g, '/')
