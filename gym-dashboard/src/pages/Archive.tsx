import { useMemo, useState } from 'react'
import { PageIntro, SearchBox, SourceBadge } from '../components'
import { data } from '../data'

export function Archive() {
  const [search,setSearch]=useState('')
  const sections=useMemo(()=>data.markdownSections.filter(section=>`${section.title} ${section.raw}`.toLowerCase().includes(search.toLowerCase())),[search])
  return <div className="page"><PageIntro eyebrow="Full Markdown coaching context" title="The complete coaching archive.">All historical recommendations, corrections and superseded decisions remain searchable and source-linked.</PageIntro><div className="filter-bar reveal"><SearchBox value={search} onChange={setSearch} placeholder="Search workouts, sleep, protein, targets…"/><b>{sections.length} sections</b></div><div className="archive-list">{sections.map(section=><details key={section.id} id={section.anchor}><summary><span>{section.level ? `H${section.level}` : 'Intro'}</span><b>{section.title}</b><SourceBadge source={section.source}/></summary><article className="markdown-body" dangerouslySetInnerHTML={{__html:section.html}}/></details>)}</div></div>
}
