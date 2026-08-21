import { describe, expect, it } from 'vitest'
import { containsUncertainty, data } from './data'

describe('generated coaching dataset', () => {
  it('preserves the complete source inventory', () => {
    expect(data.workbook.sheets).toHaveLength(11)
    expect(data.journal).toHaveLength(346)
    expect(data.sessions).toHaveLength(17)
    expect(data.markdownSections).toHaveLength(270)
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

    const latestAssistedLegPress = data.journal.find((row) =>
      row.Date === '2026-08-20' && row.Exercise === 'Leg Press' && row['Set Type'] === 'Assisted',
    )
    expect(latestAssistedLegPress).toBeDefined()
    expect(latestAssistedLegPress?.Reps).toBe(7)
    expect(latestAssistedLegPress?.['Form Note']).toContain('approximately 2-3 hand-assisted')
    expect(latestAssistedLegPress?.['Form Note']).toContain('approximately 4-5 clean To verify')
    expect(latestAssistedLegPress?.['Form Note']).toContain('do not treat as 7 clean')
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

  it('retains the shoulder experiments without treating the cable shrug as progression', () => {
    const latestSession = data.sessions.find((row) => row.Date === '2026-08-21')
    expect(latestSession?.Workout).toBe('Shoulders')
    expect(latestSession?.['Set Entries']).toBe(25)

    const cableShrugs = data.journal.filter(
      (row) => row.Date === '2026-08-21' && row.Exercise === 'Cable Shrug',
    )
    expect(cableShrugs).toHaveLength(3)
    expect(cableShrugs.at(-1)?.['Coach Note']).toContain('Replace with dumbbell')

    const cableShrugTarget = data.targets.find((row) => row.Exercise === 'Cable Shrug')
    expect(cableShrugTarget?.Status).toContain('Replaced')
    expect(containsUncertainty(cableShrugTarget!)).toBe(true)
  })
})
