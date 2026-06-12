const DATA_URL = 'data/smoking_health_data.csv';
const METRIC_COLS = ['공복 혈당', '중성 지방', '혈청 크레아티닌', '헤모글로빈', 'BMI', '혈압'];

const HYPOTHESES = {
  hemo: {
    no: 'Hypothesis 1',
    title: '흡연자는 헤모글로빈 수치가 높을 것이다',
    desc: '흡연 여부별 헤모글로빈 평균과 기준값 이상 비율을 비교합니다.',
    metric: '헤모글로빈',
    unit: '',
    defaultThreshold: 15.0,
    step: 0.1,
    directionText: '높을수록 기준 초과'
  },
  tg: {
    no: 'Hypothesis 2',
    title: '흡연자는 중성 지방 수치가 높을 것이다',
    desc: '흡연 여부별 중성 지방 평균과 150 이상 고위험군 비율을 비교합니다.',
    metric: '중성 지방',
    unit: '',
    defaultThreshold: 150,
    step: 1,
    directionText: '높을수록 기준 초과'
  },
  creatinine: {
    no: 'Hypothesis 3',
    title: '흡연자는 혈청 크레아티닌 수치가 높을 것이다',
    desc: '흡연 여부별 혈청 크레아티닌 평균과 기준값 이상 비율을 비교합니다.',
    metric: '혈청 크레아티닌',
    unit: '',
    defaultThreshold: 1.2,
    step: 0.1,
    directionText: '높을수록 기준 초과'
  }
};

const STATIC_IMAGES = [
  ['BMI 분포 & 흡연 여부별 공복 혈당','assets/cell24_00.png'],
  ['나이-중성지방 관계 & 헤모글로빈 분포','assets/cell25_00.png'],
  ['나이 단변량 분석','assets/cell30_00.png'],['키(cm) 단변량 분석','assets/cell30_01.png'],['몸무게(kg) 단변량 분석','assets/cell30_02.png'],['BMI 단변량 분석','assets/cell30_03.png'],['시력 단변량 분석','assets/cell30_04.png'],['충치 단변량 분석','assets/cell30_05.png'],['공복 혈당 단변량 분석','assets/cell30_06.png'],['혈압 단변량 분석','assets/cell30_07.png'],['중성 지방 단변량 분석','assets/cell30_08.png'],['혈청 크레아티닌 단변량 분석','assets/cell30_09.png'],['콜레스테롤 단변량 분석','assets/cell30_10.png'],['고밀도지단백 단변량 분석','assets/cell30_11.png'],['저밀도지단백 단변량 분석','assets/cell30_12.png'],['헤모글로빈 단변량 분석','assets/cell30_13.png'],['요 단백 단변량 분석','assets/cell30_14.png'],['간 효소율 단변량 분석','assets/cell30_15.png'],['label 단변량 분석','assets/cell30_16.png'],
  ['가설 1: 흡연 여부별 헤모글로빈','assets/cell33_00.png'],['가설 2: 흡연 여부별 중성 지방','assets/cell33_01.png'],['가설 3: 흡연 여부별 혈청 크레아티닌','assets/cell33_02.png'],['건강 지표 상관관계 히트맵','assets/cell36_00.png']
];

let charts = {};
let hypothesisCharts = {};
let currentRows = [];
let currentHypothesis = 'hemo';

function num(v){
  if(v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replaceAll(',', '').trim());
  return Number.isFinite(n) ? n : null;
}
function avg(arr){ const xs = arr.filter(v => v !== null); return xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : null; }
function fmt(v, d=1){ return v === null || Number.isNaN(v) ? '-' : Number(v).toFixed(d); }
function pct(v){ return v === null || Number.isNaN(v) ? '-' : `${fmt(v, 1)}%`; }
function labelName(v){ return String(v) === '1' ? '흡연자' : '비흡연자'; }
function groupRows(rows, label){ return rows.filter(r => String(r.label) === String(label)); }
function byLabel(rows, col){ return [0,1].map(label => avg(groupRows(rows, label).map(r => num(r[col])))); }
function destroyChartBag(bag){ Object.values(bag).forEach(c => c && c.destroy()); }
function destroyCharts(){ destroyChartBag(charts); charts = {}; }
function destroyHypothesisCharts(){ destroyChartBag(hypothesisCharts); hypothesisCharts = {}; }

