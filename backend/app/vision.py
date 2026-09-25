import base64
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

VISION_MODEL = os.getenv("VISION_MODEL", "qwen/qwen3.8-27b")

PLAYER_SCHEMA = '''
{
  "players": [
    {
      "name": "",
      "age": 0,
      "nationality": "",
      "positions": [],
      "foot": { "right": "", "left": "" },
      "height": "",
      "personality": "",
      "traits": [],
      "current_ability": 0,
      "potential_ability": 0,
      "contract": { "wage": "", "expires": "", "value": "" },
      "mental": {
        "aggression": 0, "anticipation": 0, "bravery": 0,
        "composure": 0, "concentration": 0, "decisions": 0,
        "determination": 0, "flair": 0, "leadership": 0,
        "off_the_ball": 0, "positioning": 0, "teamwork": 0,
        "vision": 0, "work_rate": 0
      },
      "physical": {
        "acceleration": 0, "agility": 0, "balance": 0,
        "jumping_reach": 0, "natural_fitness": 0,
        "pace": 0, "stamina": 0, "strength": 0
      },
      "set_pieces": {
        "corners": 0, "free_kick": 0,
        "long_throws": 0, "penalty": 0
      },
      "technical": {
        "crossing": 0, "dribbling": 0, "finishing": 0,
        "first_touch": 0, "heading": 0, "long_shots": 0,
        "marking": 0, "passing": 0, "tackling": 0, "technique": 0
      },
      "goalkeeping": {
        "aerial_reach": 0, "command_of_area": 0, "communication": 0,
        "eccentricity": 0, "handling": 0, "one_on_ones": 0,
        "kicking": 0, "punching": 0, "reflexes": 0,
        "rushing_out": 0, "throwing": 0
      },
      "is_goalkeeper": false,
      "analysis_mode": "attributes"
    }
  ]
}
'''

PROMPT = f"""This is a Football Manager screenshot showing one or more players.

Extract all visible player data and return it as JSON following this exact schema:
{PLAYER_SCHEMA}

Rules:
- Return ONLY the JSON, no extra text, no markdown, no backticks.
- For outfield players, set "is_goalkeeper" to false and leave "goalkeeping" fields as 0.
- For goalkeepers, set "is_goalkeeper" to true, set "analysis_mode" to "goalkeeper", and leave "technical" fields as 0.
- For "foot", use values: "Very Strong", "Strong", "Reasonable", "Weak", "Very Weak", or "" if not visible.
- For "current_ability" and "potential_ability", use 0.5 increments (e.g. 4.5 stars = 4.5). Gold stars indicate higher tier than silver stars at the same count.
- For "traits", return a list of strings. Empty list if none visible.
- For "personality", return the personality label as string. Empty string if not visible.
- For "positions", return the player's positions as they appear in text on screen (e.g. "Defender (Right)", "Midfielder (Centre)", "Striker"). Do NOT list roles or duties — only the positional labels.
- For "contract.wage", extract the weekly wage (look for "p/w" or "per week" label). Preserve decimals exactly as shown (e.g. "€5.5K p/w", not "€55K p/w").
- For "contract.value", extract the market value range (e.g. "€475K - €1M"). This is different from the wage.
- For all monetary values, preserve decimal points exactly as shown. "5.5k" must never become "55k".
- If a field is not visible in the screenshot, use 0 for numbers, "" for strings, and [] for lists.
- Do not invent data. Only extract what is visible.
- For "nationality", always use the full country name in English (e.g. "Spain", not "ESP" or "España").
- For "traits", only include traits whose full text is visible on screen. If you see "+N more" or any truncated indicator, do NOT guess the hidden traits — only list what is fully readable.
- For "current_ability" and "potential_ability", only use values you can clearly distinguish visually. If uncertain between two values (e.g. 3 vs 3.5 stars), prefer the lower value.
- For "contract.wage", only extract the value explicitly labeled as wage or salary (p/w, per week, p/a). If not visible or labeled "not for sale", use "".
- For "contract.value", only extract the market value range. If the player is "not for sale" or no value range is shown, use "not for sale" or "".
- For "contract.expires", the date always includes day/month/year (e.g. "30/06/2043"). Extract the full date as shown. Never use the day or month numbers as part of salary or other financial fields.
- For "current_ability" and "potential_ability", if the stars are not visible (e.g. player not fully scouted), use null instead of 0 or any other value.
- For "positions", only include positions whose full text is visible on screen. Do NOT guess or complete truncated position names.
- For "contract.wage" and "contract.value", if the value shown is "Unknown", use "unknown". Never invent or estimate financial values.
- For any numeric attribute, if the value shown is a range (e.g. "12-16"), store it as a string exactly as shown (e.g. "12-16"). If the value is a dash ("-") or empty, use null. Never invent or estimate attribute values.
- Attribute values range from 1 to 20 in Football Manager. Use integers for known values, strings for ranges (e.g. "12-16"), and 0 for any attribute that is not visible, is a dash ("-"), or has no data. Never invent or estimate attribute values.
- For "current_ability" and "potential_ability", use null if not visible or scouting is incomplete.
- In the top-right area of the screen, the layout is always: first line is transfer value (or "Not for Sale" or "Unknown"), second line is "€[wage] p/w [contract end date]". Never confuse these two lines. The wage always has "p/w" after it. The contract date is always at the end of the second line in format DD/MM/YYYY.
"""


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
                        "text": PROMPT,
                    },
                ],
            }
        ],
        max_tokens=800,
    )

    return response.choices[0].message.content