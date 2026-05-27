import { useEffect, useState } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { EvaluatorPage } from './pages/EvaluatorPage'
import { DemoPage } from './pages/DemoPage'

function App() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  const toggleDark = () =>
    setDark((d) => {
      const next = !d
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })

  return (
    <Routes>
      <Route path="/" element={<LandingPage dark={dark} toggleDark={toggleDark} />} />
      <Route path="/evaluate" element={<EvaluatorPage dark={dark} toggleDark={toggleDark} />} />
      <Route path="/demo" element={<DemoPage dark={dark} toggleDark={toggleDark} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
