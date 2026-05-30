import { useEffect, useState } from 'react';
import { LOADING_STEPS } from '../data/mock.js';
import { analyzeRoom, curateProducts } from '../api.js';
import BlobMascot from '../components/BlobMascot.jsx';

// Step 3 — Loading screen. Fires the real (currently mocked) AI calls,
// while animating the 5 progress steps so the wait never feels dead.
export default function Analyzing({ state, onDone }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    // Each mount runs its own pipeline; if React unmounts this (e.g. dev
    // StrictMode double-mount), `cancelled` stops the stale one so only the
    // live mount calls onDone. No outer ref guard — that blocked the live run.
    let cancelled = false;

    async function run() {
      // Kick off the actual pipeline (mocked for now).
      const analysis = await analyzeRoom(state.sessionId);
      const products = await curateProducts({
        analysis, styles: state.styles, color: state.color, budget: state.budget,
      });

      // Walk through the visible steps with a pleasant cadence.
      for (let i = 1; i < LOADING_STEPS.length; i++) {
        await new Promise((r) => setTimeout(r, 1100));
        if (cancelled) return;
        setActive(i);
      }
      await new Promise((r) => setTimeout(r, 900));
      if (!cancelled) onDone({ analysis, products });
    }

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="frame" style={{ '--accent': 'var(--yellow)', '--on-accent': 'var(--ink)' }}>
      <div className="app-bar">
        <div className="step-bubble">3</div>
        <div>
          <div className="title">Finding your perfect pieces</div>
          <div className="sub">Sit tight — about 15 seconds</div>
        </div>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: '75%' }} /></div>

      <div className="loading-screen">
        <BlobMascot />
        <div className="loading-title">Analyzing your space</div>
        <div className="loading-sub">Reading your room and searching across stores</div>

        <div className="loading-steps">
          {LOADING_STEPS.map((label, i) => {
            const status = i < active ? 'done' : i === active ? 'active' : 'pending';
            return (
              <div key={i} className={'loading-step ' + status}>
                <div className={'dot dot-' + status} />
                {label}{status === 'active' && '…'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
