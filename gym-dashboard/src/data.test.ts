import { describe, expect, it } from 'vitest'
import { containsUncertainty, data } from './data'

describe('generated coaching dataset', () => {
  it('preserves the complete source inventory', () => {
    expect(data.workbook.sheets).toHaveLength(11)
    expect(data.journal).toHaveLength(406)
    expect(data.sessions).toHaveLength(20)
    expect(data.markdownSections).toHaveLength(312)
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

  it('records the August 22 triceps session without misclassifying machine assistance', () => {
    const latestSession = data.sessions.find((row) => row.Date === '2026-08-22')
    expect(latestSession?.Workout).toBe('Triceps')
    expect(latestSession?.['Set Entries']).toBe(20)

    const tricepsRows = data.journal.filter((row) => row.Date === '2026-08-22')
    expect(tricepsRows).toHaveLength(20)
    expect(tricepsRows.filter((row) => row['Set Type'] === 'Working')).toHaveLength(19)
    expect(tricepsRows.filter((row) => row['Set Type'] === 'Warm-up')).toHaveLength(1)

    const assistedDips = tricepsRows.filter((row) => row.Exercise === 'Assisted Dip Machine')
    expect(assistedDips).toHaveLength(3)
    expect(assistedDips.every((row) => row['Set Type'] === 'Working')).toBe(true)
    expect(assistedDips.every((row) => String(row['Unit / Load Basis']).includes('higher is easier'))).toBe(true)
    expect(tricepsRows.some((row) => row['Set Type'] === 'Assisted')).toBe(false)
  })

  it('records the August 24 combined session and standardized body check-in', () => {
    const latestSession = data.sessions.find((row) => row.Date === '2026-08-24')
    expect(latestSession?.Workout).toBe('Back + Biceps')
    expect(latestSession?.['Set Entries']).toBe(20)

    const combinedRows = data.journal.filter((row) => row.Date === '2026-08-24')
    expect(combinedRows).toHaveLength(20)
    expect(combinedRows.filter((row) => row['Set Type'] === 'Working')).toHaveLength(18)
    expect(combinedRows.filter((row) => row['Set Type'] === 'Warm-up')).toHaveLength(2)
    expect(combinedRows.filter((row) => row['Set Type'] === 'Assisted')).toHaveLength(0)
    expect(combinedRows.filter((row) => row.Workout === 'Back')).toHaveLength(14)
    expect(combinedRows.filter((row) => row.Workout === 'Biceps')).toHaveLength(6)
    expect(
      combinedRows
        .filter((row) => row['Set Type'] === 'Warm-up')
        .every((row) => row.RIR === 3),
    ).toBe(true)

    const checkIn = data.recovery.find((row) => row.Date === '2026-08-23')
    expect(checkIn?.['Weight (kg)']).toBe(87.7)
    expect(checkIn?.['Waist (cm)']).toBe(96.5)
    expect(checkIn?.Notes).toContain('87.6-87.7 kg')
  })

  it('records the August 25 combined session with fatigue and uncertainty intact', () => {
    const latestSession = data.sessions.find((row) => row.Date === '2026-08-25')
    expect(latestSession?.Workout).toBe('Chest + Triceps')
    expect(latestSession?.['Set Entries']).toBe(20)
    expect(latestSession?.['Coach Assessment']).toContain('19 meaningful sets')

    const combinedRows = data.journal.filter((row) => row.Date === '2026-08-25')
    expect(combinedRows).toHaveLength(20)
    expect(combinedRows.filter((row) => row['Set Type'] === 'Working')).toHaveLength(19)
    expect(combinedRows.filter((row) => row['Set Type'] === 'Warm-up')).toHaveLength(1)
    expect(combinedRows.filter((row) => row['Set Type'] === 'Assisted')).toHaveLength(0)
    expect(combinedRows.filter((row) => row.Workout === 'Chest')).toHaveLength(13)
    expect(combinedRows.filter((row) => row.Workout === 'Triceps')).toHaveLength(7)
    expect(combinedRows.filter((row) => row.RIR === 0)).toHaveLength(1)

    const pecDeckRows = combinedRows.filter((row) => row.Exercise === 'Pec Deck Fly')
    expect(pecDeckRows).toHaveLength(3)
    expect(pecDeckRows.every((row) => containsUncertainty(row))).toBe(true)
    expect(pecDeckRows.at(-1)?.['Coach Note']).toContain('omit 60 kg')

    const recovery = data.recovery.find((row) => row.Date === '2026-08-25')
    expect(recovery?.Energy).toBe('Low final')
    expect(recovery?.['Soreness / Pain']).toContain('non-painful upper-biceps/arm pump')
  })
})