function loadCsvText(text){
  Papa.parse(text, { header:true, dynamicTyping:false, skipEmptyLines:true, complete: res => renderDashboard(res.data) });
}
function loadDefault(){
  Papa.parse(DATA_URL, {
    download:true,
    header:true,
    dynamicTyping:false,
    skipEmptyLines:true,
    complete: res => renderDashboard(res.data),
    error: () => document.getElementById('autoSummary').textContent = 'CSV 파일을 불러오지 못했습니다. data/smoking_health_data.csv 경로를 확인하세요.'
  });
}

function renderDashboard(rows){
  rows = rows.filter(r => Object.keys(r).length && Object.values(r).some(v => v !== ''));
  currentRows = rows;
  destroyCharts();
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const smokers = groupRows(rows, 1).length;
  const nonSmokers = groupRows(rows, 0).length;
  document.getElementById('rowCount').textContent = rows.length.toLocaleString();
  document.getElementById('colCount').textContent = cols.length.toLocaleString();
  document.getElementById('smokerRate').textContent = rows.length ? `${Math.round(smokers / rows.length * 100)}%` : '-';
  document.getElementById('updatedAt').textContent = '반영 완료';

  const hemo = byLabel(rows, '헤모글로빈');
  const tg = byLabel(rows, '중성 지방');
  document.getElementById('autoSummary').innerHTML = `현재 데이터는 <b>${rows.length.toLocaleString()}행</b>입니다. 흡연자는 <b>${smokers.toLocaleString()}명</b>, 비흡연자는 <b>${nonSmokers.toLocaleString()}명</b>으로 집계됩니다.<br>평균 헤모글로빈은 비흡연자 ${fmt(hemo[0])}, 흡연자 ${fmt(hemo[1])} / 평균 중성 지방은 비흡연자 ${fmt(tg[0])}, 흡연자 ${fmt(tg[1])}입니다.`;

  renderHypothesisSection();
  renderLabelChart(nonSmokers, smokers);
  renderBmiChart(rows);
  renderMeanChart(rows);
  renderScatterChart(rows);
  renderSummaryTable(rows);
}

function renderLabelChart(nonSmokers, smokers){
  charts.label = new Chart(document.getElementById('labelChart'), { type:'doughnut', data:{ labels:['비흡연자','흡연자'], datasets:[{ data:[nonSmokers, smokers] }] }, options:{ plugins:{ legend:{ position:'bottom' } } } });
}
function renderBmiChart(rows){
  const bins = ['<18.5','18.5-23','23-25','25-30','30+'];
  const counts = [0,0,0,0,0];
  rows.forEach(r => { const b = num(r.BMI); if(b===null) return; if(b<18.5) counts[0]++; else if(b<23) counts[1]++; else if(b<25) counts[2]++; else if(b<30) counts[3]++; else counts[4]++; });
  charts.bmi = new Chart(document.getElementById('bmiChart'), { type:'bar', data:{ labels:bins, datasets:[{ label:'인원 수', data:counts }] }, options:{ scales:{ y:{ beginAtZero:true } }, plugins:{ legend:{ display:false } } } });
}
function renderMeanChart(rows){
  const labels = ['공복 혈당','중성 지방','헤모글로빈','혈청 크레아티닌'];
  charts.mean = new Chart(document.getElementById('meanChart'), { type:'bar', data:{ labels, datasets:[{ label:'비흡연자 평균', data:labels.map(c => byLabel(rows,c)[0]) }, { label:'흡연자 평균', data:labels.map(c => byLabel(rows,c)[1]) }] }, options:{ responsive:true, scales:{ y:{ beginAtZero:false } }, plugins:{ legend:{ position:'bottom' } } } });
}
function renderScatterChart(rows){
  const points0 = [], points1 = [];
  rows.forEach(r => { const x = num(r['나이']), y = num(r['중성 지방']); if(x===null || y===null) return; (String(r.label)==='1'?points1:points0).push({x,y}); });
  charts.scatter = new Chart(document.getElementById('scatterChart'), { type:'scatter', data:{ datasets:[{ label:'비흡연자', data:points0 }, { label:'흡연자', data:points1 }] }, options:{ scales:{ x:{ title:{display:true,text:'나이'} }, y:{ title:{display:true,text:'중성 지방'} } }, plugins:{ legend:{ position:'bottom' } } } });
}
function renderSummaryTable(rows){
  const table = document.getElementById('summaryTable');
  const header = '<tr><th>지표</th><th>전체 평균</th><th>비흡연자 평균</th><th>흡연자 평균</th><th>차이</th></tr>';
  const body = METRIC_COLS.map(col => {
    const all = avg(rows.map(r => num(r[col]))), g = byLabel(rows, col), diff = g[1] !== null && g[0] !== null ? g[1]-g[0] : null;
    return `<tr><td>${col}</td><td>${fmt(all)}</td><td>${fmt(g[0])}</td><td>${fmt(g[1])}</td><td>${fmt(diff)}</td></tr>`;
  }).join('');
  table.innerHTML = header + body;
}

