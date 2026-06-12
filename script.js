const DATA_URL = 'data/smoking_health_data.csv';
const METRIC_COLS = ['공복 혈당', '중성 지방', '혈청 크레아티닌', '헤모글로빈', 'BMI', '혈압'];
const STATIC_IMAGES = [
  ['BMI 분포 & 흡연 여부별 공복 혈당','assets/cell24_00.png'],
  ['나이-중성지방 관계 & 헤모글로빈 분포','assets/cell25_00.png'],
  ['나이 단변량 분석','assets/cell30_00.png'],['키(cm) 단변량 분석','assets/cell30_01.png'],['몸무게(kg) 단변량 분석','assets/cell30_02.png'],['BMI 단변량 분석','assets/cell30_03.png'],['시력 단변량 분석','assets/cell30_04.png'],['충치 단변량 분석','assets/cell30_05.png'],['공복 혈당 단변량 분석','assets/cell30_06.png'],['혈압 단변량 분석','assets/cell30_07.png'],['중성 지방 단변량 분석','assets/cell30_08.png'],['혈청 크레아티닌 단변량 분석','assets/cell30_09.png'],['콜레스테롤 단변량 분석','assets/cell30_10.png'],['고밀도지단백 단변량 분석','assets/cell30_11.png'],['저밀도지단백 단변량 분석','assets/cell30_12.png'],['헤모글로빈 단변량 분석','assets/cell30_13.png'],['요 단백 단변량 분석','assets/cell30_14.png'],['간 효소율 단변량 분석','assets/cell30_15.png'],['label 단변량 분석','assets/cell30_16.png'],
  ['가설 1: 흡연 여부별 헤모글로빈','assets/cell33_00.png'],['가설 2: 흡연 여부별 중성 지방','assets/cell33_01.png'],['가설 3: 흡연 여부별 혈청 크레아티닌','assets/cell33_02.png'],['건강 지표 상관관계 히트맵','assets/cell36_00.png']
];

let charts = {};

function num(v){
  if(v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replaceAll(',', '').trim());
  return Number.isFinite(n) ? n : null;
}
function avg(arr){ const xs = arr.filter(v => v !== null); return xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : null; }
function fmt(v, d=1){ return v === null || Number.isNaN(v) ? '-' : Number(v).toFixed(d); }
function labelName(v){ return String(v) === '1' ? '흡연자' : '비흡연자'; }
function byLabel(rows, col){
  return [0,1].map(label => avg(rows.filter(r => String(r.label) === String(label)).map(r => num(r[col]))));
}
function destroyCharts(){ Object.values(charts).forEach(c => c.destroy()); charts = {}; }

function loadCsvText(text){
  Papa.parse(text, { header:true, dynamicTyping:false, skipEmptyLines:true, complete: res => renderDashboard(res.data) });
}
function loadDefault(){
  Papa.parse(DATA_URL, { download:true, header:true, dynamicTyping:false, skipEmptyLines:true, complete: res => renderDashboard(res.data), error: () => document.getElementById('autoSummary').textContent = 'CSV 파일을 불러오지 못했습니다. data/smoking_health_data.csv 경로를 확인하세요.' });
}

function renderDashboard(rows){
  rows = rows.filter(r => Object.keys(r).length && Object.values(r).some(v => v !== ''));
  destroyCharts();
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const smokers = rows.filter(r => String(r.label) === '1').length;
  const nonSmokers = rows.filter(r => String(r.label) === '0').length;
  document.getElementById('rowCount').textContent = rows.length.toLocaleString();
  document.getElementById('colCount').textContent = cols.length.toLocaleString();
  document.getElementById('smokerRate').textContent = rows.length ? `${Math.round(smokers / rows.length * 100)}%` : '-';
  document.getElementById('updatedAt').textContent = '반영 완료';

  const hemo = byLabel(rows, '헤모글로빈');
  const tg = byLabel(rows, '중성 지방');
  const cre = byLabel(rows, '혈청 크레아티닌');
  document.getElementById('autoSummary').innerHTML = `현재 데이터는 <b>${rows.length.toLocaleString()}행</b>입니다. 흡연자는 <b>${smokers.toLocaleString()}명</b>, 비흡연자는 <b>${nonSmokers.toLocaleString()}명</b>으로 집계됩니다.<br>평균 헤모글로빈은 비흡연자 ${fmt(hemo[0])}, 흡연자 ${fmt(hemo[1])} / 평균 중성 지방은 비흡연자 ${fmt(tg[0])}, 흡연자 ${fmt(tg[1])}입니다.`;

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

function renderStaticImages(){
  const grid = document.getElementById('chartGrid');
  grid.innerHTML = STATIC_IMAGES.map(([title,src]) => `<article class="chart-card" data-title="${title}"><div class="card-head"><h3>${title}</h3><span>Notebook</span></div><button class="image-button" onclick="openLightbox('${src}', '${title}')"><img src="${src}" alt="${title}" loading="lazy"></button></article>`).join('');
}
function openLightbox(src,title){const lb=document.getElementById('lightbox');document.getElementById('lightboxImg').src=src;document.getElementById('lightboxTitle').textContent=title;lb.classList.add('show')}
function closeLightbox(){document.getElementById('lightbox').classList.remove('show')}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox()});
document.getElementById('csvUpload').addEventListener('change', e => { const file = e.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = () => loadCsvText(reader.result); reader.readAsText(file, 'utf-8'); });
renderStaticImages();
const search=document.getElementById('search');if(search){search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();document.querySelectorAll('#chartGrid .chart-card').forEach(card=>{card.style.display=card.dataset.title.toLowerCase().includes(q)?'':'none'})})}
loadDefault();
