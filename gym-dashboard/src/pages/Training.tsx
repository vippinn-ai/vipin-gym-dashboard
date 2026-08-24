import { useMemo, useState } from 'react'
import { Filter, SlidersHorizontal } from 'lucide-react'
import { PageIntro, SearchBox, SourceBadge, ToneBadge } from '../components'
import { data, dateLabel, statusTone, str } from '../data'

export function Training() {
  const [search, setSearch] = useState('')
  const [workout, setWorkout] = useState('All')
  const [type, setType] = useState('All')
  const workouts = ['All', ...new Set(data.journal.map((row) => str(row, 'Workout')).filter(Boolean))]
  const types = ['All', ...new Set(data.journal.map((row) => str(row, 'Set Type')).filter(Boolean))]
  const rows = useMemo(() => data.journal.filter((row) => {
    const haystack = Object.values(row).join(' ').toLowerCase()
    return (!search || haystack.includes(search.toLowerCase())) && (workout === 'All' || str(row,'Workout') === workout) && (type === 'All' || str(row,'Set Type') === type)
  }).reverse(), [search, workout, type])
  return <div className="page">
    <PageIntro eyebrow={`${data.journal.length} source-linked entries`} title="The complete training journal.">Every set remains comparable only within its recorded load basis. Filters never rewrite history.</PageIntro>
    <div className="filter-bar reveal"><SearchBox value={search} onChange={setSearch} placeholder="Exercise, note, load, pain…"/><label><Filter size={15}/><span className="sr-only">Workout</span><select value={workout} onChange={(e)=>setWorkout(e.target.value)}>{workouts.map(x=><option key={x}>{x}</option>)}</select></label><label><SlidersHorizontal size={15}/><span className="sr-only">Set type</span><select value={type} onChange={(e)=>setType(e.target.value)}>{types.map(x=><option key={x}>{x}</option>)}</select></label><b>{rows.length} results</b></div>
    <div className="data-table-wrap reveal"><table className="data-table"><thead><tr><th>Date</th><th>Workout / exercise</th><th>Set</th><th>Load basis</th><th>Reps</th><th>RIR</th><th>Classification</th><th>Notes</th></tr></thead><tbody>{rows.map((row,index)=><tr key={`${str(row,'Date')}-${str(row,'Exercise')}-${str(row,'Set')}-${index}`}>
      <td data-label="Date">{dateLabel(str(row,'Date'))}</td><td data-label="Exercise"><b>{str(row,'Exercise')}</b><small>{str(row,'Workout')}</small></td><td data-label="Set">{str(row,'Set')}</td><td data-label="Load"><b>{str(row,'Weight')}</b><small>{str(row,'Unit / Load Basis')}</small></td><td data-label="Reps">{str(row,'Reps')}</td><td data-label="RIR"><ToneBadge tone={statusTone(`RIR ${str(row,'RIR')}`) as 'green'|'amber'|'red'}>{str(row,'RIR') || '—'}</ToneBadge></td><td data-label="Type">{str(row,'Set Type') || 'Not recorded'}</td><td data-label="Notes"><p>{str(row,'Form Note') || str(row,'Coach Note') || '—'}</p><SourceBadge source={row.__source}/></td>
    </tr>)}</tbody></table></div>
  </div>
}
