# FM Assistant

AI-powered Football Manager assistant.

## Setup

### Backend

1. Create a virtual environment and install dependencies:
```bash
   cd backend
   python3 -m venv venv
   source venv/Scripts/activate  # Windows
   python3 -m pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and fill in your API keys:
```bash
   cp backend/.env.example backend/.env
```

3. Run the server:
```bash
   python3 -m uvicorn app.main:app --reload
```