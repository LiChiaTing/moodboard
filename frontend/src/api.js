// ============================================================
//  api.js — the ONE file that talks to your teammates' server.
//
//  HOW THIS WORKS (read me!):
//  - Right now USE_MOCK = true, so every function returns fake
//    data after a short fake delay. The whole app is clickable
//    and demo-ready with zero backend running.
//  - When a teammate's endpoint is ready, set its mock to false
//    (or flip USE_MOCK globally) and the REAL fetch runs instead.
//  - The screens call these functions and don't care which is on.
//
//  Backend doorways that already exist (see ../../../server.js):
//    GET  /status                      -> { connected }
//    GET  /auth                        -> Box login (open in browser)
//    POST /upload                      -> { sessionId, folders, files }
//    POST /session/:id/moodboard       -> { downloadUrl, viewUrl }
//  Doorways NOT built yet (P2 vision / P3 products) -> still mocked.
//
//  Vite proxies these paths to http://localhost:3000 (see vite.config.js),
//  so you can use plain paths like '/upload' with no CORS headaches.
// ============================================================

import { MOCK_ANALYSIS, MOCK_PRODUCTS } from './data/mock.js';

const USE_MOCK = true; // master switch — flip to false once teammates are live

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- 1. Upload photos to Box (P1 — endpoint EXISTS) -------------------
export async function uploadPhotos(files) {
  if (USE_MOCK) {
    await wait(600);
    return { sessionId: 'demo_' + Math.floor(performance.now()), files: files.map((f) => f.name) };
  }
  // --- REAL (uncomment when Box is connected via /auth) ---
  const form = new FormData();
  files.forEach((f) => form.append('photos', f));
  const res = await fetch('/upload', { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

// ---- 2. Analyze the room (P2 vision AI — NOT built yet) --------------
export async function analyzeRoom(/* sessionId */) {
  if (USE_MOCK) {
    await wait(800);
    return MOCK_ANALYSIS;
  }
  // --- REAL (when P2 ships, e.g. POST /session/:id/analyze) ---
  // const res = await fetch(`/session/${sessionId}/analyze`, { method: 'POST' });
  // return res.json();
  return MOCK_ANALYSIS;
}

// ---- 3. Curate products (P3 product AI — NOT built yet) --------------
export async function curateProducts(/* { analysis, styles, colors, budget } */) {
  if (USE_MOCK) {
    await wait(900);
    return MOCK_PRODUCTS;
  }
  // --- REAL (when P3 ships, e.g. POST /curate with the room profile) ---
  // const res = await fetch('/curate', {
  //   method: 'POST', headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ analysis, styles, colors, budget }),
  // });
  // return res.json();
  return MOCK_PRODUCTS;
}

// ---- 4. Save final moodboard PDF to Box (P1 — endpoint EXISTS) -------
export async function saveMoodboard(sessionId, pdfBlob) {
  if (USE_MOCK) {
    await wait(500);
    return { downloadUrl: '#demo-download', viewUrl: '#demo-view' };
  }
  // --- REAL ---
  const form = new FormData();
  form.append('pdf', pdfBlob, `moodboard_${sessionId}.pdf`);
  const res = await fetch(`/session/${sessionId}/moodboard`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Save failed');
  return res.json();
}

// ---- Helper: is Box connected? (P1 — endpoint EXISTS) ---------------
export async function checkBoxStatus() {
  if (USE_MOCK) return { connected: true };
  const res = await fetch('/status');
  return res.json();
}
