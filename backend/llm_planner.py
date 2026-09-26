import os
import io
import json
import base64
import pyautogui
import mss
from PIL import Image
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

LOCAL_LLM_URL = os.getenv("LOCAL_LLM_URL", "http://localhost:11434/v1")
VISION_MODEL_NAME = os.getenv("VISION_MODEL_NAME", "llava")

client = AsyncOpenAI(
    base_url=LOCAL_LLM_URL,
    api_key="ollama"
)

def capture_screen_base64():
    """Captures the current state of the main display in RAM."""
    with mss.mss() as sct:
        monitor = sct.monitors[1]
        sct_img = sct.grab(monitor)
        img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")
        
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG", quality=80)
        
        base64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return base64_str, monitor["width"], monitor["height"]

async def get_next_vision_step(goal: str) -> dict:
    """Evaluates current screen and returns the single next action."""
    screen_w, screen_h = pyautogui.size()
    
    try:
        # Takes a FRESH screenshot on every loop iteration
        base64_img, screen_w, screen_h = capture_screen_base64()

        prompt = f"""
Analyze this screenshot for a virtual computer assistant.
Goal: {goal}

Find the most relevant UI element for the next step.

Return ONLY JSON:
{{
  "target": "name of element",
  "x": 0.0,
  "y": 0.0,
  "confidence": 0.0,
  "is_done": false
}}

x and y must be normalized coordinates from 0.0 to 1.0 relative to the full screenshot.
Set "is_done" to true ONLY if the user goal is fully accomplished on screen.
Do not describe the screen or explain reasoning.
"""

        response = await client.chat.completions.create(
            model=VISION_MODEL_NAME,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"}
                        }
                    ]
                }
            ],
            temperature=0.1,
        )

        content = response.choices[0].message.content.strip()

        if "```" in content:
            content = content.split("```")[1].replace("json", "").strip()

        data = json.loads(content)

        if data.get("is_done"):
            return {"action": "DONE", "text": "Goal accomplished!"}

        pixel_x = int(data.get("x", 0.5) * screen_w)
        pixel_y = int(data.get("y", 0.5) * screen_h)

        return {
            "action": "CLICK",
            "x": pixel_x,
            "y": pixel_y,
            "text": f"Clicking {data.get('target', 'UI element')}"
        }

    except Exception as e:
        print(f"⚠️ Local LLM/Vision Offline ({e}). Returning fallback step...")
        return {
            "action": "CLICK",
            "x": int(screen_w * 0.5),
            "y": int(screen_h * 0.5),
            "text": f"Analyzing screen for goal: '{goal}'"
        }