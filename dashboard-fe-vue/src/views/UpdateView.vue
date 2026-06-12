<template>
  <section class="section">
    <div class="page-card">
      <p class="section-kicker">GitHub update</p>
      <h2>데이터 업데이트 방법</h2>

      <ol>
        <li>
          새 CSV의 컬럼명을 기존과 똑같이 맞춥니다.
          예: <code>나이</code>, <code>BMI</code>, <code>공복 혈당</code>,
          <code>중성 지방</code>, <code>혈청 크레아티닌</code>,
          <code>헤모글로빈</code>, <code>혈압</code>, <code>label</code>
        </li>
        <li>
          <code>public/data/smoking_health_data.csv</code>를 새 파일로 덮어씁니다.
        </li>
        <li>아래 명령어로 GitHub에 반영합니다.</li>
      </ol>

      <pre><code>git add public/data/smoking_health_data.csv
git commit -m "update dataset"
git push</code></pre>

      <p class="muted">
        GitHub Pages 배포가 끝난 뒤 새로고침하면 새 CSV 기준으로 값이 바뀝니다.
      </p>
    </div>
  </section>
</template>