# 🏠 AI Room Transformer
### Cascadia AI Hackathon 2026 · Team of 4

> Upload photos of any room, set your vibe and budget — get a shoppable AI-curated transformation plan with a downloadable moodboard in seconds.

---

## 🎯 What It Does

Most people have a space that needs love but no idea where to start or what to buy. AI Room Transformer solves this in 90 seconds:

1. **Upload** 1–4 photos of your room
2. **Set your vibe** — cozy, minimalist, bold, or maximalist
3. **Set your budget** — e.g. $300
4. **Get back** a full room analysis, shoppable product picks under budget, and a downloadable moodboard PDF

---

## 🏗️ Architecture

```
User uploads photos
        │
        ▼
P4 Frontend (React)
        │  POST /upload
        ▼
P1 Box Server ──────────────── Box Storage
        │  returns photosFolderId      (photos/ + output/ folders)
        ▼
P2 Vision AI (AWS Bedrock)
        │  analyzes room photos
        │  returns room JSON
        ▼
P3 Product AI (Apify + Claude)
        │  scrapes products, curates picks
        │  generates moodboard PDF
        │  POST /session/:id/moodboard
        ▼
P1 Box Server ──────────────── Box Storage
        │  saves PDF, returns downloadUrl    (moodboard PDF)
        ▼
P4 Frontend
        └── shows download button to user
```

---

## 👥 Team

| Person | Role | Owns |
|--------|------|------|
| P1 | Box Integration | File storage, folder structure, moodboard PDF output |
| P2 | Vision AI | AWS Bedrock room analysis, furniture/issue detection |
| P3 | Product AI | Apify product scraping, AI curation, budget tracking |
| P4 | Frontend | React UI, upload flow, product cards, moodboard preview |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| File storage | Box API |
| Vision AI | AWS Bedrock (Claude) |
| Product scraping | Apify |
| AI curation | Anthropic Claude API |
| Backend | Node.js + Express |
| Frontend | React |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Box Developer account → https://developer.box.com
- AWS account with Bedrock access enabled
- Apify account → https://apify.com

### 1. Clone the repo
```bash
git clone https://github.com/YOURUSERNAME/room-transformer.git
cd room-transformer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root:
```
# Box
BOX_CLIENT_ID=your_client_id
BOX_CLIENT_SECRET=your_client_secret
BOX_REDIRECT_URI=http://localhost:3000/callback

# AWS
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1

# Apify
APIFY_API_TOKEN=your_apify_token

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key
```

### 4. Run the server
```bash
node server.js
```

### 5. Connect Box
Open your browser and go to:
```
http://localhost:3000/auth
```
Log in with your Box account and click **Grant access**.

---

## 📡 API Endpoints

### `GET /auth`
Redirects to Box login. Visit after every server restart.

---

### `GET /status`
Check if Box is connected.
```json
{ "connected": true }
```

---

### `POST /upload`
Upload room photos. Called by the frontend.

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `photos[]` | files | Room photo images (up to 10) |
| `sessionId` | string | Unique session ID |

**Response:**
```json
{
  "success": true,
  "sessionId": "user_001",
  "folders": {
    "sessionFolderId": "385599035441",
    "photosFolderId": "385590654120",
    "outputFolderId": "385598680452"
  },
  "files": [
    { "fileId": "2254226418397", "name": "room.jpg" }
  ]
}
```

**Test:**
```bash
curl -X POST http://localhost:3000/upload \
  -F "sessionId=test001" \
  -F "photos=@/path/to/room.jpg"
```

---

### `POST /session/:sessionId/moodboard`
Save the AI-generated moodboard PDF to Box. Called by P3.

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `pdf` | file | Moodboard PDF file |

**Response:**
```json
{
  "success": true,
  "fileId": "2254238857882",
  "downloadUrl": "https://app.box.com/shared/static/abc123.pdf",
  "viewUrl": "https://app.box.com/s/abc123"
}
```

**Test:**
```bash
echo "test" > /tmp/test.pdf
curl -X POST http://localhost:3000/session/test001/moodboard \
  -F "pdf=@/tmp/test.pdf"
```

---

## 📁 Box Folder Structure

Every session automatically creates:
```
RoomTransformer/
  └── session_abc123/
        ├── photos/     ← uploaded room photos
        └── output/     ← moodboard PDF
```

---

## 🎬 Demo Script (90 seconds)

| Time | Action |
|------|--------|
| 0:00 | "Everyone has a room that needs love but no idea where to start." |
| 0:15 | Upload 3 pre-loaded room photos. Select "cozy minimalist" + $300 budget. |
| 0:30 | AI analysis appears: "bare walls, harsh light, needs warmth and texture." |
| 0:50 | 8 shoppable product cards appear — running total: $287. |
| 1:10 | Click download — moodboard PDF opens from Box. "Your room, transformed, for $287." |

---

