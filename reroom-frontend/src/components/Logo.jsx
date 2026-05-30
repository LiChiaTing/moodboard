// Brand logo — inlined SVG so the page-loaded "Anton" font applies to the
// wordmark (an external <img> would fall back to a system font).
export default function Logo() {
  return (
    <svg
      className="app-logo"
      viewBox="0 0 240 44"
      role="img"
      aria-label="Moodboard"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0"  y="2"  width="22" height="22" rx="6" fill="#F4724A" />
      <rect x="10" y="10" width="22" height="22" rx="6" fill="#F5D030" />
      <rect x="7"  y="0"  width="22" height="22" rx="6" fill="#C5AEED" />
      <rect x="17" y="8"  width="22" height="22" rx="6" fill="#4CAF72" />
      <text
        x="28"
        y="32"
        fontFamily="Anton, sans-serif"
        fontWeight="400"
        fontSize="26"
        fill="#1C1C1C"
        letterSpacing="0.5"
      >
        MOODBOARD
      </text>
    </svg>
  )
}
