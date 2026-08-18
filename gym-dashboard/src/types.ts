export type SourceRef = { file: string; sheet?: string; row?: number; range?: string; anchor?: string }
export type GenericRecord = Record<string, string | number | boolean | null | SourceRef> & { __source?: SourceRef }

export type EvidenceAsset = {
  id: string
  name: string
  category: string
  path: string
  sourcePath: string
  bytes: number
  sha256: string
}

export type MarkdownSection = {
  id: string
  level: number
  title: string
  anchor: string
  raw: string
  html: string
  source: SourceRef
}

export type WorkbookSheet = { name: string; usedRange: string | null; rows: Array<Array<string | number | boolean | null>> }

export type GymDataBundle = {
  schemaVersion: number
  generatedAt: string
  sourceFiles: Array<{ name: string; path: string; sha256: string }>
  workbook: { sheets: WorkbookSheet[] }
  journal: GenericRecord[]
  sessions: GenericRecord[]
  targets: GenericRecord[]
  recovery: GenericRecord[]
  protein: GenericRecord[]
  profile: GenericRecord[]
  programNotes: GenericRecord[]
  markdownSections: MarkdownSection[]
  evidence: EvidenceAsset[]
}