function getThreshold(){
  const input = document.getElementById('thresholdValue');
  const n = num(input.value);
  return n === null ? HYPOTHESES[currentHypothesis].defaultThreshold : n;
}
function getOverStats(rows, metric, threshold){
  return [0,1].map(label => {
    const xs = groupRows(rows, label).map(r => num(r[metric])).filter(v => v !== null);
    const over = xs.filter(v => v >= threshold).length;
    const under = xs.length - over;
    return { label, total: xs.length, over, under, rate: xs.length ? over / xs.length * 100 : null, mean: avg(xs) };
  });
}
function ageBand(age){
  if(age === null) return null;
  if(age < 30) return '20대 이하';
  if(age < 40) return '30대';
  if(age < 50) return '40대';
  if(age < 60) return '50대';
  return '60대 이상';
}
function renderHypothesisSection(){
  const hyp = HYPOTHESES[currentHypothesis];
  const input = document.getElementById('thresholdValue');
  document.getElementById('hypothesisKicker').textContent = hyp.no;
  document.getElementById('hypothesisTitle').textContent = hyp.title;
  document.getElementById('hypothesisDesc').textContent = hyp.desc;
  document.getElementById('thresholdLabel').textContent = `${hyp.metric} 기준값`;
  input.step = hyp.step;
  if(!input.value || input.dataset.hypothesis !== currentHypothesis){
    input.value = hyp.defaultThreshold;
    input.dataset.hypothesis = currentHypothesis;
  }
  renderHypothesisCharts();
}
function renderHypothesisCharts(){
  const hyp = HYPOTHESES[currentHypothesis];
  const rows = currentRows;
  const threshold = getThreshold();
  const stats = getOverStats(rows, hyp.metric, threshold);
  const non = stats[0], smk = stats[1];
  destroyHypothesisCharts();

  document.getElementById('hypMetric').textContent = hyp.metric;
  document.getElementById('hypThreshold').textContent = fmt(threshold, hyp.step < 1 ? 1 : 0);
  document.getElementById('hypSmokerOver').textContent = pct(smk.rate);
  document.getElementById('hypNonSmokerOver').textContent = pct(non.rate);

  hypothesisCharts.mean = new Chart(document.getElementById('hypMeanChart'), {
    type:'bar',
    data:{ labels:['비흡연자','흡연자'], datasets:[{ label:`평균 ${hyp.metric}`, data:[non.mean, smk.mean] }, { label:'기준값', data:[threshold, threshold], type:'line', pointRadius:0, borderWidth:2 }] },
    options:{ scales:{ y:{ beginAtZero:false } }, plugins:{ legend:{ position:'bottom' } } }
  });

  hypothesisCharts.rate = new Chart(document.getElementById('hypOverRateChart'), {
    type:'bar',
    data:{ labels:['비흡연자','흡연자'], datasets:[{ label:'기준값 이상 비율(%)', data:[non.rate, smk.rate] }] },
    options:{ scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback:v=>v+'%' } } }, plugins:{ legend:{ display:false } } }
  });

  hypothesisCharts.count = new Chart(document.getElementById('hypCountChart'), {
    type:'bar',
    data:{ labels:['비흡연자','흡연자'], datasets:[{ label:'기준 미만', data:[non.under, smk.under] }, { label:'기준 이상', data:[non.over, smk.over] }] },
    options:{ scales:{ x:{ stacked:true }, y:{ beginAtZero:true, stacked:true } }, plugins:{ legend:{ position:'bottom' } } }
  });

  const bands = ['20대 이하','30대','40대','50대','60대 이상'];
  const ageData = bands.map(band => {
    const inBand = rows.filter(r => ageBand(num(r['나이'])) === band);
    const ns = getOverStats(inBand, hyp.metric, threshold);
    return { band, nonRate: ns[0].rate, smokerRate: ns[1].rate };
  });
  hypothesisCharts.age = new Chart(document.getElementById('hypAgeChart'), {
    type:'bar',
    data:{ labels:bands, datasets:[{ label:'비흡연자', data:ageData.map(d=>d.nonRate) }, { label:'흡연자', data:ageData.map(d=>d.smokerRate) }] },
    options:{ scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback:v=>v+'%' } } }, plugins:{ legend:{ position:'bottom' } } }
  });

  const meanDiff = smk.mean !== null && non.mean !== null ? smk.mean - non.mean : null;
  const rateDiff = smk.rate !== null && non.rate !== null ? smk.rate - non.rate : null;
  const meanSentence = meanDiff === null ? '평균 비교가 어렵습니다.' : `흡연자 평균은 비흡연자보다 <b>${fmt(Math.abs(meanDiff), 2)}</b> ${meanDiff >= 0 ? '높습니다' : '낮습니다'}.`;
  const rateSentence = rateDiff === null ? '기준값 이상 비율 비교가 어렵습니다.' : `기준값 이상 비율은 흡연자가 비흡연자보다 <b>${fmt(Math.abs(rateDiff), 1)}%p</b> ${rateDiff >= 0 ? '높습니다' : '낮습니다'}.`;
  const conclusion = meanDiff !== null && rateDiff !== null && meanDiff > 0 && rateDiff > 0 ? '현재 데이터에서는 이 가설을 지지하는 방향의 패턴이 보입니다.' : '현재 데이터만으로는 가설을 강하게 지지한다고 보기 어렵습니다. 표본 수와 통계 검정을 함께 확인하는 것이 좋습니다.';
  document.getElementById('hypothesisSummary').innerHTML = `<b>${hyp.title}</b><br>${meanSentence} ${rateSentence}<br><b>해석:</b> ${conclusion}`;
}

