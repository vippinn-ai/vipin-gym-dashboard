import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, MoonStar } from 'lucide-react'
import { PageIntro, Section, SourceBadge, ToneBadge } from '../components'
import { data, dateLabel, statusTone, str } from '../data'

export function Recovery() {
  const metrics = data.recovery.filter((row)=>str(row,'Date')).map((row)=>({ date:str(row,'Date'), weight:Number(str(row,'Weight (kg)'))||null, waist:Number(str(row,'Waist (cm)'))||null }))
  return <div className="page">
    <PageIntro eyebrow="Sleep · energy · pain · body metrics" title="Recovery is part of the program.">The ledger keeps muscular pump separate from pain and preserves missing morning follow-ups as missing.</PageIntro>
    <Section title="Body trend" kicker="Standardized readings only"><div className="chart-wrap"><ResponsiveContainer width="100%" height={300}><AreaChart data={metrics} margin={{left:-14,right:10}}><defs><linearGradient id="weight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#722f37" stopOpacity=".5"/><stop offset="1" stopColor="#722f37" stopOpacity=".03"/></linearGradient></defs><CartesianGrid strokeDasharray="2 6" vertical={false}/><XAxis dataKey="date" tickFormatter={(v)=>v.slice(5)} tickLine={false}/><YAxis domain={['dataMin - 2','dataMax + 2']} tickLine={false}/><Tooltip/><Area dataKey="weight" stroke="#722f37" fill="url(#weight)" connectNulls strokeWidth={3}/></AreaChart></ResponsiveContainer></div><p className="chart-note">One standardized morning reading is available. The 91.5 kg post-workout gym reading is intentionally excluded from the trend.</p></Section>
    <div className="recovery-timeline">{[...data.recovery].filter(r=>str(r,'Date')).reverse().map((row,index)=><article className="timeline-entry reveal" key={`${str(row,'Date')}-${index}`}><div className="timeline-date"><span>{dateLabel(str(row,'Date'))}</span><SourceBadge source={row.__source}/></div><div className="timeline-main"><div className="metric-pair"><MoonStar/><span>Sleep</span><b>{str(row,'Sleep')||'To verify'}</b></div><div className="metric-pair"><Activity/><span>Energy</span><b>{str(row,'Energy')||'To verify'}</b></div><p>{str(row,'Soreness / Pain')||'No pain information recorded'}</p><small>{str(row,'Notes')}</small></div><ToneBadge tone={statusTone(`${str(row,'Soreness / Pain')} ${str(row,'Energy')}`) as 'green'|'amber'|'red'}>{str(row,'Steps / Cardio')||'Recovery log'}</ToneBadge></article>)}</div>
  </div>
}
