import { Activity, ArrowRight, CheckCircle2, Clock3, Coffee, Download, Gauge, MoonStar, Scale, Target } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageIntro, Section, SourceBadge, Stat, ToneBadge, publicUrl } from '../components'
import { containsUncertainty, data, dateLabel, num, statusTone, str } from '../data'

export function Overview() {
  const latest = [...data.sessions].sort((a, b) => str(b, 'Date').localeCompare(str(a, 'Date')))[0]
  const exercises = new Set(data.journal.map((row) => str(row, 'Exercise')).filter(Boolean))
  const latestRecovery = [...data.recovery].filter((row) => str(row, 'Date')).sort((a, b) => str(b, 'Date').localeCompare(str(a, 'Date')))[0]
  const knownProtein = data.protein.reduce((sum, row) => sum + num(row, 'Calculated protein (g)'), 0)
  const workload = data.sessions.map((row) => ({ date: str(row, 'Date').slice(5), sets: num(row, 'Set Entries'), workout: str(row, 'Workout') }))
  const priorities = data.programNotes.slice(-4)
  return <div className="page overview-page">
    <PageIntro eyebrow="Performance review · live source bundle" title="Build the athlete, not the noise."
      action={<a className="button dark" href={publicUrl(data.sourceFiles[0].path)} download><Download size={16}/> Download workbook</a>}>
      A complete view of training quality, recovery, nutrition and coaching decisions—without hiding assisted reps or unresolved details.
    </PageIntro>

    <section className="hero-ledger reveal">
      <div className="hero-number"><span>Latest session</span><strong>{str(latest, 'Workout')}</strong><small>{dateLabel(str(latest, 'Date'))}</small></div>
      <div className="hero-copy"><p>{str(latest, 'Coach Assessment')}</p><div className="hero-next"><Target size={18}/><span><b>Next decision</b>{str(latest, 'Next-Session Status')}</span></div></div>
      <SourceBadge source={latest.__source}/>
    </section>

    <section className="stats-grid">
      <Stat label="Logged sessions" value={data.sessions.length} note="complete session summaries"/>
      <Stat label="Set entries" value={data.journal.length} note={`${exercises.size} distinct exercises`} accent/>
      <Stat label="Quantified protein" value={`${knownProtein.toFixed(1)} g`} note="minimum; incomplete foods excluded"/>
      <Stat label="Current weight" value={`${str(latestRecovery, 'Weight (kg)') || '88.8'} kg`} note="standardized morning baseline"/>
    </section>

    <div className="two-column">
      <Section title="Workload, session by session" kicker="Training density">
        <div className="chart-wrap" aria-label="Bar chart of set entries per session">
          <ResponsiveContainer width="100%" height={290}><BarChart data={workload} margin={{ left: -24, right: 8 }}>
            <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="#c8c0b5"/><XAxis dataKey="date" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/>
            <Tooltip cursor={{ fill: '#e9e1d4' }} contentStyle={{ background: '#191816', border: 0, color: '#fff' }}/><Bar dataKey="sets" fill="#722f37" radius={[8,8,0,0]}/>
          </BarChart></ResponsiveContainer>
        </div>
      </Section>
      <Section title="Readiness record" kicker="Latest recovery">
        <div className="readiness-list">
          <div><MoonStar/><span>Sleep</span><strong>{str(latestRecovery, 'Sleep') || 'To verify'}</strong></div>
          <div><Gauge/><span>Energy</span><strong>{str(latestRecovery, 'Energy') || 'To verify'}</strong></div>
          <div><Activity/><span>Pain / soreness</span><strong>{str(latestRecovery, 'Soreness / Pain') || 'None recorded'}</strong></div>
          <div><Coffee/><span>Caffeine default</span><strong>100 mg EAA+ · no coffee</strong></div>
        </div>
        <NavLink className="text-link" to="/recovery">Open recovery history <ArrowRight size={15}/></NavLink>
      </Section>
    </div>

    <Section title="Coach's current desk" kicker="Decisions that govern the next session">
      <div className="priority-grid">{priorities.map((row, index) => <article key={`${str(row,'Category')}-${index}`}>
        <span className="priority-index">0{index + 1}</span><h3>{str(row, 'Category')}</h3><p>{str(row, 'Rule / Observation')}</p><strong>{str(row, 'Action')}</strong>
        {containsUncertainty(row) && <ToneBadge tone="amber">Needs verification</ToneBadge>}<SourceBadge source={row.__source}/>
      </article>)}</div>
    </Section>

    <section className="closing-strip reveal"><div><CheckCircle2/><span><b>Integrity rule</b> Clean, assisted and uncertain results remain separate.</span></div><ToneBadge tone={statusTone(str(latest,'Readiness')) as 'green'|'amber'|'red'}>{str(latest,'Readiness')}</ToneBadge></section>
  </div>
}
