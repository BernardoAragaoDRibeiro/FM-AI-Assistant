import base64
import os
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

VISION_MODEL = os.getenv("VISION_MODEL", "groq/qwen/qwen3.8-27b")
VISION_API_KEY = os.getenv("VISION_API_KEY") or os.getenv("GROQ_API_KEY")

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
      "current_ability": null,
      "potential_ability": null,
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

TRAITS_LIST = "Gets Forward Whenever Possible, Stays Back At All Times, Comes Deep To Get Ball, Dribbles Down Left Flank, Dribbles Down Right Flank, Dribbles Through Center, Runs With Ball More Often, Runs With Ball Rarely, Hugs Touchline, Cuts Inside From Left, Cuts Inside From Right, Cuts Inside From Both Wings, Gets Into Opposition Area, Arrives Late In Opposition Area, Tries To Beat Offside Trap, Plays With Back To Goal, Does Not Move Into Channels, Moves Into Channels, Plays One-Twos, Tries Killer Balls Often, Plays No Through Balls, Tries Long Range Passes, Plays Short Simple Passes, Stops Play, Dwells On Ball, Looks For Pass Rather Than Shooting, Dictates Tempo, Likes To Switch Ball To Other Flank, Likes Ball Played Into Feet, Shoots From Distance, Refrains From Taking Long Shots, Tries To Lob Keeper, Likes To Round Keeper, Shoots With Power, Places Shots, Attempts First Time Shots, Attempts Overhead Kicks, Hits Free Kicks With Power, Tries Long Range Free Kicks, Dives Into Tackles, Does Not Dive Into Tackles, Marks Opponents Tightly, Brings Ball Out Of Defence, Tries To Play Way Out Of Trouble, Tries Tricks, Curls Balls, Uses Outside Of Foot, Likes To Beat Man Repeatedly, Avoids Using Weaker Foot, Develops Weaker Foot, Possesses Long Flat Throw, Uses Long Throws To Start Counter Attacks, Gets Crowd Going, Argues With Officials, Winds Up Opponents"

PROMPT = f"""This is a Football Manager screenshot showing one or more players.

Extract all visible player data and return it as JSON following this exact schema:
{PLAYER_SCHEMA}

Rules:
- Return ONLY the JSON, no extra text, no markdown, no backticks.
- For outfield players, set "is_goalkeeper" to false and leave "goalkeeping" fields as 0.
- For goalkeepers, set "is_goalkeeper" to true, set "analysis_mode" to "goalkeeper", and leave "technical" fields as 0.
- For "foot", use values: "Very Strong", "Strong", "Reasonable", "Weak", "Very Weak", or "" if not visible.
- For "current_ability" and "potential_ability", use 0.5 increments (e.g. 4.5 stars = 4.5). Gold stars indicate higher tier than silver stars at the same count. If not visible, use null.
- For "traits", only include traits from this exact list: {TRAITS_LIST}. Do not invent trait names. If a trait is visible but not in this list, ignore it.
- For "personality", return the personality label as string. Empty string if not visible or "Scouting Required".
- For "positions", only include positions whose full text is visible on screen. Do NOT guess or complete truncated position names.
- In the top-right area of the screen, the layout is always: first line is transfer value (or "Not for Sale" or "Unknown"), second line is "€[wage] p/w [contract end date]". Never confuse these two lines. The wage always has "p/w" after it. The contract date is always at the end of the second line in format DD/MM/YYYY.
- For "contract.wage", only extract the value explicitly labeled with p/w. Preserve decimals exactly (e.g. "€5.75K p/w"). If unknown, use "unknown".
- For "contract.value", only extract the market value. If "Not for Sale" or unknown, use that string.
- For "contract.expires", extract the full date DD/MM/YYYY. Never use date numbers as salary.
- For attribute values: use integers for known values (1-20), strings for ranges (e.g. "12-16"), 0 for missing/dash. Never invent values.
- For "nationality", always use the full country name in English.
- If a field is not visible, use 0 for numbers, "" for strings, [] for lists, null for ability fields.
- Do not invent data. Only extract what is visible.
- For all monetary values, preserve decimal points exactly as shown (e.g. "5.75k" must never become "575k").
- For "contract.wage" and "contract.value", if the value shown is "Unknown", use "unknown".
"""


def extract_players_from_screenshot(image_bytes: bytes) -> str:
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    response = completion(
        model=VISION_MODEL,
        api_key=VISION_API_KEY,
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