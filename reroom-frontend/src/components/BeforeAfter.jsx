import { useRef, useState, useCallback, useEffect } from 'react'

// Before/after comparison slider.
// `before` = the user's original room photo, `after` = the AI-generated result.
// The after image is the base layer; the before image sits on top, clipped to
// the left of the handle, so moving the divider right reveals more "after".
//
// `auto` makes the divider sweep slowly back and forth on its own (used on the
// hero to advertise the effect). It pauses while the user hovers or drags, then
// resumes from wherever they left it.
export default function BeforeAfter({ before, after, auto = false, children }) {
  const [pos, setPos] = useState(50) // handle position, 0–100 (%)
  const ref = useRef(null)
  const dragging = useRef(false)
  const paused = useRef(false) // true while the pointer is over the slider

  const moveTo = useCallback((clientX) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.max(0, Math.min(100, pct)))
  }, [])

  const onDown = (e) => {
    dragging.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    moveTo(e.clientX)
  }
  const onMove = (e) => {
    if (dragging.current) moveTo(e.clientX)
  }
  const onUp = (e) => {
    dragging.current = false
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  // ── Auto sweep ── gentle ping-pong between the bounds, paused on interaction.
  useEffect(() => {
    if (!auto) return
    const LO = 12, HI = 88, SPEED = 18 // % per second
    let dir = 1
    let last = null
    let raf = requestAnimationFrame(function tick(t) {
      if (last == null) last = t
      const dt = (t - last) / 1000
      last = t
      if (!paused.current && !dragging.current) {
        setPos((p) => {
          let np = p + dir * SPEED * dt
          if (np >= HI) { np = HI; dir = -1 }
          if (np <= LO) { np = LO; dir = 1 }
          return np
        })
      }
      raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [auto])

  return (
    <div
      className="ba"
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerEnter={() => { paused.current = true }}
      onPointerLeave={() => { paused.current = false }}
    >
      <img className="ba-img" src={after} alt="After — AI generated room" draggable="false" />
      <img
        className="ba-img ba-before"
        src={before}
        alt="Before — your room"
        draggable="false"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      <span className="ba-tag ba-tag-before">Before</span>
      <span className="ba-tag ba-tag-after">After</span>

      <div className="ba-divider" style={{ left: pos + '%' }}>
        <div className="ba-handle" aria-hidden="true">⟷</div>
      </div>

      {children}
    </div>
  )
}
