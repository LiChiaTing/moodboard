import { useEffect, useRef } from 'react'

// ── Content (single source of truth = the published case study) ──
// diannedesign.me/work/moodboard

const CASE_STUDY_URL = 'https://www.diannedesign.me/work/moodboard'

const TEAM = [
  {
    initials: 'DT',
    color: 'var(--coral)',
    name: 'Dianne Ting',
    role: 'Designer & Frontend',
    did: 'UX research, design system, React implementation',
  },
  {
    initials: 'SP',
    color: 'var(--blue)',
    name: 'Sai Kiran Peddola',
    role: 'Backend',
    did: 'Room generation (AWS Bedrock / Stability inpaint)',
  },
  {
    initials: 'VY',
    color: 'var(--green)',
    name: 'Varsha Yarragunta',
    role: 'AI / Integration',
    did: 'Product curation (Apify scrapers + Claude)',
  },
  {
    initials: 'MP',
    color: 'var(--yellow)',
    name: 'Mansa Vijay Patidar',
    role: 'Backend / Data',
    did: 'Photo storage & session management (Box)',
  },
]

// Two labeled stacks: what the team shipped at the event, and where it went since.
const STACK_HACKATHON = [
  'AWS Bedrock + Spring Boot — room generation',
  'Apify — live product scraping (Amazon, IKEA)',
  'Claude API — product curation & reasoning',
  'Box — session storage & PDF',
  'React — frontend',
]

const STACK_EVOLVED = [
  'Node + Google Gemini — room images',
  'Claude + Apify — product curation',
  'React — frontend',
]

export default function AboutOverlay({ open, onClose }) {
  const closeRef = useRef(null)

  // Escape closes; focus the close button when the panel opens.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="about-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="About this project"
    >
      <div className="about-panel" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          className="about-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* ── Event banner ── */}
        <div className="about-banner">
          <div className="about-eyebrow">Built at a hackathon</div>
          <h2 className="about-title">
            Cascadia AI<br />Hackathon 2026
          </h2>
          <div className="about-meta">
            thinkspace, Seattle · May 29–30, 2026 · 17 hours
          </div>
          <div className="about-result">
            🏆 1st Place — Apify Prize ($500) &nbsp;·&nbsp; Top 12 of 54 teams
          </div>
        </div>

        {/* ── Problem ── */}
        <p className="about-problem">
          “Finding furniture that actually fits — your space, your style, your
          budget — means hours lost in an ocean of online options.”
        </p>

        {/* ── Team ── */}
        <div className="about-section">
          <h3 className="about-h3">The team</h3>
          <div className="about-team">
            {TEAM.map((m) => (
              <div className="about-card" key={m.initials}>
                <div className="about-av" style={{ background: m.color }}>
                  {m.initials}
                </div>
                <div className="about-card-body">
                  <div className="about-name">{m.name}</div>
                  <div className="about-role">{m.role}</div>
                  <div className="about-did">{m.did}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tech ── */}
        <div className="about-section">
          <h3 className="about-h3">How it's built</h3>
          <div className="about-tech">
            <div className="about-tech-group">
              <div className="about-tech-label">Built at the hackathon</div>
              <ul className="about-tech-list">
                {STACK_HACKATHON.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="about-tech-group">
              <div className="about-tech-label">Since evolved to</div>
              <ul className="about-tech-list">
                {STACK_EVOLVED.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Footer link ── */}
        <a
          className="about-link"
          href={CASE_STUDY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read the full case study →
        </a>
      </div>
    </div>
  )
}
