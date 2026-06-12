# 흡연 여부 건강 데이터 분석 대시보드

흡연 여부와 건강 지표의 관계를 확인하기 위한 GitHub Pages용 정적 대시보드입니다.
CSV 데이터가 바뀌면 대시보드의 주요 카드, 차트, 가설별 기준값 분석, 요약표가 자동으로 다시 계산됩니다.

## 주요 기능

- CSV 기반 자동 대시보드 갱신
- 흡연자/비흡연자 분포 확인
- BMI 구간 분포 확인
- 흡연 여부별 평균 건강 지표 비교
- 나이와 중성 지방 산점도 확인
- 가설별 기준값 분석
  - 가설 1: 흡연자는 헤모글로빈 수치가 높을 것이다
  - 가설 2: 흡연자는 중성 지방 수치가 높을 것이다
  - 가설 3: 흡연자는 혈청 크레아티닌 수치가 높을 것이다
- 기준값 변경 시 그래프와 해석 자동 갱신
- 기존 노트북 실행 결과 이미지 보존
- 로컬 CSV 업로드를 통한 임시 미리보기

## 폴더 구조

```text
smoking-health-dashboard-hypothesis/
├── index.html
├── style.css
├── script.js
├── README.md
├── data/
│   └── smoking_health_data.csv
└── assets/
    └── 기존 노트북 결과 이미지들
```

## 로컬에서 실행하는 방법

### 1. 폴더로 이동

```bash
cd smoking-health-dashboard-hypothesis
```

### 2. Python 서버 실행

```bash
python -m http.server 8000
```

### 3. 브라우저에서 접속

```text
http://localhost:8000
```

> `index.html`을 더블클릭해도 화면은 열릴 수 있지만, CSV를 `fetch`로 읽는 구조라 브라우저 보안 정책 때문에 데이터가 안 불러와질 수 있습니다. 그래서 `python -m http.server 8000` 방식 실행을 권장합니다.

## GitHub에 올리는 방법

### 1. Git 초기화

```bash
git init
```

### 2. 파일 추가 및 커밋

```bash
git add .
git commit -m "Add smoking health dashboard"
```

### 3. 브랜치 이름을 main으로 변경

```bash
git branch -M main
```

### 4. 원격 저장소 연결

```bash
git remote add origin https://github.com/본인아이디/저장소명.git
```

이미 origin이 있다면 아래 명령으로 주소를 바꿉니다.

```bash
git remote set-url origin https://github.com/본인아이디/저장소명.git
```

### 5. GitHub로 push

```bash
git push -u origin main
```

## GitHub Pages 설정 방법

1. GitHub 저장소 접속
2. `Settings` 클릭
3. 왼쪽 메뉴에서 `Pages` 클릭
4. Source를 `Deploy from a branch`로 선택
5. Branch를 `main`으로 선택
6. Folder를 `/root`로 선택
7. Save 클릭

잠시 후 아래 형식의 주소로 접속할 수 있습니다.

```text
https://본인아이디.github.io/저장소명/
```

예시:

```text
https://KimChaeJun.github.io/AI_Healthcare_pjt1/
```

## 데이터 업데이트 방법

새 데이터가 생기면 아래 파일만 교체하면 됩니다.

```text
data/smoking_health_data.csv
```

교체 후 아래 명령을 실행합니다.

```bash
git add data/smoking_health_data.csv
git commit -m "Update health dataset"
git push
```

GitHub Pages가 다시 배포되면 대시보드가 새 CSV를 기준으로 자동 갱신됩니다.

## CSV 필수 컬럼

기본 차트와 가설 분석이 정상 동작하려면 아래 컬럼명이 필요합니다.

```text
나이
BMI
공복 혈당
중성 지방
혈청 크레아티닌
헤모글로빈
혈압
label
```

`label` 값은 아래 기준을 사용합니다.

```text
0 = 비흡연자
1 = 흡연자
```

## 가설별 기준값 수정 방법

대시보드 화면에서 직접 기준값을 바꿀 수 있습니다.

기본 기준값은 `script.js`의 `HYPOTHESES`에서 수정할 수 있습니다.

```js
const HYPOTHESES = {
  hemo: {
    metric: '헤모글로빈',
    defaultThreshold: 15.0
  },
  tg: {
    metric: '중성 지방',
    defaultThreshold: 150
  },
  creatinine: {
    metric: '혈청 크레아티닌',
    defaultThreshold: 1.2
  }
};
```

## 새 가설 추가 방법

1. `script.js`의 `HYPOTHESES`에 새 항목을 추가합니다.
2. `index.html`의 `.hypothesis-tabs` 안에 버튼을 추가합니다.
3. `data-hypothesis` 값과 `HYPOTHESES`의 key를 맞춥니다.

예시:

```html
<button class="tab-button" data-hypothesis="glucose">가설 4 · 공복 혈당</button>
```

```js
glucose: {
  no: 'Hypothesis 4',
  title: '흡연자는 공복 혈당 수치가 높을 것이다',
  desc: '흡연 여부별 공복 혈당 평균과 기준값 이상 비율을 비교합니다.',
  metric: '공복 혈당',
  unit: '',
  defaultThreshold: 100,
  step: 1,
  directionText: '높을수록 기준 초과'
}
```

## 주의사항

- `assets/` 안의 노트북 결과 이미지는 기존 산출물 보존용입니다.
- CSV를 교체해도 `assets/` 안의 PNG 이미지는 자동으로 다시 생성되지 않습니다.
- 자동 갱신되는 부분은 `Live charts`, `Hypothesis Lab`, `주요 지표 요약표`입니다.
- 컬럼명이 달라지면 차트가 제대로 계산되지 않을 수 있습니다.
