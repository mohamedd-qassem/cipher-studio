# Cipher Studio

An interactive web application for exploring classical cryptography through encryption, decryption, and step-by-step algorithm visualization.

Built with Python Flask (backend) and vanilla HTML/CSS/JavaScript (frontend). Designed as an educational tool for university-level cryptography study.

## Features

- Encrypt and decrypt text using classical cipher algorithms
- Step-by-step visualization showing exactly how each algorithm transforms data
- Per-character breakdown with indices, binary representations, and rail matrix views
- Responsive dark-themed UI with real-time feedback
- Client-side validation with descriptive error messages
- Copy result, load random examples, and reset functionality

## Supported Algorithms

### Caesar Cipher
- Shifts each letter by a fixed number of positions in the alphabet
- Visualization: per-character shift mapping with original and shifted alphabet display

### XOR Cipher
- Combines each character with a key using the bitwise XOR operation
- Symmetric — encryption and decryption use the same process
- Visualization: character, ASCII, binary, key binary, XOR binary, and result

### Rail Fence Cipher
- Writes the message in a zigzag pattern across multiple rows (rails), then reads row by row
- Visualization: rail matrix grid with color-coded rails and position tracking table

## Project Structure

```
cipher-studio/
├── app.py                  # Flask application — routes and API
├── requirements.txt        # Python dependencies
├── README.md               # This file
├── ciphers/
│   ├── __init__.py
│   ├── caesar.py           # Caesar cipher implementation
│   ├── xor_cipher.py       # XOR cipher implementation
│   └── rail_fence.py       # Rail Fence cipher implementation
├── static/
│   ├── style.css           # All styling (dark theme, responsive)
│   └── script.js           # Frontend logic and visualization rendering
└── templates/
    └── index.html          # Single-page application layout
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. Clone or download the project:

```bash
git clone <repository-url>
cd cipher-studio
```

2. Create and activate a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate      # Linux / macOS
# venv\Scripts\activate       # Windows
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Run Locally

```bash
python app.py
```

Open your browser to [http://127.0.0.1:5000](http://127.0.0.1:5000)

## Deploy on Render (Free)

This project is configured for one-click deployment on Render's free tier.

### Option A — Deploy via Render Dashboard

1. Push the project to a GitHub repository.
2. Log in to [Render](https://render.com) and click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Render auto-detects the settings from the `Procfile` and `requirements.txt`.
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Choose the **Free** plan.
6. Click **Create Web Service**.

Render will build and deploy. Your app will be live at `https://<your-service>.onrender.com`.

### Option B — Deploy via Render Blueprint (render.yaml)

Create a `render.yaml` file in the repo root:

```yaml
services:
  - type: web
    name: cipher-studio
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app --bind 0.0.0.0:$PORT
    plan: free
```

Then connect your repo to Render and select **Blueprint** deployment.

### Notes for Free Tier

- The service spins down after 15 minutes of inactivity — first request after idle will take a few seconds.
- No custom domain on the free plan (use `*.onrender.com`).
- Static files are served directly by Flask (sufficient for the free tier).

## API

### POST /api/process

Process text through a cipher algorithm.

**Request:**
```json
{
  "text": "HELLO",
  "algorithm": "caesar",
  "operation": "encrypt",
  "key": "3"
}
```

**Response:**
```json
{
  "success": true,
  "algorithm": "Caesar Cipher",
  "operation": "encrypt",
  "input_text": "HELLO",
  "result_text": "KHOOR",
  "key": 3,
  "steps": { ... }
}
```

## Future Improvements

- Add more ciphers (Vigenere, Playfair, Atbash, Substitution)
- Add file upload/download for encrypting files
- Add histogram or frequency analysis visualization
- Add comparison mode (run multiple algorithms side by side)
- Add key generation suggestions
- Add dark/light theme toggle
- Add export results as PDF or text file
- Add unit tests for all cipher implementations
- Add Docker support for easy deployment

