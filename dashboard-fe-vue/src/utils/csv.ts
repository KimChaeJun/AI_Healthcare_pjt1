import Papa from 'papaparse'
import type { HealthRow } from '../types/health'

export function loadCsv(): Promise<HealthRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<HealthRow>('./data/smoking_health_data.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: (error) => reject(error),
    })
  })
}

export function num(value: string | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return null

  const n = Number(String(value).replaceAll(',', '').trim())
  return Number.isFinite(n) ? n : null
}

export function avg(values: Array<number | null>): number | null {
  const nums = values.filter((v): v is number => v !== null)
  if (!nums.length) return null

  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function fmt(value: number | null, digit = 1): string {
  if (value === null || Number.isNaN(value)) return '-'
  return value.toFixed(digit)
}