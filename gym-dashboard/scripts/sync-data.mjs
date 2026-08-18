import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { unzipSync, strFromU8 } from 'fflate'
import { XMLParser } from 'fast-xml-parser'
import { marked } from 'marked'

const here = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(here, '..')
const gymRoot = path.resolve(projectRoot, '..')
const workbookName = 'Vipin_Gym_Progress_Dashboard_2026-08-07_v2.xlsx'
const markdownName = 'Vipin_Gym_Codex_Context_2026-08-07.md'
const workbookPath = path.join(gymRoot, workbookName)
const markdownPath = path.join(gymRoot, markdownName)
const generatedDir = path.join(projectRoot, 'src', 'generated')
const publicDir = path.join(projectRoot, 'public')
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', parseTagValue: false, trimValues: false, removeNSPrefix: true })

const arr = (value) => value == null ? [] : Array.isArray(value) ? value : [value]
const text = (value) => {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value.t != null) return arr(value.t).map(text).join('')
  if (value.r != null) return arr(value.r).map((part) => text(part.t)).join('')
  return ''
}
const colIndex = (ref) => [...ref.match(/^[A-Z]+/i)?.[0] ?? ''].reduce((n, ch) => n * 26 + ch.toUpperCase().charCodeAt(0) - 64, 0) - 1
const excelDate = (serial) => new Date(Date.UTC(1899, 11, 30) + Number(serial) * 86400000).toISOString().slice(0, 10)
const dateFormat = (format = '') => /(^|[^a-z])[dmy]{1,4}([^a-z]|$)/i.test(format.replace(/\[[^\]]+\]/g, ''))
const hash = async (file) => crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex')

