<template>
  <section class="section">
    <div class="section-title">
      <p class="section-kicker">Notebook images</p>
      <h2>기존 노트북 실행 결과 이미지</h2>
      <p class="muted">
        기존 산출물도 같이 보존했습니다. 단, 아래 이미지는 CSV 교체만으로 자동 재생성되지는 않습니다.
      </p>
    </div>

    <div class="toolbar">
      <input v-model="keyword" placeholder="그래프 이름 검색: BMI, 혈압, HDL..." />
    </div>

    <div class="chart-grid compact">
      <article v-for="image in filteredImages" :key="image.src" class="chart-card">
        <div class="card-head">
          <h3>{{ image.title }}</h3>
          <span>Notebook</span>
        </div>

        <button class="image-button" @click="openLightbox(image)">
          <img :src="image.src" :alt="image.title" loading="lazy" />
        </button>
      </article>
    </div>
  </section>

  <div v-if="selectedImage" class="lightbox show" @click.self="closeLightbox">
    <div>
      <button @click="closeLightbox">닫기</button>
      <h3>{{ selectedImage.title }}</h3>
      <img :src="selectedImage.src" :alt="selectedImage.title" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface NotebookImage {
  title: string
  src: string
}

const keyword = ref('')
const selectedImage = ref<NotebookImage | null>(null)

const images: NotebookImage[] = [
  { title: 'BMI 분포 & 흡연 여부별 공복 혈당', src: './assets/cell24_00.png' },
  { title: '나이-중성지방 관계 & 헤모글로빈 분포', src: './assets/cell25_00.png' },
  { title: '나이 단변량 분석', src: './assets/cell30_00.png' },
  { title: '키(cm) 단변량 분석', src: './assets/cell30_01.png' },
  { title: '몸무게(kg) 단변량 분석', src: './assets/cell30_02.png' },
  { title: 'BMI 단변량 분석', src: './assets/cell30_03.png' },
  { title: '시력 단변량 분석', src: './assets/cell30_04.png' },
  { title: '충치 단변량 분석', src: './assets/cell30_05.png' },
  { title: '공복 혈당 단변량 분석', src: './assets/cell30_06.png' },
  { title: '혈압 단변량 분석', src: './assets/cell30_07.png' },
  { title: '중성 지방 단변량 분석', src: './assets/cell30_08.png' },
  { title: '혈청 크레아티닌 단변량 분석', src: './assets/cell30_09.png' },
  { title: '콜레스테롤 단변량 분석', src: './assets/cell30_10.png' },
  { title: '고밀도지단백 단변량 분석', src: './assets/cell30_11.png' },
  { title: '저밀도지단백 단변량 분석', src: './assets/cell30_12.png' },
  { title: '헤모글로빈 단변량 분석', src: './assets/cell30_13.png' },
  { title: '요 단백 단변량 분석', src: './assets/cell30_14.png' },
  { title: '간 효소율 단변량 분석', src: './assets/cell30_15.png' },
  { title: 'label 단변량 분석', src: './assets/cell30_16.png' },
  { title: '가설 1: 흡연 여부별 헤모글로빈', src: './assets/cell33_00.png' },
  { title: '가설 2: 흡연 여부별 중성 지방', src: './assets/cell33_01.png' },
  { title: '가설 3: 흡연 여부별 혈청 크레아티닌', src: './assets/cell33_02.png' },
  { title: '건강 지표 상관관계 히트맵', src: './assets/cell36_00.png' },
]

const filteredImages = computed(() => {
  const q = keyword.value.trim().toLowerCase()

  if (!q) return images

  return images.filter((image) => image.title.toLowerCase().includes(q))
})

function openLightbox(image: NotebookImage): void {
  selectedImage.value = image
}

function closeLightbox(): void {
  selectedImage.value = null
}
</script>