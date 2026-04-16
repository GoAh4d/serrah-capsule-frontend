# Serrah Capsule Frontend

React + Vite frontend for the Serrah Capsule Layer.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── api/
│   └── capsule.js        # All Capsule Layer API calls
├── components/
│   ├── Header.jsx         # Top navigation
│   ├── Sidebar.jsx        # Job history sidebar
│   └── UI.jsx             # Shared components (EnvPill, StageSteps, Card, etc.)
├── hooks/
│   └── useJob.js          # SSE stream + polling logic
├── views/
│   ├── SignIn.jsx         # Access code gate
│   ├── Upload.jsx         # Stage 1 — file upload
│   ├── Validation.jsx     # Stage 2 — validation polling
│   ├── Execute.jsx        # Stage 3 — SSE execution
│   └── Completion.jsx     # Stage 4 — final result
├── styles/
│   └── variables.css      # CSS custom properties
├── App.jsx                # Root component + routing
└── main.jsx               # Entry point
```

## API

Base URL is configured in `src/api/capsule.js`. Change `BASE` to point to a different environment.
