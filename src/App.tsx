import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { EvaluatorPage } from './pages/EvaluatorPage'

function App() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  const toggleDark = () => setDark((d) => !d)

  return (
    <Routes>
      <Route path="/" element={<LandingPage dark={dark} toggleDark={toggleDark} />} />
      <Route path="/evaluate" element={<EvaluatorPage dark={dark} toggleDark={toggleDark} />} />
    </Routes>
  )
}

export default App
