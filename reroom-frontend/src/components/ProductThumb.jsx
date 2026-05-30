import { useState } from 'react'

// Shows a product's real photo when available, and gracefully falls back
// to the coloured emoji tile if there's no image (or it fails to load).
// `variant.image` wins over `product.image` so the backend can later return
// a different photo per swapped variant without any code change here.
export default function ProductThumb({ product, variant, className = 's5-product-thumb' }) {
  const [failed, setFailed] = useState(false)
  const image = variant?.image || product.image
  const showPhoto = image && !failed

  return (
    <div
      className={className + (showPhoto ? ' has-photo' : '')}
      style={showPhoto ? undefined : { background: product.color }}
    >
      {showPhoto ? (
        <img
          src={image}
          alt={variant?.name || product.id}
          onError={() => setFailed(true)}
        />
      ) : (
        product.emoji
      )}
    </div>
  )
}
