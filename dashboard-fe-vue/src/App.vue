<!--App.vue-->
<template>
  <header class="hero">
    <TopNav />

    <div class="hero-inner">
      <p class="eyebrow">Smoking Health Data Analysis</p>
      <h1>흡연 여부와 건강 지표 관계 분석</h1>
      <p class="lead">
        CSV 데이터가 바뀌면 차트와 지표가 자동으로 다시 계산되는 Vue 기반 대시보드입니다.
      </p>
    </div>
  </header>

  <main>
    <RouterView />
  </main>

  <footer class="footer">
    데이터 파일: <code>data/smoking_health_data.csv</code> · GitHub Pages Vue 대시보드
  </footer>
</template>

<script setup lang="ts">
import TopNav from './components/TopNav.vue'
</script>