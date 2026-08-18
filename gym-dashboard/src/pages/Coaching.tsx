import { PageIntro, Section, SourceBadge, ToneBadge } from '../components'
import { data, statusTone, str } from '../data'

export function Coaching() {
  const categories = [...new Set(data.profile.map(row=>str(row,'Category')))]
  return <div className="page">
    <PageIntro eyebrow="Profile · constraints · program rules" title="The coaching operating system.">Current facts, partial information, standing rules and next checks are shown together—without turning provisional guidance into certainty.</PageIntro>
    {categories.map(category=><Section key={category} title={category} kicker="Coaching profile"><div className="profile-grid">{data.profile.filter(row=>str(row,'Category')===category).map((row,index)=><article key={`${str(row,'Item')}-${index}`}><header><h3>{str(row,'Item')}</h3><ToneBadge tone={statusTone(str(row,'Status')) as 'green'|'amber'|'red'}>{str(row,'Status')}</ToneBadge></header><p>{str(row,'Current Value')}</p><small>{str(row,'Why Needed / Next Check')}</small><SourceBadge source={row.__source}/></article>)}</div></Section>)}
    <Section title="Program rules and trainer notes" kicker={`${data.programNotes.length} retained decisions`}><div className="rules-list">{data.programNotes.map((row,index)=><article key={`${str(row,'Category')}-${index}`}><span>{String(index+1).padStart(2,'0')}</span><div><h3>{str(row,'Category')}</h3><p>{str(row,'Rule / Observation')}</p></div><div><b>Why</b><p>{str(row,'Why It Matters')}</p></div><div><b>Action</b><p>{str(row,'Action')}</p><SourceBadge source={row.__source}/></div></article>)}</div></Section>
  </div>
}
