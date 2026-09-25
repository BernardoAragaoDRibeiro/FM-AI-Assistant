import os
from groq import Groq
from dotenv import load_dotenv
from app import storage

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

ANALYSIS_MODEL = os.getenv("ANALYSIS_MODEL", "qwen/qwen3.8-27b")

SYSTEM_PROMPT = """You are a technical director assistant for a Football Manager save.

Your role is to help the manager make informed decisions about transfers, squad building and tactics.

You must:
- Analyze context before recommending
- Disagree when the data justifies it
- Justify your conclusions with specific data points
- Consider alternatives
- Distinguish facts from inferences
- Avoid conclusions based on a single attribute
- Consider squad depth and balance
- Consider financial aspects (wage budget, transfer value)
- Consider age and development potential
- Consider tactical fit

When recommending a transfer, always analyze:
1. Quality (current ability vs squad average)
2. Tactical fit (positions and attributes for the role)
3. Need (squad depth at that position)
4. Age and potential
5. Financial cost (wage and transfer value)
6. Squad impact

When you are uncertain due to incomplete scouting data (intervals or missing attributes), say so explicitly.
Never invent data. If something is unknown, treat it as unknown.

Respond in the same language the user writes in."""


def build_context(question: str) -> str:
    squad = storage.get_squad()
    targets = storage.get_targets()
    tactic = storage.get_tactic()

    parts = []

    if tactic.get("formation") or tactic.get("in_possession") or tactic.get("out_of_possession"):
        parts.append("## Tactical Setup")
        if tactic.get("formation"):
            parts.append(f"Formation: {tactic['formation']}")
        if tactic.get("in_possession"):
            parts.append(f"In possession: {tactic['in_possession']}")
        if tactic.get("out_of_possession"):
            parts.append(f"Out of possession: {tactic['out_of_possession']}")
        if tactic.get("notes"):
            parts.append(f"Notes: {tactic['notes']}")

    if squad.get("players"):
        parts.append("\n## Current Squad")
        for p in squad["players"]:
            line = f"- {p['name']}, {p.get('age', '?')}y, {', '.join(p.get('positions', []))}"
            if p.get("current_ability"):
                line += f", CA: {p['current_ability']}★"
            if p.get("potential_ability"):
                line += f", PA: {p['potential_ability']}★"
            parts.append(line)

    if targets.get("players"):
        parts.append("\n## Transfer Targets")
        for p in targets["players"]:
            line = f"- {p['name']}, {p.get('age', '?')}y, {', '.join(p.get('positions', []))}"
            if p.get("current_ability"):
                line += f", CA: {p['current_ability']}★"
            if p.get("potential_ability"):
                line += f", PA: {p['potential_ability']}★"
            if p.get("contract", {}).get("wage"):
                line += f", Wage: {p['contract']['wage']}"
            if p.get("contract", {}).get("value"):
                line += f", Value: {p['contract']['value']}"
            parts.append(line)

    parts.append(f"\n## Question\n{question}")

    return "\n".join(parts)


def analyze(question: str) -> str:
    context = build_context(question)

    response = client.chat.completions.create(
        model=ANALYSIS_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": context},
        ],
        max_tokens=1000,
    )

    return response.choices[0].message.content