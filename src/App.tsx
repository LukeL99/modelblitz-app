import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BenchmarkPage from './pages/BenchmarkPage'
import ProcessingPage from './pages/ProcessingPage'
import ReportPage from './pages/ReportPage'
import SharedReportPage from './pages/SharedReportPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/benchmark" element={<BenchmarkPage />} />
      <Route path="/benchmark/:id/progress" element={<ProcessingPage />} />
      <Route path="/report/:id" element={<ReportPage />} />
      <Route path="/shared/:id" element={<SharedReportPage />} />
    </Routes>
  )
}
