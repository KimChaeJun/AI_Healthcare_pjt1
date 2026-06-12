# 흡연 여부 건강 데이터 분석 대시보드

GitHub Pages에서 바로 동작하는 정적 대시보드입니다.  
`data/smoking_health_data.csv` 파일을 교체하면 차트와 요약 지표가 자동으로 다시 계산됩니다.

## 배포 방법

1. GitHub에서 새 repository 생성
2. 이 폴더의 모든 파일 업로드
3. `Settings > Pages > Build and deployment`에서 branch를 `main`, folder를 `/root`로 설정
4. 배포 주소 접속

## 데이터 업데이트 방법

새 데이터가 생기면 아래 파일만 교체하세요.

```text
data/smoking_health_data.csv
```

필수 권장 컬럼:

- `나이`
- `BMI`
- `공복 혈당`
- `중성 지방`
- `혈청 크레아티닌`
- `헤모글로빈`
- `혈압`
- `label` : 0 = 비흡연자, 1 = 흡연자

컬럼을 추가해도 대시보드는 깨지지 않습니다. 새 컬럼을 요약표에 넣고 싶으면 `script.js`의 `METRIC_COLS` 배열에 컬럼명을 추가하세요.

## 로컬 미리보기

브라우저에서 `index.html`을 열면 됩니다.  
일부 브라우저에서 로컬 CSV 자동 로딩이 막히면 VS Code Live Server를 사용하거나, 화면의 “로컬 CSV로 미리보기” 버튼으로 CSV를 직접 선택하세요.
