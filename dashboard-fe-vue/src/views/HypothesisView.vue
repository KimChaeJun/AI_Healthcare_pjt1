<template>
  <section class="section">
    <div class="section-title">
      <p class="section-kicker">Hypothesis Lab</p>
      <h2>가설별 기준값 분석</h2>
      <p class="muted">
        각 가설의 기준값을 바꾸면 기준 초과 비율, 평균 비교, 분포, 자동 해석이 함께 갱신됩니다.
      </p>
    </div>

    <div class="hypothesis-tabs">
      <button
        v-for="item in hypotheses"
        :key="item.id"
        class="tab-button"
        :class="{ active: selectedId === item.id }"
        @click="selectHypothesis(item.id)"
      >
        {{ item.tab }}
      </button>
    </div>

    <div class="hypothesis-panel">
      <div class="hypothesis-control">
        <div>
          <p class="section-kicker">{{ selected.kicker }}</p>
          <h3>{{ selected.title }}</h3>
          <p class="muted">{{ selected.desc }}</p>
        </div>

        <label class="threshold-input">
          <span>기준값</span>
          <input v-model.number="threshold" type="number" step="0.1" @input="drawCharts" />
        </label>
      </div>

      <div class="hypothesis-stats">
        <div><b>{{ selected.metric }}</b><span>분석 지표</span></div>
        <div><b>{{ threshold }}</b><span>현재 기준값</span></div>
        <div><b>{{ smokerOverRate }}%</b><span>흡연자 기준 초과율</span></div>
        <div><b>{{ nonSmokerOverRate }}%</b><span>비흡연자 기준 초과율</span></div>
      </div>

      <div class="chart-grid">
        <article class="chart-card">
          <h3>흡연 여부별 평균 비교</h3>
          <canvas ref="meanCanvas"></canvas>
        </article>

        <article class="chart-card">
          <h3>기준값 이상 비율</h3>
          <canvas ref="overRateCanvas"></canvas>
        </article>

        <article class="chart-card">
          <h3>기준값 기준 인원 분포</h3>
          <canvas ref="countCanvas"></canvas>
        </article>

        <article class="chart-card">
          <h3>나이대별 기준값 이상 비율</h3>
          <canvas ref="ageCanvas"></canvas>
        </article>
      </div>

      <div class="summary-box hypothesis-summary">
        {{ summaryText }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { avg, loadCsv, num } from '../utils/csv'
import type { HealthRow } from '../types/health'

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
)

interface Hypothesis {
  id: 'hemo' | 'tg' | 'creatinine'
  tab: string
  kicker: string
  title: string
  desc: string
  metric: string
  defaultThreshold: number
}

const hypotheses: Hypothesis[] = [
  {
    id: 'hemo',
    tab: '가설 1 · 헤모글로빈',
    kicker: 'Hypothesis 1',
    title: '흡연자는 헤모글로빈 수치가 높을 것이다',
    desc: '흡연 여부별 헤모글로빈 평균과 기준값 이상 비율을 비교합니다.',
    metric: '헤모글로빈',
    defaultThreshold: 15,
  },
  {
    id: 'tg',
    tab: '가설 2 · 중성 지방',
    kicker: 'Hypothesis 2',
    title: '흡연자는 중성 지방 수치가 높을 것이다',
    desc: '흡연 여부별 중성 지방 평균과 기준값 이상 비율을 비교합니다.',
    metric: '중성 지방',
    defaultThreshold: 150,
  },
  {
    id: 'creatinine',
    tab: '가설 3 · 혈청 크레아티닌',
    kicker: 'Hypothesis 3',
    title: '흡연자는 혈청 크레아티닌 수치가 높을 것이다',
    desc: '흡연 여부별 혈청 크레아티닌 평균과 기준값 이상 비율을 비교합니다.',
    metric: '혈청 크레아티닌',
    defaultThreshold: 1.2,
  },
]

const rows = ref<HealthRow[]>([])
const selectedId = ref<Hypothesis['id']>('hemo')
const threshold = ref<number>(15)

const meanCanvas = ref<HTMLCanvasElement | null>(null)
const overRateCanvas = ref<HTMLCanvasElement | null>(null)
const countCanvas = ref<HTMLCanvasElement | null>(null)
const ageCanvas = ref<HTMLCanvasElement | null>(null)

let charts: Chart[] = []

const selected = computed(() => hypotheses.find((item) => item.id === selectedId.value) ?? hypotheses[0])

const smokers = computed(() => rows.value.filter((row) => row.label === '1'))
const nonSmokers = computed(() => rows.value.filter((row) => row.label === '0'))

