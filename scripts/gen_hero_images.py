"""Generate 3 hero images for Routine 360° type cards using Nano Banana."""
import asyncio
import base64
import os
import sys
from pathlib import Path

sys.path.insert(0, "/app/backend")
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")

from emergentintegrations.llm.chat import LlmChat, UserMessage

KEY = os.environ["EMERGENT_LLM_KEY"]
OUT = Path("/app/frontend/public/types")
OUT.mkdir(parents=True, exist_ok=True)

PROMPTS = {
    "visage": (
        "Editorial beauty photograph of 4 diverse women side by side: a Black woman, a Latina woman, "
        "an Asian woman and a white woman, close-up face portraits at the same height, soft natural studio "
        "lighting on a creamy beige background. All have clear glowing natural skin, minimal makeup. "
        "Premium magazine quality, sharp focus, no text, no logos."
    ),
    "corps": (
        "Editorial body-positive photograph of 4 diverse women standing side by side, wearing simple nude "
        "beige underwear, showing different body types and skin tones (Black, Latina, Asian, white). "
        "Soft studio lighting on a creamy beige background. Confident relaxed smiles. "
        "Premium magazine quality, sharp focus, no text, no logos."
    ),
    "cheveux": (
        "Editorial portrait of 4 diverse women side by side showcasing different hair types: 4c afro hair, "
        "curly hair, straight Asian black hair, wavy blonde hair. Half-body shot, close together, soft "
        "studio lighting on a creamy beige background. Premium magazine quality, sharp focus, no text, no logos."
    ),
}


async def gen(label, prompt):
    chat = LlmChat(
        api_key=KEY,
        session_id=f"bv-hero-{label}",
        system_message="You are a top fashion photographer producing editorial beauty imagery.",
    ).with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
    msg = UserMessage(text=prompt)
    _text, images = await chat.send_message_multimodal_response(msg)
    if not images:
        print(f"❌ no image for {label}")
        return
    img_b64 = images[0]["data"]
    out_path = OUT / f"{label}.jpg"
    out_path.write_bytes(base64.b64decode(img_b64))
    print(f"✅ {label} → {out_path} ({out_path.stat().st_size // 1024} KB)")


async def main():
    for label, prompt in PROMPTS.items():
        try:
            await gen(label, prompt)
        except Exception as e:
            print(f"❌ {label}: {e}")


asyncio.run(main())
