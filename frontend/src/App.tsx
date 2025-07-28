import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import TestPage from '@/pages/TestPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/test" replace />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="*" element={<Navigate to="/test" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  )
}

export default App