# #5 프론트엔드 페이지 이식 플랜

## 영향 범위
- 수정: frontend/src/App.tsx (라우트 /editor/:id, /play/:id 추가)
- 생성: frontend/src/pages/LoginPage/LoginPage.tsx
- 생성: frontend/src/pages/LoginPage/LoginPage.module.css
- 생성: frontend/src/pages/ExplorePage/ExplorePage.tsx
- 생성: frontend/src/pages/ExplorePage/ExplorePage.module.css
- 생성: frontend/src/pages/DashboardPage/DashboardPage.tsx
- 생성: frontend/src/pages/DashboardPage/DashboardPage.module.css
- 생성: frontend/src/pages/EditorPage/EditorPage.tsx
- 생성: frontend/src/pages/EditorPage/EditorPage.module.css
- 생성: frontend/src/pages/PlayPage/PlayPage.tsx
- 생성: frontend/src/pages/PlayPage/PlayPage.module.css
- 테스트: frontend/e2e/ (개발자 작성)

## 태스크

### Task 1 — App.tsx 라우트 추가 (2분)
- 파일: `frontend/src/App.tsx`
- 구현:
  - `/editor/:id` → `<EditorPage />` 라우트 추가
  - `/play/:id` → `<PlayPage />` 라우트 추가
  - 기존 /login, /explore, /dashboard TODO 플레이스홀더 실제 컴포넌트로 교체
- 검증: `yarn dev` 후 각 경로 접근 시 에러 없음

### Task 2 — LoginPage 구현 (5분)
- 파일:
  - `frontend/src/pages/LoginPage/LoginPage.module.css`
  - `frontend/src/pages/LoginPage/LoginPage.tsx`
- 구현 (design/login.html 기반):
  - 좌측 패널: 마스코트 SVG + 브랜딩
  - 우측 패널: 로그인/회원가입 탭 전환 (`useState`)
  - 비밀번호 강도 표시 (`useState`, 입력값 기반 계산)
  - `<Link>` 내비게이션 (홈, 대시보드 이동)
- 검증: `yarn dev` 후 `/login` 접속 → design/login.html과 시각적 일치, 탭 전환 동작 확인

### Task 3 — ExplorePage 구현 (4분)
- 파일:
  - `frontend/src/pages/ExplorePage/ExplorePage.module.css`
  - `frontend/src/pages/ExplorePage/ExplorePage.tsx`
- 구현 (design/explore.html 기반):
  - Nav: 로고 + 탐색하기 링크 + 로그인/만들기 버튼
  - 페이지 헤더: 배지 + 타이틀 + 검색창 + 장식 SVG
  - 정렬 탭 (최신/조회/좋아요) → `useState`
  - 프로젝트 그리드 (더미 10개, play 링크)
- 검증: `yarn dev` 후 `/explore` 접속 → 정렬 탭 클릭 동작 확인

### Task 4 — DashboardPage 구현 (5분)
- 파일:
  - `frontend/src/pages/DashboardPage/DashboardPage.module.css`
  - `frontend/src/pages/DashboardPage/DashboardPage.tsx`
- 구현 (design/dashboard.html 기반):
  - Top Nav: 로고 + 검색창 + 아바타
  - 사이드바: 아바타 블록 + 메뉴 링크 + 새 프로젝트 버튼
  - 메인: 웰컴 배너 + 통계 카드 4개 + 프로젝트 그리드 + 활동 피드
  - 프로젝트 카드 hover 오버레이 (CSS만)
- 검증: `yarn dev` 후 `/dashboard` 접속 → 레이아웃 일치 확인

### Task 5 — EditorPage 구현 (5분)
- 파일:
  - `frontend/src/pages/EditorPage/EditorPage.module.css`
  - `frontend/src/pages/EditorPage/EditorPage.tsx`
- 구현 (design/project.html 기반):
  - Toolbar: 로고 + 프로젝트명 input + 실행/멈추기 + 저장/공유 버튼
  - Toolbox: 카테고리 탭 6개 → `useState`로 블록 목록 전환
  - Workspace: 격자 배경 + 더미 블록 스택 (시각적)
  - Stage Panel: 스테이지 캔버스(Sky bg + 마스코트 SVG) + 좌표 + 스프라이트 목록 + 배경 목록
  - Status Bar
- 검증: `yarn dev` 후 `/editor/test` 접속 → 카테고리 탭 전환 확인

### Task 6 — PlayPage 구현 (4분)
- 파일:
  - `frontend/src/pages/PlayPage/PlayPage.module.css`
  - `frontend/src/pages/PlayPage/PlayPage.tsx`
- 구현 (design/play.html 기반):
  - Nav: 탐색으로 ← 링크 + 로고 + 프로젝트명/작성자
  - 메인 2컬럼: 좌측(스테이지 캔버스 + 액션버튼 + 정보카드), 우측(조작방법 카드 + 크리에이터 카드 + 더보기 그리드)
  - 스테이지 canvas: 배경(Sky) + 마스코트 SVG + 말풍선
- 검증: `yarn dev` 후 `/play/test` 접속 → 레이아웃 일치 확인
