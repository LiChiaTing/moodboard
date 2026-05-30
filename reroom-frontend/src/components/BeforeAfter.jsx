import { useRef, useState, useCallback } from 'react'

// Draggable before/after comparison slider.
// `before` = the user's original room photo, `after` = the AI-generated result.
// The after image is the base layer; the before image sits on top, clipped to
// the left of the handle, so dragging reveals more "after" as you move right.
export default function BeforeAfter({ before, after, children }) {
  const [pos, setPos] = useState(50) // handle position, 0–100 (%)
  const ref = useRef(null)
  const dragging = useRef(false)

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

  return (
    <div
      className="ba"
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
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