function values(group: HealthRow[]): number[] {
  return group
    .map((row) => num(row[selected.value.metric]))
    .filter((value): value is number => value !== null)
}

function overRate(group: HealthRow[]): number {
  const nums = values(group)
  if (!nums.length) return 0

  const over = nums.filter((value) => value >= threshold.value).length
  return Math.round((over / nums.length) * 100)
}

const smokerOverRate = computed(() => overRate(smokers.value))
const nonSmokerOverRate = computed(() => overRate(nonSmokers.value))

const summaryText = computed(() => {
  const smokerAvg = avg(values(smokers.value))
  const nonSmokerAvg = avg(values(nonSmokers.value))

  const avgMessage =
    smokerAvg !== null && nonSmokerAvg !== null && smokerAvg > nonSmokerAvg
      ? '흡연자 평균이 비흡연자보다 높습니다.'
      : '흡연자 평균이 비흡연자보다 높다고 보기 어렵습니다.'

  const rateMessage =
    smokerOverRate.value > nonSmokerOverRate.value
      ? '기준값 이상 비율도 흡연자 그룹이 더 높습니다.'
      : '기준값 이상 비율은 비흡연자와 비슷하거나 더 낮습니다.'

  return `${selected.value.metric} 기준값 ${threshold.value} 기준으로 ${avgMessage} ${rateMessage}`
})

function destroyCharts(): void {
  charts.forEach((chart) => chart.destroy())
  charts = []
}

function selectHypothesis(id: Hypothesis['id']): void {
  selectedId.value = id
  threshold.value = selected.value.defaultThreshold
  nextTick(drawCharts)
}

function ageGroup(age: number): string {
  if (age < 30) return '20대 이하'
  if (age < 40) return '30대'
  if (age < 50) return '40대'
  if (age < 60) return '50대'
  return '60대 이상'
}

function drawCharts(): void {
  destroyCharts()

  const metric = selected.value.metric
  const smokerValues = values(smokers.value)
  const nonSmokerValues = values(nonSmokers.value)

  if (meanCanvas.value) {
    charts.push(
      new Chart(meanCanvas.value, {
        type: 'bar',
        data: {
          labels: ['비흡연자', '흡연자'],
          datasets: [
            {
              label: `${metric} 평균`,
              data: [avg(nonSmokerValues), avg(smokerValues)],
            },
          ],
        },
        options: {
          plugins: {
            legend: { display: false },
          },
        },
      }),
    )
  }

  if (overRateCanvas.value) {
    charts.push(
      new Chart(overRateCanvas.value, {
        type: 'bar',
        data: {
          labels: ['비흡연자', '흡연자'],
          datasets: [
            {
              label: '기준값 이상 비율(%)',
              data: [nonSmokerOverRate.value, smokerOverRate.value],
            },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: true, max: 100 },
          },
          plugins: {
            legend: { display: false },
          },
        },
      }),
    )
  }

  if (countCanvas.value) {
    const nonOver = nonSmokerValues.filter((v) => v >= threshold.value).length
    const nonUnder = nonSmokerValues.length - nonOver
    const smokerOver = smokerValues.filter((v) => v >= threshold.value).length
    const smokerUnder = smokerValues.length - smokerOver

    charts.push(
      new Chart(countCanvas.value, {
        type: 'bar',
        data: {
          labels: ['비흡연자', '흡연자'],
          datasets: [
            { label: '기준 미만', data: [nonUnder, smokerUnder] },
            { label: '기준 이상', data: [nonOver, smokerOver] },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: true },
          },
          plugins: {
            legend: { position: 'bottom' },
          },
        },
      }),
    )
  }

  if (ageCanvas.value) {
    const groups = ['20대 이하', '30대', '40대', '50대', '60대 이상']

    const rates = groups.map((groupName) => {
      const groupRows = rows.value.filter((row) => {
        const age = num(row['나이'])
        return age !== null && ageGroup(age) === groupName
      })

      const groupValues = groupRows
        .map((row) => num(row[metric]))
        .filter((value): value is number => value !== null)

      if (!groupValues.length) return 0

      const over = groupValues.filter((value) => value >= threshold.value).length
      return Math.round((over / groupValues.length) * 100)
    })

    charts.push(
      new Chart(ageCanvas.value, {
        type: 'bar',
        data: {
          labels: groups,
          datasets: [
            {
              label: '기준값 이상 비율(%)',
              data: rates,
            },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: true, max: 100 },
          },
          plugins: {
            legend: { display: false },
          },
        },
      }),
    )
  }
}

onMounted(async () => {
  rows.value = await loadCsv()
  drawCharts()
})
</script>