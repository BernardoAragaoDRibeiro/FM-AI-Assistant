import json
from pathlib import Path
from datetime import datetime

DATA_DIR = Path(__file__).parent.parent / "data"

CONFIG_DEFAULTS = {
    "vision_model": "groq/qwen/qwen3.8-27b",
    "vision_api_key": "",
    "analysis_model": "groq/qwen/qwen3.8-27b",
    "analysis_api_key": "",
}


def get_config() -> dict:
    path = DATA_DIR / "config.json"
    if not path.exists():
        return CONFIG_DEFAULTS.copy()
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
        return {**CONFIG_DEFAULTS, **data}
    except Exception:
        return CONFIG_DEFAULTS.copy()


def save_config(config: dict) -> None:
    _write("config.json", {k: v for k, v in config.items() if k in CONFIG_DEFAULTS})


def _read(filename: str) -> dict:
    path = DATA_DIR / filename
    with open(path, "r", encoding="utf-8-sig") as f:
        return json.load(f)


def _write(filename: str, data: dict) -> None:
    path = DATA_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def get_squad() -> dict:
    return _read("squad.json")


def get_targets() -> dict:
    return _read("targets.json")


def get_tactic() -> dict:
    return _read("tactic.json")


def add_player(player_data: dict, target: bool = False) -> None:
    player_data["scanned_at"] = datetime.now().isoformat()
    filename = "targets.json" if target else "squad.json"
    data = _read(filename)
    data["players"] = [p for p in data["players"] if p["name"] != player_data["name"]]
    data["players"].append(player_data)
    _write(filename, data)


def save_tactic(tactic_data: dict) -> None:
    _write("tactic.json", tactic_data)


def clear_squad() -> None:
    _write("squad.json", {"players": []})


def clear_targets() -> None:
    _write("targets.json", {"players": []})