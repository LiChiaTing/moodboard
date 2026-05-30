import { useRef, useState } from 'react';

const ROOM_LABELS = ['🛋 Living room', '🛏 Bedroom', '🍳 Kitchen', '🚪 Entryway', '🪑 Corner detail', '🛁 Bathroom'];

// Step 1 — Upload photos of the space.
// `photos` is an array of { file, url, label } held in App state.
export default function Upload({ photos, setPhotos, onNext, onSkip }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function addFiles(fileList) {
    const incoming = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 4 - photos.length)
      .map((f) => ({ file: f, url: URL.createObjectURL(f), label: '' }));
    setPhotos([...photos, ...incoming]);
  }

  function removePhoto(i) {
    if (photos[i].url.startsWith('blob:')) URL.revokeObjectURL(photos[i].url);
    setPhotos(photos.filter((_, idx) => idx !== i));
  }

  function setLabel(i, label) {
    setPhotos(photos.map((p, idx) => (idx === i ? { ...p, label } : p)));
  }

  const emptySlots = Math.max(0, 4 - photos.length);

  return (
    <div className="frame" style={{ '--accent': 'var(--blue)' }}>
      <div className="app-bar">
        <div className="step-bubble">1</div>
        <div>
          <div className="title">Upload photos of your space</div>
          <div className="sub">At least 1 photo · or skip if starting fresh</div>
        </div>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: '20%' }} /></div>

      <div className="section-content">
        <div
          className={'drop-zone' + (dragging ? ' dragging' : '')}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
        >
          <div className="drop-icon">📷</div>
          <div className="drop-title">Drag &amp; drop your photos here</div>
          <div className="drop-or">or</div>
          <button className="btn-browse" type="button">Browse photos</button>
          <div className="drop-hint">JPG · PNG · Max 10MB per photo</div>
        </div>
        <input
          ref={inputRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />

        <div className="skip-callout">
          <span><strong>Moving into an empty space?</strong> No photos needed.</span>
          <button className="skip-link" type="button" onClick={onSkip}>Skip — I'm starting fresh →</button>
        </div>

        <div className="thumb-grid">
          {photos.map((p, i) => (
            <div key={i}>
              <div className="thumb">
                <img src={p.url} alt={p.label || 'room'} />
                <div className="check-badge">✓</div>
                <button className="del-badge" type="button" onClick={() => removePhoto(i)}>×</button>
              </div>
              <select className="annotation-select" value={p.label} onChange={(e) => setLabel(i, e.target.value)}>
                <option value="">Label this space (optional)</option>
                {ROOM_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={'e' + i}>
              <div className="thumb empty" onClick={() => inputRef.current?.click()}>
                <div className="plus">+</div><span>Add photo</span>
              </div>
            </div>
          ))}
        </div>

        <div className="tip-box">
          <div className="tip-title">💡 Shooting tips</div>
          <p>Daylight photos work best · Wide-angle shot recommended · Close-ups help AI detect textures · Messy is fine — AI doesn't judge.</p>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className="cta" disabled={photos.length === 0} onClick={onNext}>
            Next: Pick your style →
          </button>
          <div className="foot-note">
            {photos.length === 0 ? 'Add at least 1 photo, or use the skip option above'
              : `${photos.length} photo${photos.length > 1 ? 's' : ''} ready`}
          </div>
        </div>
      </div>
    </div>
  );
}
