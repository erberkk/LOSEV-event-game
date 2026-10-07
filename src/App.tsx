import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { AnimatePresence, MotionConfig } from 'motion/react'
import Header from './components/Header'
import Home from './pages/Home'
import Join from './pages/Join'
import Play from './pages/Play'
import Found from './pages/Found'
import NotFound from './pages/NotFound'

const Certificate = lazy(() => import('./pages/Certificate'))
const Posters = lazy(() => import('./pages/Posters'))

export default function App() {
  const location = useLocation()
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <Suspense key={location.pathname} fallback={<div className="min-h-svh" />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/katil" element={<Join />} />
            <Route path="/oyun" element={<Play />} />
            <Route path="/h/:token" element={<Found />} />
            <Route path="/sertifika" element={<Certificate />} />
            <Route path="/afis" element={<Posters />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </MotionConfig>
  )
}
