import { useState } from 'react'
import { useFlow } from '../context/FlowContext.jsx'
import { activeVariant, buyUrl } from '../data/products.js'
import { useToast } from '../components/Toast.jsx'
import ProductThumb from '../components/ProductThumb.jsx'
import BeforeAfter from '../components/BeforeAfter.jsx'

export default function Results() {
  const {
    photos, generatedImageUrl, budget, plan, swapProduct,
    favorites, toggleFavorite, styles, goTo,
  } = useFlow()
  const toast = useToast()

  const [expanded, setExpanded] = useState(false)
  const [spinning, setSpinning] = useState(null)

  // Before = the user's uploaded room (falls back to a demo photo so the
  // comparison still works before anyone uploads). After = the AI-generated
  // result (demo image until the backend returns a real one).
  const beforeImage = photos[0]?.url || '/room-before.jpg'
  const afterImage = generatedImageUrl || '/room-after.png'

  // Budget math from the live plan
  const spent = plan.reduce((sum, p) => {
    if (p.owned) return sum
    return sum + activeVariant(p).price
  }, 0)
  const fillPct = Math.min(100, (spent / budget) * 100)
  const over = spent > budget

  const visible = expanded ? plan : plan.slice(0, 4)
  const styleLabel = styles.join(' · ') || 'Your'

  const handleSwap = (id) => {
    setSpinning(id)
    swapProduct(id)
    setTimeout(() => setSpinning(null), 350)
  }

  const handleView = (variant) => {
    window.open(buyUrl(variant), '_blank', 'noopener')
  }

  return (
    <div className="slide s5">
      <div className="blob s5-blob-a" />
      <div className="blob s5-blob-b" />

      <div className="s5-layout">
        {/* LEFT — before/after room photo */}
        <div className="s5-photo-panel">
          <BeforeAfter before={beforeImage} after={afterImage}>
            <div className="s5-photo-overlay">
              <div
                className="s5-cohesion-badge"
                title="Cohesion score: how well these pieces work together as one look — colour harmony, style match and scale."
              >
                <span>91%</span> cohesion score ⓘ
              </div>
            </div>
          </BeforeAfter>
        </div>

        {/* RIGHT — products */}
        <div className="s5-product-panel">
          <div className="s5-panel-title">Results · {plan.length} products found</div>
          <div className="s5-panel-headline">Your {styleLabel} room plan</div>

          <div className="s5-budget-row">
            <div className="s5-budget-track">
              <div
                className={'s5-budget-fill' + (over ? ' over' : '')}
                style={{ width: fillPct + '%' }}
              />
            </div>
            <div className="s5-budget-label">
              ${spent} of ${budget}
            </div>
          </div>

          <div className="s5-refine-bar">
            <div className="s5-refine-text">
              <strong>Not quite right?</strong> Swap any item below, or re-run with a
              different budget or style.
            </div>
            <button className="s5-refine-btn" onClick={() => goTo(2)}>
              Adjust &amp; re-run ↻
            </button>
          </div>

          {visible.map((p) => {
            const v = activeVariant(p)
            const fav = favorites.has(p.id)
            return (
              <div className="s5-product" key={p.id}>
                <ProductThumb product={p} variant={v} />
                <div className="s5-product-body">
                  <div className="s5-product-name">{v.name}</div>
                  <div className="s5-product-why">{v.why}</div>
                  <div className="s5-product-row">
                    <div className="s5-product-price">
                      {p.owned ? (
                        <>$0 <span style={{ fontSize: 11, color: 'var(--mid)' }}>already own</span></>
                      ) : (
                        '$' + v.price
                      )}
                    </div>
                    <div className="s5-product-actions">
                      <button
                        className={'s5-swap' + (spinning === p.id ? ' spinning' : '')}
                        title={p.owned ? 'You own this' : 'Swap — show me another option'}
                        onClick={() => !p.owned && handleSwap(p.id)}
                      >
                        {p.owned ? '✕' : '↻'}
                      </button>
                      <button
                        className={'s5-heart' + (fav ? ' active' : '')}
                        title={fav ? 'Saved' : 'Save to favourites'}
                        onClick={() => toggleFavorite(p.id)}
                      >
                        {fav ? '♥' : '♡'}
                      </button>
                      {!p.owned && (
                        <button className="s5-buy-btn" onClick={() => handleView(v)}>
                          View →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {plan.length > 4 && (
            <button className="s5-more" onClick={() => setExpanded((e) => !e)}>
              {expanded ? '↑ Show fewer items' : `+ ${plan.length - 4} more items ↓`}
            </button>
          )}

          <button className="s5-save-btn" onClick={() => goTo(5)}>
            Save my room plan →
          </button>
        </div>
      </div>
    </div>
  )
}
