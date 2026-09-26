import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.vision import extract_players_from_screenshot
from app import storage
from app.analysis import analyze

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/config")
def get_config():
    config = storage.get_config()
    # nunca retorna as chaves completas, só se estão preenchidas
    safe = {**config}
    for key in ["vision_api_key", "analysis_api_key"]:
        safe[key] = "***" if config.get(key) else ""
    return safe


@app.post("/config")
def save_config(body: dict):
    current = storage.get_config()
    # preserva chaves existentes se vier "***" (não foi alterada)
    for key in ["vision_api_key", "analysis_api_key"]:
        if body.get(key) == "***" or body.get(key) is None:
            body[key] = current.get(key, "")
    storage.save_config(body)
    return {"status": "saved"}

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/scan")
async def scan_screenshot(file: UploadFile = File(...)):
    image_bytes = await file.read()
    raw = extract_players_from_screenshot(image_bytes)

    try:
        clean = raw.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(clean)
    except Exception:
        raise HTTPException(status_code=422, detail="Could not parse player data from screenshot")

    players = data.get("players", [])
    return {"players": players}


@app.get("/squad")
def get_squad():
    return storage.get_squad()


@app.delete("/squad")
def clear_squad():
    storage.clear_squad()
    return {"status": "cleared"}


@app.get("/targets")
def get_targets():
    return storage.get_targets()


@app.delete("/targets")
def clear_targets():
    storage.clear_targets()
    return {"status": "cleared"}


@app.get("/tactic")
def get_tactic():
    return storage.get_tactic()


@app.post("/tactic")
def save_tactic(tactic: dict):
    storage.save_tactic(tactic)
    return {"status": "saved"}

@app.post("/analyze")
async def analyze_endpoint(body: dict):
    question = body.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")
    result = analyze(question)
    return {"answer": result}

@app.post("/squad/player")
def save_player(body: dict):
    player = body.get("player")
    target = body.get("target", False)
    if not player:
        raise HTTPException(status_code=400, detail="Player data is required")
    storage.add_player(player, target=target)
    return {"status": "saved"}