async function readWorkbook(file) {
  const zip = unzipSync(new Uint8Array(await fs.readFile(file)))
  const xml = (name) => parser.parse(strFromU8(zip[name]))
  const workbook = xml('xl/workbook.xml').workbook
  const rels = xml('xl/_rels/workbook.xml.rels').Relationships.Relationship
  const relMap = Object.fromEntries(arr(rels).map((rel) => [rel['@_Id'], rel['@_Target']]))
  const shared = zip['xl/sharedStrings.xml'] ? arr(xml('xl/sharedStrings.xml').sst.si).map(text) : []
  const stylesDoc = zip['xl/styles.xml'] ? xml('xl/styles.xml').styleSheet : {}
  const customFormats = Object.fromEntries(arr(stylesDoc.numFmts?.numFmt).map((item) => [Number(item['@_numFmtId']), item['@_formatCode']]))
  const xfs = arr(stylesDoc.cellXfs?.xf)
  const isDateStyle = (styleId) => {
    const numFmtId = Number(xfs[Number(styleId) || 0]?.['@_numFmtId'] ?? 0)
    return (numFmtId >= 14 && numFmtId <= 22) || dateFormat(customFormats[numFmtId])
  }
  const sheets = []
  for (const sheetDef of arr(workbook.sheets.sheet)) {
    const name = sheetDef['@_name']
    const target = relMap[sheetDef['@_id']].replace(/^\//, '')
    const zipPath = target.startsWith('xl/') ? target : `xl/${target}`
    const sheet = xml(zipPath).worksheet
    const cellMap = new Map()
    let maxRow = 0
    let maxCol = 0
    for (const row of arr(sheet.sheetData?.row)) {
      const rowNum = Number(row['@_r'])
      maxRow = Math.max(maxRow, rowNum)
      for (const cell of arr(row.c)) {
        const ref = cell['@_r']
        const col = colIndex(ref)
        maxCol = Math.max(maxCol, col + 1)
        const type = cell['@_t']
        let value = cell.v ?? text(cell.is)
        if (type === 's') value = shared[Number(value)] ?? ''
        else if (type === 'inlineStr') value = text(cell.is)
        else if (type === 'b') value = value === '1'
        else if ((type == null || type === 'n') && value !== '' && Number.isFinite(Number(value))) {
          value = isDateStyle(cell['@_s']) ? excelDate(value) : Number(value)
        }
        cellMap.set(`${rowNum}:${col}`, value)
      }
    }
    const rows = Array.from({ length: maxRow }, (_, r) => Array.from({ length: maxCol }, (_, c) => cellMap.get(`${r + 1}:${c}`) ?? null))
    sheets.push({ name, usedRange: sheet.dimension?.['@_ref'] ?? null, rows })
  }
  return sheets
}

const norm = (value) => String(value ?? '').trim()
const key = (value) => norm(value).toLowerCase().replace(/[^a-z0-9]+/g, '')
function tableFromHeader(sheet, required) {
  const headerIndex = sheet.rows.findIndex((row) => required.every((h) => row.some((cell) => key(cell) === key(h))))
  if (headerIndex < 0) return []
  const headers = sheet.rows[headerIndex].map((h, i) => norm(h) || `Column ${i + 1}`)
  return sheet.rows.slice(headerIndex + 1)
    .filter((row) => row.some((cell) => cell != null && norm(cell) !== ''))
    .map((row, offset) => ({
      ...Object.fromEntries(headers.map((header, i) => [header, row[i] ?? null])),
      __source: { file: workbookName, sheet: sheet.name, row: headerIndex + offset + 2, range: `A${headerIndex + offset + 2}` }
    }))
}

function tableFromRows(sheet, headers, startIndex) {
  return sheet.rows.slice(startIndex)
    .filter((row) => row.slice(0, headers.length).some((cell) => cell != null && norm(cell) !== ''))
    .map((row, offset) => ({
      ...Object.fromEntries(headers.map((header, i) => [header, row[i] ?? null])),
      __source: { file: workbookName, sheet: sheet.name, row: startIndex + offset + 1, range: `A${startIndex + offset + 1}` }
    }))
}

function parseMarkdown(source) {
  const lines = source.split(/\r?\n/)
  const sections = []
  let current = { level: 0, title: 'Document introduction', anchor: 'document-introduction', lines: [] }
  const slugCount = new Map()
  const slug = (title) => {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section'
    const count = (slugCount.get(base) ?? 0) + 1
    slugCount.set(base, count)
    return count === 1 ? base : `${base}-${count}`
  }
  for (const line of lines) {
    const match = /^(#{1,4})\s+(.+)$/.exec(line)
    if (match) {
      if (current.lines.length || current.title !== 'Document introduction') sections.push(current)
      current = { level: match[1].length, title: match[2].trim(), anchor: slug(match[2]), lines: [] }
    } else current.lines.push(line)
  }
  sections.push(current)
  return sections.map((section, index) => {
    const raw = section.lines.join('\n').trim()
    return {
      id: `md-${index + 1}`,
      level: section.level,
      title: section.title,
      anchor: section.anchor,
      raw,
      html: marked.parse(raw, { async: false }),
      source: { file: markdownName, anchor: section.anchor }
    }
  })
}

async function evidenceManifest() {
  const source = path.join(gymRoot, 'evidence')
  const destination = path.join(publicDir, 'evidence')
  await fs.rm(destination, { recursive: true, force: true })
  await fs.cp(source, destination, { recursive: true })
  const files = []
  async function walk(directory) {
    for (const item of await fs.readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, item.name)
      if (item.isDirectory()) await walk(absolute)
      else {
        const relative = path.relative(source, absolute).replaceAll('\\', '/')
        const stat = await fs.stat(absolute)
        files.push({
          id: relative.replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
          name: item.name.replace(/^[0-9]+-/, '').replace(/\.[^.]+$/, '').replaceAll('-', ' '),
          category: relative.split('/').slice(0, -1).join(' / ').replaceAll('-', ' '),
          path: `evidence/${relative}`,
          sourcePath: `evidence/${relative}`,
          bytes: stat.size,
          sha256: await hash(absolute)
        })
      }
    }
  }
  await walk(source)
  return files
}

await fs.mkdir(generatedDir, { recursive: true })
await fs.mkdir(path.join(publicDir, 'sources'), { recursive: true })
const [sheets, markdown, evidence] = await Promise.all([
  readWorkbook(workbookPath),
  fs.readFile(markdownPath, 'utf8'),
  evidenceManifest()
])
await Promise.all([
  fs.copyFile(workbookPath, path.join(publicDir, 'sources', workbookName)),
  fs.copyFile(markdownPath, path.join(publicDir, 'sources', markdownName))
])
const byName = Object.fromEntries(sheets.map((sheet) => [sheet.name, sheet]))
const proteinRows = tableFromHeader(byName['Protein Calculator'], ['Meal', 'Food', 'Quantity', 'Calculated protein (g)'])
  .filter((row) => ['Breakfast','Lunch','Evening','During workout','Post-workout','Dinner'].includes(row.Meal))
const bundle = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sourceFiles: [
    { name: workbookName, path: `sources/${workbookName}`, sha256: await hash(workbookPath) },
    { name: markdownName, path: `sources/${markdownName}`, sha256: await hash(markdownPath) }
  ],
  workbook: { sheets },
  journal: tableFromHeader(byName['Workout Journal'], ['Date', 'Workout', 'Exercise', 'Set']),
  sessions: tableFromHeader(byName['Session Summary'], ['Date', 'Workout', 'Exercises', 'Set Entries']),
  targets: tableFromRows(byName['Exercise Targets'], ['Muscle','Exercise','Current Best Set','Current Working Zone','Next Target','Progress Rule','Technique Focus','Status','Notes'], 4),
  recovery: tableFromHeader(byName['Recovery & Body'], ['Date', 'Weight (kg)', 'Waist (cm)', 'Sleep']),
  protein: proteinRows,
  profile: tableFromHeader(byName['Coaching Profile'], ['Category', 'Item', 'Current Value', 'Status']),
  programNotes: tableFromRows(byName['Program Notes'], ['Category','Rule / Observation','Why It Matters','Action'], 4),
  markdownSections: parseMarkdown(markdown),
  evidence
}
await fs.writeFile(path.join(generatedDir, 'gym-data.json'), JSON.stringify(bundle, null, 2))
console.log(`Generated ${bundle.journal.length} journal entries, ${bundle.sessions.length} sessions, ${bundle.markdownSections.length} coaching sections, and ${bundle.evidence.length} evidence files.`)
