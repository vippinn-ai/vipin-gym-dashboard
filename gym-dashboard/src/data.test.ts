import { describe, expect, it } from 'vitest'
import { containsUncertainty, data } from './data'

describe('generated coaching dataset', () => {
  it('preserves the complete source inventory', () => {
    expect(data.workbook.sheets).toHaveLength(11)
    expect(data.journal).toHaveLength(303)
    expect(data.sessions).toHaveLength(15)
    expect(data.markdownSections).toHaveLength(240)
    expect(data.evidence).toHaveLength(13)
  })

  it('keeps assisted repetitions separate from clean repetitions', () => {
    const assistedLegPress = data.journal.find((row) =>
      row.Exercise === 'Leg Press' && row['Set Type'] === 'Assisted',
    )

    expect(assistedLegPress).toBeDefined()
    expect(assistedLegPress?.Reps).toBe(8)
    expect(assistedLegPress?.['Form Note']).toContain('4 clean + 4 hand-assisted')
    expect(assistedLegPress?.['Form Note']).toContain('do not treat as 8 clean')
  })

  it('retains source links and uncertainty flags', () => {
    expect(data.journal.every((row) => row.__source?.sheet && row.__source?.row)).toBe(true)
    const sabji = data.protein.find((row) => row.Food === 'Sabji')
    expect(sabji).toBeDefined()
    expect(containsUncertainty(sabji!)).toBe(true)
  })

  it('reconciles the quantified daily protein subtotal', () => {
    const subtotal = data.protein.reduce(
      (sum, row) => sum + (Number(row['Calculated protein (g)']) || 0),
      0,
    )
    expect(subtotal).toBeCloseTo(113.59635, 5)
  })
})
