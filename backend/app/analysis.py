import os
from litellm import completion
from dotenv import load_dotenv
from app import storage

load_dotenv()

ANALYSIS_MODEL = os.getenv("ANALYSIS_MODEL", "groq/qwen/qwen3.8-27b")
ANALYSIS_API_KEY = os.getenv("ANALYSIS_API_KEY") or os.getenv("GROQ_API_KEY")

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
4. Financial cost (wage and transfer value)
5. Squad impact

When you are uncertain due to incomplete scouting data (intervals or missing attributes), say so explicitly.
Never invent data. If something is unknown, treat it as unknown.

Structure your responses as:
- Brief assessment (2-3 sentences max per player)
- Clear verdict: SIGN / DO NOT SIGN / MONITOR
- One paragraph reasoning

Keep responses concise. Never use more than 3 bullet points per section.
Always end with a complete sentence — never stop mid-thought.

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
            parts.append(_format_player(p))

    if targets.get("players"):
        parts.append("\n## Transfer Targets")
        for p in targets["players"]:
            parts.append(_format_player(p, include_financials=True))

    parts.append(f"\n## Question\n{question}")

    return "\n".join(parts)


def _format_player(p: dict, include_financials: bool = False) -> str:
    lines = []
    header = f"### {p.get('name', 'Unknown')} ({p.get('age', '?')}y, {p.get('nationality', '?')})"
    lines.append(header)
    lines.append(f"Positions: {', '.join(p.get('positions', []))}")
    lines.append(f"CA: {p.get('current_ability', '?')}★ | PA: {p.get('potential_ability', '?')}★")
    lines.append(f"Personality: {p.get('personality', '?')}")
    lines.append(f"Foot — Right: {p.get('foot', {}).get('right', '?')} | Left: {p.get('foot', {}).get('left', '?')}")

    if p.get('traits'):
        lines.append(f"Traits: {', '.join(p['traits'])}")

    if include_financials and p.get('contract'):
        c = p['contract']
        lines.append(f"Wage: {c.get('wage', '?')} | Value: {c.get('value', '?')} | Contract until: {c.get('expires', '?')}")

    attrs = {}
    for group in ['technical', 'mental', 'physical', 'goalkeeping']:
        if p.get(group):
            for k, v in p[group].items():
                if v and v != 0:
                    attrs[k] = v

    if attrs:
        attr_str = " | ".join(f"{k.replace('_', ' ')}: {v}" for k, v in attrs.items())
        lines.append(f"Attributes: {attr_str}")

    return "\n".join(lines)


def analyze(question: str) -> str:
    config = storage.get_config()
    model = config.get("analysis_model", "groq/qwen/qwen3.8-27b")
    api_key = config.get("analysis_api_key") or None
    max_tokens = int(config.get("analysis_max_tokens", 1000))

    context = build_context(question)

    response = completion(
        model=model,
        api_key=api_key,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": context},
        ],
        max_tokens=max_tokens,
    )

    return response.choices[0].message.content