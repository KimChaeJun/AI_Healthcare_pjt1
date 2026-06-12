// src/types/health.ts
export interface HealthRow {
  나이?: string
  BMI?: string
  '공복 혈당'?: string
  '중성 지방'?: string
  '혈청 크레아티닌'?: string
  헤모글로빈?: string
  혈압?: string
  label?: string
  [key: string]: string | undefined
}