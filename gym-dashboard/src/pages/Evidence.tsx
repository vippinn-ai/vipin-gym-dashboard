import { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'
import { PageIntro, SearchBox, publicUrl } from '../components'
import { data } from '../data'
import type { EvidenceAsset } from '../types'

export function Evidence() {
  const [search,setSearch]=useState('')
  const [active,setActive]=useState<EvidenceAsset|null>(null)
  const assets=data.evidence.filter(asset=>`${asset.name} ${asset.category}`.toLowerCase().includes(search.toLowerCase()))
  return <div className="page"><PageIntro eyebrow="Nutrition and supplement evidence" title="Every label behind the numbers.">Open the original captured images, inspect their context, and trace each calculation back to its evidence folder.</PageIntro><div className="filter-bar reveal"><SearchBox value={search} onChange={setSearch} placeholder="Search labels and products…"/><b>{assets.length} images</b></div><div className="evidence-grid">{assets.map(asset=><button key={asset.id} onClick={()=>setActive(asset)}><img src={publicUrl(asset.path)} alt={asset.name}/><span><small>{asset.category}</small><b>{asset.name}</b><em><ZoomIn size={14}/> Inspect source</em></span></button>)}</div>{active&&<div className="lightbox" role="dialog" aria-modal="true" aria-label={active.name} onClick={()=>setActive(null)}><button aria-label="Close image"><X/></button><figure onClick={e=>e.stopPropagation()}><img src={publicUrl(active.path)} alt={active.name}/><figcaption><b>{active.name}</b><span>{active.sourcePath}</span><small>SHA-256 · {active.sha256}</small></figcaption></figure></div>}</div>
}
