# 📚 수학 학원 조교 업무 자동화 시스템

AI 기반 수학 문제 풀이와 학생 관리를 한 곳에서 효율적으로 처리할 수 있는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🤖 AI 문제 풀이 박스
- 스크린샷으로 캡처한 수학 문제를 AI가 분석하여 풀이 제공
- LaTeX 수식 렌더링 지원
- 단계별 상세한 풀이 과정과 추가 코멘트 제공

### 👥 학생 관리 체크리스트
- 학생별 등원/하원 시간 관리
- 실시간 타이머와 알림 시스템
- 지각 감지 및 단계별 알림 (20분, 25분, 30분)

## 🚀 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Netlify Functions
- **AI**: Google Gemini API
- **수식 렌더링**: MathJax
- **스타일링**: Tailwind CSS
- **배포**: Netlify

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone [your-repository-url]
cd [repository-name]
```

### 2. 환경 변수 설정
Netlify 대시보드에서 다음 환경 변수를 설정하세요:
- `GEMINI_API_KEY`: Google Gemini API 키

### 3. 배포
Netlify에 연결하여 자동 배포됩니다.

## 🔧 개발 환경 설정

### 로컬 개발
```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로컬 서버 실행
netlify dev
```

## 📱 사용법

### AI 문제 풀이
1. 수학 문제 스크린샷을 캡처
2. 웹페이지의 AI 문제 풀이 박스에 붙여넣기 (Ctrl+V)
3. AI가 자동으로 문제를 분석하고 풀이 제공

### 학생 관리
1. '+' 버튼을 클릭하여 학생 추가
2. 학생 이름과 등원 예정 시간 입력
3. 등원 확인 버튼으로 상태 변경
4. 타이머와 알림으로 학생 관리

## 🎯 특징

- **실시간 응답**: 스트리밍 방식으로 빠른 AI 응답
- **수식 지원**: LaTeX 수식 자동 렌더링
- **반응형 디자인**: 모바일/데스크톱 최적화
- **오프라인 지원**: 로컬 스토리지로 데이터 보존

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
