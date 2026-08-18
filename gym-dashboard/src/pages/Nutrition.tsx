import { AlertCircle, CheckCircle2, Coffee, Droplets, Utensils } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PageIntro, Section, SourceBadge, Stat, ToneBadge } from '../components'
import { data, num, statusTone, str } from '../data'

export function Nutrition() {
  const known = data.protein.reduce((sum,row)=>sum+num(row,'Calculated protein (g)'),0)
  const mealTotals = [...new Set(data.protein.map(row=>str(row,'Meal')))].map(meal=>({meal,protein:data.protein.filter(row=>str(row,'Meal')===meal).reduce((s,row)=>s+num(row,'Calculated protein (g)'),0)}))
  return <div className="page">
    <PageIntro eyebrow="Quantified minimum, not an invented total" title="Nutrition with the unknowns left honest.">Only verified label values and directly reported protein are counted. Lentils, sabji, fruit and salad still raise the actual total.</PageIntro>
    <section className="stats-grid nutrition-stats"><Stat label="Known minimum" value={`${known.toFixed(1)} g`} note="per reported training-day meal plan" accent/><Stat label="Provisional range" value="140–170 g" note="working range pending complete intake"/><Stat label="Known gap" value={`${Math.max(0,140-known).toFixed(1)} g`} note="before unquantified foods"/><Stat label="Water" value="3–4 L" note="typical intake reported"/></section>
    <div className="two-column">
      <Section title="Protein by meal" kicker="Known contributions"><div className="chart-wrap"><ResponsiveContainer width="100%" height={300}><BarChart data={mealTotals} layout="vertical" margin={{left:22,right:20}}><CartesianGrid strokeDasharray="2 6" horizontal={false}/><XAxis type="number" hide/><YAxis type="category" dataKey="meal" width={102} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="protein" fill="#56733f" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></div></Section>
      <Section title="Daily guardrails" kicker="Current guidance"><div className="guardrail-list"><div><Utensils/><span><b>Meal pattern</b>Lacto-vegetarian; no eggs</span></div><div><Coffee/><span><b>Late stimulant</b>Full EAA+ scoop supplies 100 mg caffeine; no added coffee by default</span></div><div><Droplets/><span><b>Hydration</b>Track actual training- and rest-day intake</span></div><div><AlertCircle/><span><b>Do not infer</b>Oil, ghee, cooked lentils and mixed dishes remain unquantified</span></div></div></Section>
    </div>
    <Section title="Protein calculator" kicker={`${data.protein.length} recorded foods`}><div className="food-grid">{data.protein.map((row,index)=><article key={`${str(row,'Meal')}-${str(row,'Food')}-${index}`}><header><span>{str(row,'Meal')}</span><ToneBadge tone={statusTone(str(row,'Status')) as 'green'|'amber'|'red'}>{str(row,'Status')}</ToneBadge></header><h3>{str(row,'Food')}</h3><strong>{str(row,'Calculated protein (g)') ? `${Number(str(row,'Calculated protein (g)')).toFixed(1)} g` : 'Not quantified'}</strong><p>{str(row,'Quantity')} {str(row,'Unit')}</p><small>{str(row,'Evidence / missing input')}</small><SourceBadge source={row.__source}/></article>)}</div></Section>
    <div className="closing-strip reveal"><div><CheckCircle2/><span><b>Current quantified result</b> 113.60 g/day; source foods remain individually auditable.</span></div></div>
  </div>
}
