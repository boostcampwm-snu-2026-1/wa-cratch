# #8 홈페이지 디자인 이식 플랜

## 영향 범위
- 수정: frontend/src/index.css (CSS 변수 + 글로벌 스타일 추가)
- 수정: frontend/src/main.tsx (BrowserRouter 래핑)
- 수정: frontend/src/App.tsx (Routes 선언으로 교체)
- 생성: frontend/src/pages/LandingPage/LandingPage.module.css
- 생성: frontend/src/pages/LandingPage/LandingPage.tsx
- 테스트: frontend/e2e/ (개발자 작성)

## 태스크

### Task 1 — CSS 변수 + 글로벌 스타일 (2분)
- 파일: `frontend/src/index.css`
- 구현:
  - `design/landing.html`의 `:root` CSS 변수 전부 이동
  - `html`, `body`, `body::before` (dot pattern) 글로벌 스타일 추가
  - Google Fonts import (Baloo 2, Nunito)
- 검증: `yarn dev` 후 배경 크림색 + dot pattern 확인

### Task 2 — 라우팅 설정 (3분)
- 파일: `frontend/src/main.tsx`, `frontend/src/App.tsx`
- 구현:
  - `react-router-dom` 패키지 설치 (`yarn add react-router-dom`)
  - `main.tsx`: `<BrowserRouter>` 래핑
  - `App.tsx`: 기존 scaffold 제거 후 `<Routes>` 선언
    - `path="/"` → `<LandingPage />`
    - `path="/login"`, `/explore`, `/dashboard` → `<div>TODO</div>` 플레이스홀더
- 검증: `yarn dev` 후 `/` 접속 시 빈 화면(에러 없음) 확인

### Task 3 — LandingPage CSS Modules (4분)
- 파일: `frontend/src/pages/LandingPage/LandingPage.module.css`
- 구현: `design/landing.html` `<style>` 블록을 CSS Modules 클래스로 변환
  - `.nav`, `.navLogo`, `.navLinks`, `.navActions`
  - `.btn`, `.btnGhost`, `.btnPrimary`, `.btnTeal`, `.btnWhite`
  - `.hero`, `.blob`, `.heroContent`, `.heroBadge`, `.heroTitle`, `.heroSub`, `.heroCta`, `.heroMascot`, `.shape`
  - `.section`, `.secHead`, `.secTitle`, `.secSub`
  - `.steps`, `.step`, `.stepBadge`, `.stepIcon`, `.stepTitle`, `.stepDesc`
  - `.featuresGrid`, `.featureCard`, `.featureIcon`, `.featureTitle`, `.featureDesc`
  - `.ctaBg`, `.ctaTitle`, `.ctaSub`
  - `.footerTop`, `.footerBrand`, `.footerCol`, `.footerBottom`
  - 키프레임 애니메이션 (`@keyframes`) 유지
- 검증: TypeScript 빌드 에러 없음

### Task 4 — LandingPage 컴포넌트 (4분)
- 파일: `frontend/src/pages/LandingPage/LandingPage.tsx`
- 구현: `design/landing.html` HTML 구조를 JSX로 변환
  - `<a href="...">` → `<Link to="...">` (react-router-dom)
  - HTML 어트리뷰트 → JSX 어트리뷰트 (`class` → `className`, `stroke-width` → `strokeWidth` 등)
  - 마스코트 SVG, 장식 shape SVG 인라인 포함
  - 섹션 구조: Nav → Hero → How it works → CTA → Footer
- 검증: `yarn dev` 후 `/` 접속 → `design/landing.html`과 시각적으로 동일한 페이지 확인
