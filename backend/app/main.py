from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.vision import extract_players_from_screenshot

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
async def scan_screenshot(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = extract_players_from_screenshot(image_bytes)
    return {"raw": result}