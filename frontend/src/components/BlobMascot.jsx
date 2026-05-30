// A little friendly blob character — organic shape, dot eyes, arc smile.
// Flat, no outline (per the Risograph direction). Bobs gently via CSS.
export default function BlobMascot({ size = 96, color = 'var(--coral)' }) {
  return (
    <svg className="blob-mascot" width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* organic blob body — slightly imperfect, not a perfect circle */}
      <path
        fill={color}
        d="M50 6c16 0 30 8 37 22 6 12 4 26-2 38-7 14-20 22-35 22S22 80 14 67C7 55 4 41 11 28 18 14 33 6 50 6Z"
      />
      {/* eyes */}
      <circle cx="38" cy="46" r="4.2" fill="#fff" />
      <circle cx="62" cy="46" r="4.2" fill="#fff" />
      {/* arc smile */}
      <path d="M36 60c4 7 24 7 28 0" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
      {/* little cheek dots */}
      <circle cx="30" cy="56" r="3" fill="#fff" opacity=".45" />
      <circle cx="70" cy="56" r="3" fill="#fff" opacity=".45" />
    </svg>
  );
}
