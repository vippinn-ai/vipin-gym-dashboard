import { PageIntro, SourceBadge, ToneBadge } from '../components'
import { containsUncertainty, data, str } from '../data'
import type { GenericRecord } from '../types'

export function Verification() {
  const groups:[string,GenericRecord[]][]=[['Training journal',data.journal],['Sessions',data.sessions],['Targets',data.targets],['Recovery',data.recovery],['Nutrition',data.protein],['Profile',data.profile],['Program notes',data.programNotes]]
  const open=groups.map(([label,rows])=>[label,rows.filter(containsUncertainty)] as [string,GenericRecord[]]).filter(([,rows])=>rows.length)
  return <div className="page"><PageIntro eyebrow="Uncertainty is data" title="The verification queue.">Nothing uncertain is silently promoted to fact. This page collects every active “To verify,” pending, unrecorded or nearly-assisted item.</PageIntro><div className="verification-groups">{open.map(([label,rows])=><section key={label}><header><h2>{label}</h2><ToneBadge tone="amber">{rows.length} flagged</ToneBadge></header>{rows.map((row,index)=><article key={index}><h3>{str(row,'Exercise')||str(row,'Item')||str(row,'Food')||str(row,'Category')||str(row,'Workout')||'Record'}</h3><p>{Object.entries(row).filter((entry): entry is [string, string] => entry[0] !== '__source' && typeof entry[1] === 'string' && /to verify|not recorded|uncertain|pending|nearly assisted/i.test(entry[1])).map(([key,value])=><span key={key}><b>{key}</b>{value}</span>)}</p><SourceBadge source={row.__source}/></article>)}</section>)}</div></div>
}
