import { useMemo, useState } from 'react';
import { saveMoodboard } from '../api.js';

// Step 4 — The moodboard result.
// Tapping a pick's circle toggles it in/out of the plan, and the
// budget meter updates live (turns red if you go over).
export default function Moodboard({ state, results, onRestart }) {
  const { budget, photos, sessionId } = state;
  const { products } = results;

  const [inPlan, setInPlan] = useState(() => new Set(products.map((p) => p.id)));
  const [view, setView] = useState('after'); // 'before' | 'after'
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (id) => {
    const next = new Set(inPlan);
    next.has(id) ? next.delete(id) : next.add(id);
    setInPlan(next);
  };

  const total = useMemo(
    () => products.filter((p) => inPlan.has(p.id)).reduce((s, p) => s + p.price, 0),
    [products, inPlan]
  );
  const over = total > budget;
  const beforePhoto = photos[0]?.url;
  const placed = products.filter((p) => p.placed && inPlan.has(p.id));

  async function download() {
    setSaving(true);
    // In the real app this hands the generated PDF to Box (P1's endpoint).
    await saveMoodboard(sessionId, new Blob(['demo'], { type: 'application/pdf' }));
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="frame wide" style={{ '--accent': 'var(--green)' }}>
      <div className="app-bar">
        <div className="step-bubble">4</div>
        <div>
          <div className="title">Here's your moodboard</div>
          <div className="sub">AI selected the best-fit products and placed them in your space</div>
        </div>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: '100%' }} /></div>

      <div className="result-layout">
        {/* LEFT — composited photo + before/after */}
        <div className="result-left">
          <div className="col-title">Your room with new pieces</div>

          <div className="beforeafter">
            <div className="ba-label">{view === 'after' ? '✦ AI composited' : 'Before'}</div>
            {beforePhoto
              ? <img src={beforePhoto} alt="room" style={view === 'after' ? { filter: 'saturate(1.15) brightness(1.05)' } : {}} />
              : <div className="placeholder-photo" style={{ background: 'var(--accent)' }}>
                  <p>{view === 'after' ? 'Composited room photo' : 'Original photo'}</p>
                  <small>Side table + floor lamp placed by AI</small>
                </div>}
          </div>

          <div className="ba-toggle">
            <button className={'ba-btn' + (view === 'before' ? ' active' : '')} onClick={() => setView('before')}>Before</button>
            <button className={'ba-btn' + (view === 'after' ? ' active' : '')} onClick={() => setView('after')}>After</button>
          </div>

          <div className="col-sub" style={{ fontWeight: 600, color: 'var(--muted)' }}>Placed in this photo</div>
          <div className="placed-items">
            {placed.length ? placed.map((p) => (
              <div key={p.id} className="placed-chip">
                <div className="dot-img" style={{ background: p.grad }} />{p.name}
              </div>
            )) : <span style={{ fontSize: 11, color: 'var(--muted)' }}>No items placed</span>}
          </div>
        </div>

        {/* RIGHT — picks + budget + actions */}
        <div className="result-right">
          <div>
            <div className="col-title">✦ AI's best picks for you</div>
            <div className="col-sub">Chosen based on your style, budget &amp; room</div>
          </div>

          {products.map((p) => {
            const on = inPlan.has(p.id);
            return (
              <div key={p.id} className={'pick-card' + (on ? '' : ' dropped')}>
                <div className="pick-img">
                  <div className="swatch" style={{ background: p.grad }} />
                  <div className="pick-match">{p.match}% fit</div>
                </div>
                <div className="pick-info">
                  <div className="pick-name">{p.name}</div>
                  <div className="pick-store">{p.store}</div>
                  <div className="pick-price">${p.price}</div>
                  <div className="pick-why">"{p.why}"</div>
                  <div className="pick-actions">
                    <a className="sl-link" href={p.url} onClick={(e) => e.preventDefault()}>View →</a>
                    <button
                      className="btn-swap-sm"
                      style={on ? { background: 'var(--green)', color: 'white', borderColor: 'var(--green)' } : {}}
                      onClick={() => toggle(p.id)}
                    >
                      {on ? '✓ In plan' : '+ Add'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="total-row">
            <div className="total-label">Total</div>
            <div className={'total-amount' + (over ? ' over' : '')}>
              ${total} <span className="cap">/ ${budget} budget</span>
            </div>
          </div>
          {over && <div style={{ fontSize: 10, color: 'var(--coral)', fontWeight: 700, textAlign: 'right', marginTop: -6 }}>Over budget — drop an item to fit</div>}

          <div className="action-row">
            <button className="btn-dl" onClick={download} disabled={saving}>
              {saving ? 'Saving…' : saved ? '✓ Saved to Box' : '⬇ Download PDF'}
            </button>
            <button className="btn-share">Share link</button>
          </div>
          <button className="ghost-btn" onClick={onRestart}>↺ Start over</button>

          <div className="pdf-box">
            <div className="pdf-title">PDF includes</div>
            <div className="pdf-list">
              ✓ &nbsp;Composited room photo<br />
              ✓ &nbsp;Before &amp; after comparison<br />
              ✓ &nbsp;Product list with links &amp; prices<br />
              ✓ &nbsp;Total cost summary
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