function renderStaticImages(){
  const grid = document.getElementById('chartGrid');
  grid.innerHTML = STATIC_IMAGES.map(([title,src]) => `<article class="chart-card" data-title="${title}"><div class="card-head"><h3>${title}</h3><span>Notebook</span></div><button class="image-button" onclick="openLightbox('${src}', '${title}')"><img src="${src}" alt="${title}" loading="lazy"></button></article>`).join('');
}
function openLightbox(src,title){const lb=document.getElementById('lightbox');document.getElementById('lightboxImg').src=src;document.getElementById('lightboxTitle').textContent=title;lb.classList.add('show')}
function closeLightbox(){document.getElementById('lightbox').classList.remove('show')}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox()});
document.getElementById('csvUpload').addEventListener('change', e => { const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = () => loadCsvText(reader.result); reader.readAsText(file, 'utf-8'); });
document.getElementById('thresholdValue').addEventListener('input', renderHypothesisCharts);
document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentHypothesis = btn.dataset.hypothesis;
    renderHypothesisSection();
  });
});
renderStaticImages();

const search=document.getElementById('search');if(search){search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();document.querySelectorAll('#chartGrid .chart-card').forEach(card=>{card.style.display=card.dataset.title.toLowerCase().includes(q)?'':'none'})})}
loadDefault();

function openUpdateModal() {
  document.getElementById("updateModal").classList.add("show");
}

function closeUpdateModal() {
  document.getElementById("updateModal").classList.remove("show");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeUpdateModal();
  }
});

document.getElementById("updateModal")?.addEventListener("click", (e) => {
  if (e.target.id === "updateModal") {
    closeUpdateModal();
  }
});