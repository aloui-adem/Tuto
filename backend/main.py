import json
import asyncio
import pyautogui
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from llm_planner import get_next_vision_step

pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.05

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/agent")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("🟢 HUD Client Connected")
    
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            
            goal = data.get("goal", "")
            print(f"📩 Starting autonomous goal loop: {goal}")

            is_done = False
            step_count = 0
            max_steps = 15  # Safety threshold to prevent infinite loops

            # --- AUTONOMOUS AGENT LOOP ---
            while not is_done and step_count < max_steps:
                # 1. Takes fresh MSS screenshot & queries vision model
                step = await get_next_vision_step(goal)
                
                # 2. Send action to React HUD
                await websocket.send_text(json.dumps(step))
                
                # 3. Check if completed
                if step.get("action") == "DONE":
                    is_done = True
                    break

                step_count += 1
                
                # 4. Wait for screen/UI to change before taking next screenshot
                await asyncio.sleep(1.5)

    except WebSocketDisconnect:
        print("🔴 HUD Client Disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
