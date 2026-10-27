import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Landing } from './site/Landing'
import { Privacy, Terms } from './pages/Legal'
import { NotFound } from './pages/NotFound'
import { Header } from './site/Header'
import { Footer } from './site/Footer'

function ScrollReset() {
  const { pathname, hash } = useLocation()
  useEffect(() => { if (!hash) window.scrollTo(0, 0) }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2">Skip to content</a>
      <ScrollReset />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
