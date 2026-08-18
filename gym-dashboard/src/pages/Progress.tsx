import { useMemo, useState } from 'react'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageIntro, Section, SourceBadge, ToneBadge } from '../components'
import { data, dateLabel, num, statusTone, str } from '../data'

export function Progress() {
  const exercises = [...new Set(data.journal.map((row)=>str(row,'Exercise')).filter(Boolean))].sort()
  const [exercise, setExercise] = useState(exercises.includes('Lat Pulldown') ? 'Lat Pulldown' : exercises[0])
  const history = useMemo(()=>data.journal.filter((row)=>str(row,'Exercise')===exercise).map((row)=>({
    date:str(row,'Date'), reps:num(row,'Reps'), rir:Number(str(row,'RIR')), load:str(row,'Weight'), basis:str(row,'Unit / Load Basis'), source:row.__source
  })),[exercise])
  const target = data.targets.find((row)=>str(row,'Exercise')===exercise)
  return <div className="page">
    <PageIntro eyebrow="Exercise-level progression" title="Progress without false comparisons.">Load basis, reserve and assistance stay visible beside every performance marker.</PageIntro>
    <div className="progress-picker reveal"><label>Exercise<select value={exercise} onChange={(e)=>setExercise(e.target.value)}>{exercises.map(x=><option key={x}>{x}</option>)}</select></label><div><span>{history.length}</span> tracked sets</div></div>
    <div className="two-column progress-layout">
      <Section title={`${exercise} · repetition history`} kicker="Set-by-set">
        <div className="chart-wrap"><ResponsiveContainer width="100%" height={320}><LineChart data={history} margin={{left:-20,right:12}}><CartesianGrid strokeDasharray="2 6" stroke="#c8c0b5"/><XAxis dataKey="date" tickFormatter={(x)=>x.slice(5)} tickLine={false}/><YAxis allowDecimals={false} tickLine={false}/><Tooltip content={({active,payload})=>active&&payload?.[0]?<div className="chart-tooltip"><b>{payload[0].payload.load}</b><span>{payload[0].payload.basis}</span><span>{payload[0].payload.reps} reps · RIR {Number.isFinite(payload[0].payload.rir)?payload[0].payload.rir:'—'}</span></div>:null}/><Line dataKey="reps" stroke="#722f37" strokeWidth={3} dot={{fill:'#d9ff43',stroke:'#191816',strokeWidth:2,r:5}}/></LineChart></ResponsiveContainer></div>
        <p className="chart-note">This chart shows repetitions, while the tooltip preserves the exact load and basis. It does not imply that different machines or per-side loads are interchangeable.</p>
      </Section>
      <Section title="Current coaching target" kicker={target ? str(target,'Muscle') : 'Not yet standardized'}>
        {target ? <div className="target-card"><ToneBadge tone={statusTone(str(target,'Status')) as 'green'|'amber'|'red'}>{str(target,'Status')}</ToneBadge><dl><div><dt>Current best</dt><dd>{str(target,'Current Best Set')}</dd></div><div><dt>Working zone</dt><dd>{str(target,'Current Working Zone')}</dd></div><div><dt>Next target</dt><dd>{str(target,'Next Target')}</dd></div><div><dt>Progress rule</dt><dd>{str(target,'Progress Rule')}</dd></div><div><dt>Technique</dt><dd>{str(target,'Technique Focus')}</dd></div></dl><p>{str(target,'Notes')}</p><SourceBadge source={target.__source}/></div>:<p>No dedicated target row exists yet. The complete raw history remains available.</p>}
      </Section>
    </div>
    <Section title="Target ledger" kicker={`${data.targets.length} exercises`}><div className="card-grid">{data.targets.map((row,index)=><article className="compact-card" key={`${str(row,'Exercise')}-${index}`}><span>{str(row,'Muscle')}</span><h3>{str(row,'Exercise')}</h3><p>{str(row,'Next Target')}</p><ToneBadge tone={statusTone(str(row,'Status')) as 'green'|'amber'|'red'}>{str(row,'Status')}</ToneBadge><SourceBadge source={row.__source}/></article>)}</div></Section>
  </div>
}
