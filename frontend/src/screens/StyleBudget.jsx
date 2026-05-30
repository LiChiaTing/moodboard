import { STYLE_TILES, COLOR_MOODS } from '../data/mock.js';

// Step 2 — Budget (first!) + visual style tiles + color mood.
// Per Dianne's UX review: no text box, budget on top, photo tiles
// instead of style-name tags. Tap up to 3 styles.
export default function StyleBudget({ state, setState, onNext, onBack }) {
  const { budget, styles, color } = state;

  function toggleStyle(id) {
    if (styles.includes(id)) setState({ ...state, styles: styles.filter((s) => s !== id) });
    else if (styles.length < 3) setState({ ...state, styles: [...styles, id] });
  }

  const styleNames = styles
    .map((id) => STYLE_TILES.find((t) => t.id === id)?.name)
    .filter(Boolean).join(' · ') || '—';
  const colorName = COLOR_MOODS.find((c) => c.id === color)?.name || '—';

  return (
    <div className="frame" style={{ '--accent': 'var(--coral)' }}>
      <div className="app-bar">
        <div className="step-bubble">2</div>
        <div>
          <div className="title">Set your budget &amp; style</div>
          <div className="sub">No typing needed — just tap what feels right</div>
        </div>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: '40%' }} /></div>

      <div className="section-content">
        {/* A — BUDGET FIRST */}
        <div className="label">A &nbsp; What's your budget?</div>
        <div className="ai-badge">✦ AI suggests $200–$350 <span className="dim">based on your photo</span></div>
        <div className="budget-row">
          <div className="slider-wrap">
            <input
              className="range" type="range" min="50" max="5000" step="10"
              value={budget}
              onChange={(e) => setState({ ...state, budget: Number(e.target.value) })}
            />
            <div className="slider-labels"><span>$50</span><span>$5,000</span></div>
          </div>
          <div className="budget-amount">${budget.toLocaleString()}<br /><span>USD</span></div>
        </div>

        <div className="divider" />

        {/* B — VISUAL STYLE TILES */}
        <div className="label">B &nbsp; Which rooms feel right to you?</div>
        <div className="sublabel">Tap up to 3 — AI figures out your style from your picks. No need to know style names.</div>
        <div className="style-grid">
          {STYLE_TILES.map((t) => {
            const sel = styles.includes(t.id);
            return (
              <div key={t.id} className={'style-tile' + (sel ? ' selected' : '')} onClick={() => toggleStyle(t.id)}>
                <div className="style-tile-img" style={{ background: t.grad }} />
                <div className="style-tile-info">
                  <div className="style-tile-name">{t.name}</div>
                  <div className="style-tile-sub">{t.sub}</div>
                </div>
                {sel && <div className="tile-check">✓</div>}
              </div>
            );
          })}
        </div>
        <div className="select-count">{styles.length} of 3 selected</div>

        <div className="divider" />

        {/* C — COLOR MOOD (optional) */}
        <div className="label">C &nbsp; Color mood <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--muted)' }}>(optional)</span></div>
        <div className="sublabel">Pick one that feels closest</div>
        <div className="color-grid">
          {COLOR_MOODS.map((c) => (
            <div key={c.id} className={'color-tile' + (color === c.id ? ' selected' : '')}
              onClick={() => setState({ ...state, color: color === c.id ? null : c.id })}>
              <div className="color-swatch" style={{ background: c.grad }} />
              <div className="color-info">
                <div className="color-name">{c.name}</div>
                <div className="color-sub">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="summary-box">
          <div className="summary-title">Ready to analyze</div>
          <div className="summary-row"><b>🎨 Style</b> {styleNames}</div>
          <div className="summary-row"><b>🎨 Colors</b> {colorName}</div>
          <div className="summary-row"><b>💰 Budget</b> ${budget.toLocaleString()} USD</div>
        </div>

        <button className="cta" disabled={styles.length === 0} onClick={onNext}>Analyze my space →</button>
        <button className="link-btn" onClick={onBack}>← Back to photos</button>
        <div className="foot-note">AI will analyze your photo and search the web for matching products — takes ~15 seconds</div>
      </div>
    </div>
  );
}
