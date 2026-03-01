# FocusFlow EdTech

AI-powered immersive adaptive learning for neurodivergent students. Built at **HKUST Hackathon 2026**.

---

## Overview

This workspace contains the FocusFlow ecosystem: an adaptive learning platform with a 2D pixel-art classroom, login flow, AI backend, and asset tools.

| Project | Description | Path |
|---------|-------------|------|
| **FocusFlow** | Main 2D classroom app (Next.js, adaptive engine, AI tutor) | `Person2/Person2/HTE-Person2/focusflow-3d/` |
| **Login Page** | Pixel-art login page | `Login Page/` |
| **Person3 FastAPI** | Web scraper / RAG backend | `Person3/FastAPI/` |
| **Gemini Sprites** | Sprite assets for the game | `Gemini Sprites/` |

---

## Quick Start

### FocusFlow (main app)

```bash
cd Person2/Person2/HTE-Person2/focusflow-3d
npm install --legacy-peer-deps
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Login Page

```bash
cd "Login Page"
npm install
npm run dev
```

### Pixel-art door removal

```bash
python remove_doors.py
```

Output: `wall_no_doors.png`

---

## Documentation

- **[FocusFlow README](Person2/Person2/HTE-Person2/focusflow-3d/README.md)** – API reference, architecture, adaptive engine
- **[PRD v5](Hackathon/PRD_v5.md)** – Product requirements document

---

## License

MIT
