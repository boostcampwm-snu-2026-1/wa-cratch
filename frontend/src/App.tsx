import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage/LandingPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<div>TODO: 로그인</div>} />
      <Route path="/explore" element={<div>TODO: 탐색</div>} />
      <Route path="/dashboard" element={<div>TODO: 대시보드</div>} />
    </Routes>
  )
}

export default App
