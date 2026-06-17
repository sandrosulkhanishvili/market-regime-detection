# Market Regime Detection
### ფინანსური ბაზრების რეჟიმების ცვლილების გამოვლენა კლასტერიზაციის ალგორითმების გამოყენებით

Master's thesis application by **Sandro Sulkhanishvili**

A full-stack web application that detects financial market regimes in the S&P 500 using **K-Means clustering**, and explains the algorithm interactively through a built-in educational UI.

![Architecture](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-blue) ![Frontend](https://img.shields.io/badge/Frontend-Angular%2018-red) ![ML](https://img.shields.io/badge/ML-scikit--learn%20K--Means-orange)

---

## What it does

The app downloads 25+ years of S&P 500 daily price data and uses unsupervised machine learning to automatically label each trading day as one of three market regimes:

| Regime | Label | Avg Daily Return | Avg Volatility |
|--------|-------|-----------------|----------------|
| 🟢 | **Bull Market** | +1.69% | 1.90% |
| 🔵 | **Normal Market** | +0.10% | 0.77% |
| 🔴 | **Bear / Crisis** | -1.76% | 1.67% |

The chart line changes color in real time based on these labels — green for bull runs, red for crashes, blue for calm periods. A sidebar explains every step of the algorithm as it runs.

---

## Architecture

```
Magister project/
├── backend/              # Python / FastAPI
│   ├── pipeline.py       # Data pipeline: fetch → features → K-Means
│   ├── main.py           # REST API (FastAPI)
│   └── requirements.txt  # Python dependencies
├── frontend/             # Angular 18
│   └── src/app/
│       ├── models/       # RegimeDay interface, regime color config
│       ├── services/     # RegimeService (HttpClient wrapper)
│       └── components/
│           ├── regime-chart/      # Chart.js price chart colored by regime
│           └── education-panel/   # Sidebar explaining the algorithm
└── README.md
```

**Data flow:**

```
yfinance.download()
    → pandas: calculate daily_return + rolling volatility
    → StandardScaler: normalize features
    → KMeans(n_clusters=3): label each day 0 / 1 / 2
    → FastAPI GET /regimes: serve as JSON
    → Angular RegimeService: HttpClient.get<RegimeDay[]>()
    → Chart.js: render price line, colored per-segment by regime
    → EducationPanel: explain the current state to the user
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.10+ | Backend runtime |
| Node.js | 18+ | Angular dev server |
| Angular CLI | 17+ | `ng serve` |

---

## Setup & Running

You need **two terminals** open simultaneously — one for the backend, one for the frontend.

### Terminal 1 — Backend (Python / FastAPI)

```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment (first time only)
python -m venv venv

# Activate the virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload
```

The API will be available at **http://localhost:8000**

Useful endpoints:
- `GET /regimes` — full labeled dataset (6,600+ records)
- `GET /health` — summary stats
- `GET /docs` — auto-generated interactive API docs (FastAPI built-in)

> **First startup takes ~10 seconds** — the pipeline downloads S&P 500 data and runs K-Means before accepting requests.

---

### Terminal 2 — Frontend (Angular)

```bash
# Navigate to the frontend folder
cd frontend

# Install Node dependencies (first time only)
npm install

# Start the Angular dev server
ng serve
```

Open **http://localhost:4200** in your browser.

> The backend must be running at localhost:8000 before opening the frontend, otherwise the chart will show an error state.

---

## How the Algorithm Works

### 1. Feature Engineering
Two signals are calculated per trading day:
- **Daily Return** — percentage price change vs previous day: `(close_t - close_{t-1}) / close_{t-1}`
- **21-Day Rolling Volatility** — standard deviation of returns over the last month

### 2. Feature Scaling
`StandardScaler` normalizes both features to mean=0, std=1. This prevents the distance calculations in K-Means from being dominated by features with larger numeric ranges.

### 3. K-Means Clustering
K-Means places 3 centroids in the 2D feature space (return × volatility) and assigns each day to its nearest centroid. It iterates until assignments stabilize. The algorithm runs 10 times (`n_init=10`) and keeps the best result to avoid local minima.

### 4. Label Interpretation
The numeric cluster labels (0, 1, 2) are arbitrary — K-Means doesn't know what "bull" means. The regime names are derived by analyzing each cluster's average return and volatility after the fact.

---

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — async Python web framework
- [yfinance](https://github.com/ranaroussi/yfinance) — Yahoo Finance data downloader
- [pandas](https://pandas.pydata.org/) — data manipulation and feature engineering
- [scikit-learn](https://scikit-learn.org/) — `StandardScaler` + `KMeans`
- [uvicorn](https://www.uvicorn.org/) — ASGI server

**Frontend**
- [Angular 18](https://angular.io/) — standalone components, HttpClient
- [Chart.js](https://www.chartjs.org/) — canvas-based charting with per-segment coloring

---

## Windows-specific Notes

If `python` is not found in PowerShell after installing Python, add it to PATH manually:

```powershell
$p = "C:\Users\<YourName>\AppData\Local\Programs\Python\Python314"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$p;$p\Scripts", "User")
```

Then restart PowerShell.

If `Activate.ps1` is blocked by execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
