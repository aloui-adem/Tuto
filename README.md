# Agent Desktop UI

An Electron and React desktop interface for a vision-enabled local agent. The React UI sends goals over WebSocket to a FastAPI backend, which captures the screen and asks a local OpenAI-compatible vision model for the next action.

## Requirements

- Node.js 18+
- Python 3.10+
- A local OpenAI-compatible vision server, such as Ollama
- Windows desktop for the current screen-control implementation

## Setup

Install JavaScript and Python dependencies:

```powershell
npm install
python -m pip install -r backend/requirements.txt
```

Copy the example environment file and adjust it if needed:

```powershell
Copy-Item backend/.env.example backend/.env
```

Available settings:

- `LOCAL_LLM_URL`: OpenAI-compatible server URL (default: `http://localhost:11434/v1`)
- `VISION_MODEL_NAME`: vision model name (default: `llava`)
- `OPENAI_API_KEY`: only needed for servers that require authentication

Start the backend and desktop UI in separate terminals:

```powershell
python backend/main.py
npm run dev
```

## Build

```powershell
npm run lint
npx tsc --noEmit
npm run build
python -m compileall -q backend
```

## Safety

This project can inspect the desktop and issue agent actions. Keep the backend on loopback, review goals before running them, and never commit `backend/.env` or other secrets. Do not expose the WebSocket server to untrusted networks.

## Stack

- Electron and Vite
- React
- FastAPI and WebSocket
- OpenAI-compatible vision model
- PyAutoGUI, mss, and Pillow
