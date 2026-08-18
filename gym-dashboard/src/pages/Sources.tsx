import { useMemo, useState } from 'react'
import { Download, FileText, Sheet } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { PageIntro, SearchBox, publicUrl } from '../components'
import { data } from '../data'

export function Sources() {
  const location=useLocation(); const params=new URLSearchParams(location.search)
  const requested=params.get('sheet')||data.workbook.sheets[0].name
  const [sheetName,setSheetName]=useState(data.workbook.sheets.some(s=>s.name===requested)?requested:data.workbook.sheets[0].name)
  const [search,setSearch]=useState('')
  const sheet=data.workbook.sheets.find(s=>s.name===sheetName)!
  const visible=useMemo(()=>sheet.rows.map((row,index)=>({row,index:index+1})).filter(({row})=>!search||row.join(' ').toLowerCase().includes(search.toLowerCase())),[sheet,search])
  return <div className="page"><PageIntro eyebrow="Raw source explorer" title="Every workbook area, intact." action={<div className="download-group">{data.sourceFiles.map(file=><a className="button" key={file.name} href={publicUrl(file.path)} download><Download size={15}/>{file.name.endsWith('.xlsx')?'Excel':'Markdown'}</a>)}</div>}>Browse the full extracted workbook matrix, then download the original canonical files. No dashboard abstraction replaces the underlying records.</PageIntro><div className="source-controls reveal"><label><Sheet size={16}/>Sheet<select value={sheetName} onChange={e=>setSheetName(e.target.value)}>{data.workbook.sheets.map(s=><option key={s.name}>{s.name}</option>)}</select></label><SearchBox value={search} onChange={setSearch} placeholder="Search this sheet…"/><span>{sheet.usedRange}</span></div><div className="raw-table-wrap"><table className="raw-table"><tbody>{visible.map(({row,index})=><tr key={index} className={String(index)===params.get('row')?'highlight':''}><th>{index}</th>{row.map((cell,col)=><td key={col}>{cell==null?'':String(cell)}</td>)}</tr>)}</tbody></table></div><footer className="source-footer"><FileText size={16}/>Generated {new Date(data.generatedAt).toLocaleString('en-IN')} · schema v{data.schemaVersion}</footer></div>
}
