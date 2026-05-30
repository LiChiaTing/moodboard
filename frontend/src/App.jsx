import { useState } from 'react';
import Upload from './screens/Upload.jsx';
import StyleBudget from './screens/StyleBudget.jsx';
import Analyzing from './screens/Analyzing.jsx';
import Moodboard from './screens/Moodboard.jsx';
import { uploadPhotos } from './api.js';
import { DEMO_PHOTOS } from './data/mock.js';

// The whole app is a 4-step wizard. App holds the shared state
// (photos, budget, styles…) and decides which screen is on screen.
// photos starts preloaded with the demo room shots — delete them in
// Step 1 to show the empty upload state instead.
const FRESH = { photos: [...DEMO_PHOTOS], budget: 280, styles: [], color: null, sessionId: null };

export default function App() {
  const [step, setStep] = useState(1);        // 1..4
  const [state, setState] = useState(FRESH);   // user inputs, shared across screens
  const [results, setResults] = useState(null); // AI output (set after step 3)

  const setPhotos = (photos) => setState((s) => ({ ...s, photos }));

  // Step 1 → 2: send photos to Box (mocked), remember the sessionId.
  async function goToStyle() {
    let sessionId = state.sessionId;
    try {
      // Demo photos have no File object (file: null) — skip those.
      const realFiles = state.photos.map((p) => p.file).filter(Boolean);
      const res = await uploadPhotos(realFiles);
      sessionId = res.sessionId;
    } catch (e) {
      console.warn('Upload skipped (backend not connected yet):', e.message);
    }
    setState((s) => ({ ...s, sessionId }));
    setStep(2);
  }

  function restart() {
    // Only blob: URLs (real uploads) need revoking — demo paths don't.
    state.photos.forEach((p) => { if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url); });
    setState({ ...FRESH, photos: [...DEMO_PHOTOS] });
    setResults(null);
    setStep(1);
  }

  return (
    <div className="app-shell">
      <div className="app-title-bar">
        <div className="logo">🛋️</div>
        <div>
          <h1>AI Room Transformer</h1>
          <p>Your personal space decorator, powered by AI</p>
        </div>
        <span className="demo-pill">Demo · mock data</span>
      </div>

      {step === 1 && (
        <Upload
          photos={state.photos}
          setPhotos={setPhotos}
          onNext={goToStyle}
          onSkip={goToStyle}
        />
      )}

      {step === 2 && (
        <StyleBudget
          state={state}
          setState={setState}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Analyzing
          state={state}
          onDone={(r) => { setResults(r); setStep(4); }}
        />
      )}

      {step === 4 && results && (
        <Moodboard
          state={state}
          results={results}
          onRestart={restart}
        />
      )}
    </div>
  );
}
