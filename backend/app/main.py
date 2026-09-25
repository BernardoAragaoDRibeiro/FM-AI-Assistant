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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/scan")
async def scan_screenshot(file: UploadFile = File(...), target: bool = False):
    image_bytes = await file.read()
    raw = extract_players_from_screenshot(image_bytes)

    try:
        clean = raw.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(clean)
    except Exception:
        raise HTTPException(status_code=422, detail="Could not parse player data from screenshot")

    for player in data.get("players", []):
        storage.add_player(player, target=target)

    return {"saved": len(data.get("players", [])), "players": data.get("players", [])}


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