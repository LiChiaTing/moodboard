import { useEffect } from 'react'
import { useFlow, TOTAL_SLIDES } from './context/FlowContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import ProgressBar from './components/ProgressBar.jsx'
import Logo from './components/Logo.jsx'
import Hero from './slides/Hero.jsx'
import Upload from './slides/Upload.jsx'
import BudgetStyle from './slides/BudgetStyle.jsx'
import Loading from './slides/Loading.jsx'
import Results from './slides/Results.jsx'
import Save from './slides/Save.jsx'

const isTyping = (el) =>
  el && ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)

// Slide 3 is the Loading screen — the system drives navigation here,
// so all manual controls are locked until it auto-advances to Results.
const LOADING_SLIDE = 3

export default function App() {
  const { current, goTo, navigate } = useFlow()
  const locked = current === LOADING_SLIDE

  // Keyboard navigation (ignored while typing in a field, or while locked)
  useEffect(() => {
    const onKey = (e) => {
      if (isTyping(e.target) || locked) return
      if (e.key === 'ArrowRight') navigate(1)
      if (e.key === 'ArrowLeft') navigate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, locked])

  return (
    <ToastProvider>
      <button
        className="app-logo-btn"
        onClick={() => goTo(0)}
        aria-label="Moodboard — back to start"
      >
        <Logo />
      </button>

      <ProgressBar />

      <div className="slideshow">
        <div
          className="slides-track"
          style={{ transform: `translateX(-${current * 100}vw)` }}
        >
          <Hero />
          <Upload />
          <BudgetStyle />
          <Loading />
          <Results />
          <Save />
        </div>
      </div>

      <button
        className="nav-btn prev"
        onClick={() => navigate(-1)}
        disabled={current === 0 || locked}
        aria-label="Previous"
      >
        ←
      </button>
      <button
        className="nav-btn next"
        onClick={() => navigate(1)}
        disabled={current === TOTAL_SLIDES - 1 || locked}
        aria-label="Next"
      >
        →
      </button>

      <div className="dots">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            className={'dot' + (i === current ? ' active' : '') + (locked ? ' locked' : '')}
            onClick={() => goTo(i)}
            disabled={locked}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </ToastProvider>
  )
}
