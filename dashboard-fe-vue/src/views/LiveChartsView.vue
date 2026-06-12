<template>
  <section class="section grid-two">
    <div>
      <p class="section-kicker">Overview</p>
      <h2>데이터 파일을 기준으로 주요 건강 지표가 실시간 집계됩니다.</h2>
      <p class="muted">
        CSV를 교체하면 Overview, Hypothesis, Live Charts의 값이 자동으로 다시 계산됩니다.
      </p>
    </div>

    <div class="summary-box">
      <p>현재 데이터는 <b>{{ rowCount.toLocaleString() }}행</b>입니다.</p>
      <p>흡연자: <b>{{ smokerCount.toLocaleString() }}명</b></p>
      <p>비흡연자: <b>{{ nonSmokerCount.toLocaleString() }}명</b></p>
      <p>흡연자 비율: <b>{{ smokerRate }}%</b></p>
    </div>
  </section>

  <section class="section">
    <div class="section-title">
      <p class="section-kicker">Table</p>
      <h2>주요 지표 요약표</h2>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>지표</th>
            <th>전체 평균</th>
            <th>비흡연자 평균</th>
            <th>흡연자 평균</th>
            <th>차이</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in summaryRows" :key="row.metric">
            <td>{{ row.metric }}</td>
            <td>{{ row.all }}</td>
            <td>{{ row.nonSmoker }}</td>
            <td>{{ row.smoker }}</td>
            <td>{{ row.diff }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { avg, fmt, loadCsv, num } from '../utils/csv'
import type { HealthRow } from '../types/health'

const rows = ref<HealthRow[]>([])

const metricCols = ['공복 혈당', '중성 지방', '혈청 크레아티닌', '헤모글로빈', 'BMI', '혈압']

onMounted(async () => {
  rows.value = await loadCsv()
})

const rowCount = computed(() => rows.value.length)

const smokerCount = computed(() => rows.value.filter((row) => row.label === '1').length)
const nonSmokerCount = computed(() => rows.value.filter((row) => row.label === '0').length)

const smokerRate = computed(() => {
  if (!rowCount.value) return 0
  return Math.round((smokerCount.value / rowCount.value) * 100)
})

function groupAvg(label: '0' | '1', col: string): number | null {
  return avg(rows.value.filter((row) => row.label === label).map((row) => num(row[col])))
}

const summaryRows = computed(() => {
  return metricCols.map((metric) => {
    const all = avg(rows.value.map((row) => num(row[metric])))
    const nonSmoker = groupAvg('0', metric)
    const smoker = groupAvg('1', metric)
    const diff = smoker !== null && nonSmoker !== null ? smoker - nonSmoker : null

    return {
      metric,
      all: fmt(all),
      nonSmoker: fmt(nonSmoker),
      smoker: fmt(smoker),
      diff: fmt(diff),
    }
  })
})
</script>