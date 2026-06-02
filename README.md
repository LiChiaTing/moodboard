# Moodboard

Turn a room photo into a budget-aware, shoppable interior design plan.

## What it is

Moodboard is the frontend for an AI interior-design tool. A user uploads a photo
of their room, sets a budget and style preferences, and gets back a redesigned
room with a shoppable product list. This repository is a fork of a team hackathon
project; this version focuses on the polished frontend experience.

The current `main` branch is a self-contained, clickable demo (it runs without a
backend). The team's backend-wired version is preserved on the `backend-integration`
branch for later work.

## Project structure

```
moodboard/
├── docs/              All research and design work
│   ├── 01-research/     User research (UX research, en + zh)
│   ├── 02-design/       Design system, logo, wireframes, screen specs
│   └── 03-decisions/    Design decisions and rationale
├── reroom-frontend/   The frontend app (React + Vite) — the product
├── roomgen-service/   AI image-generation service (Java) — backend
├── ProductCurator/    Product recommendation service (Node) — backend
└── server.js          File-upload helper (Box)
```

See [docs/README.md](docs/README.md) for a guide to the research and design files.

## How to run the frontend

```bash
cd reroom-frontend
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173). Requires Node 18+.

## Credits

Forked from [MansaPatidar/room-transformer](https://github.com/MansaPatidar/room-transformer),
a team hackathon project. Team: Mansa, Dianne, saikiran, varsha.
Frontend design and interface by Dianne Ting.
