import raw from './generated/gym-data.json'
import type { GenericRecord, GymDataBundle } from './types'

export const data = raw as GymDataBundle
export const value = (record: GenericRecord, name: string) => record[name] as string | number | boolean | null | undefined
export const str = (record: GenericRecord, name: string) => String(value(record, name) ?? '')
export const num = (record: GenericRecord, name: string) => Number(value(record, name) ?? 0)
export const containsUncertainty = (record: GenericRecord) => Object.values(record).some((item) => typeof item === 'string' && /to verify|not recorded|uncertain|pending|nearly assisted/i.test(item))
export const dateLabel = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`)
  return Number.isNaN(date.getTime()) ? iso : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}
export const statusTone = (text: string) => /verify|pending|partial|yellow|modify/i.test(text) ? 'amber' : /pain|red|rir 0|assisted/i.test(text) ? 'red' : 'green'
