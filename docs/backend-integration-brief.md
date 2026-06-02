# Backend integration brief

Goal: make the deployed Moodboard actually functional — upload a room photo and
get a *real* AI-generated "after" room plus *real* shoppable products — using
Dianne's own API keys. Also a learning vehicle for backend work and for testing
different image-generation models.

Start a fresh session with this file open.

## How the app is wired (the contract)

The frontend talks to two backend services (see `api.js` on the
`backend-integration` branch):

| Service | Folder | Endpoint | What it does | Tech |
|---------|--------|----------|--------------|------|
| Product Curator | `ProductCurator/` | `POST /curate-products` | Scrapes + picks products to fit the budget/style | Node + Claude + Apify |
| Room Generator | `roomgen-service/` | `POST /api/v1/generate-room` | Generates the "after" room image | Java/Spring Boot + AWS Bedrock |

The frontend reads the service URLs from `VITE_CURATOR_URL` and `VITE_ROOMGEN_URL`
(defaults: `localhost:4000` and `localhost:8080`).

The `backend-integration` branch already has this wiring. `main` is the static demo.

## What you need (your own keys) — prepare BEFORE the session

| Key | For | Where to get it | Cost |
|-----|-----|-----------------|------|
| AWS access key + secret | Room image generation (Bedrock) | aws.amazon.com → IAM; then enable Bedrock + the Stability inpaint model | pay-per-image |
| `ANTHROPIC_API_KEY` | Product curation reasoning (Claude) | console.anthropic.com | pay-per-use |
| `APIFY_API_KEY` | Scraping Amazon/IKEA listings | apify.com | free tier, then pay-per-use |

The exact variable names are in `roomgen-service/.env.example` and
`ProductCurator/.env.example`. Note: AWS Bedrock model access can take a little
while to be approved, so request it early.

## Two paths — recommended order

### Path A — get it working locally first (recommended start)

Cheapest and best for learning + experimenting. No hosting to solve yet; the live
Vercel site stays the demo for now.

1. Put each service's keys in its own local `.env` (already gitignored — never committed).
2. Run `ProductCurator` (Node) and `roomgen-service` (Java) locally.
3. Run the frontend on the `backend-integration` branch pointing at the local services.
4. Upload a photo end-to-end and confirm a real generation + real products come back.
5. Experiment with models (see below).

### Path B — make the LIVE site functional (after Path A works)

The frontend is on Vercel, but the two backends must run somewhere reachable:

- `ProductCurator` (Node) → Vercel Serverless Functions, or Railway/Render.
- `roomgen-service` (Java) → Railway/Render/Fly (it has a `Dockerfile`); Vercel can't run Java.
- Set each host's env vars (the keys). Then set `VITE_CURATOR_URL` / `VITE_ROOMGEN_URL`
  in the Vercel project and redeploy.

## Testing different image-generation models

- Within Bedrock: swap the `BEDROCK_MODEL_ID` env var (e.g. other Stability models).
- Other providers (Replicate, Stability direct, OpenAI images, Google): requires
  editing `roomgen-service` to call that provider's API. If model-swapping is a main
  goal, consider a provider-agnostic image step so switching is just config.

## Known gap to solve for "real" use

`api.js` currently feeds the generator a public *sample* room image, not the user's
actual upload — because the browser photo isn't reachable by AWS. To use the real
photo, upload it to a public store first (Vercel Blob, S3, or Cloudinary) and pass
that URL. (`server.js` was an early attempt at this using Box.)

## Security reminders

- Keys live in `.env` (local) or host env vars — NEVER in git. `.env` is gitignored.
- These run on YOUR keys, so each generation/scrape costs you money — worth setting
  usage limits where the providers allow.

## Open decisions for the session

1. Path A (local first) or straight to Path B (host it live)?
2. Stick with AWS Bedrock, or switch to an easier-to-experiment image provider (e.g. Replicate)?
3. Solve the "real uploaded photo" gap now, or keep the sample image while testing?
