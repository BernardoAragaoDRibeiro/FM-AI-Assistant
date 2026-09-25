import base64
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

VISION_MODEL = os.getenv("VISION_MODEL", "meta-llama/llama-4-maverick-17b-128e-instruct")


def extract_players_from_screenshot(image_bytes: bytes) -> str:
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    response = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_b64}",
                        },
                    },
                    {
                        "type": "text",
                        "text": (
                            "This is a Football Manager screenshot. "
                            "Extract all visible player data and return it as JSON. "
                            "Return ONLY the JSON, no extra text, no markdown, no backticks. "
                            "Expected format: {\"players\": [{\"name\": \"\", \"age\": 0, \"position\": \"\", "
                            "\"attributes\": {}}]}"
                        ),
                    },
                ],
            }
        ],
        max_tokens=2000,
    )

    return response.choices[0].message.content