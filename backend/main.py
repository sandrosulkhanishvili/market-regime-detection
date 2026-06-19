from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pipeline import run_pipeline

# FastAPI() is like calling new express() or bootstrapApplication() —
# it creates the application instance.
app = FastAPI(title="Market Regime Detection API")

# CORS middleware — same concept as in Angular's proxy.conf.json or an
# Express cors() middleware. Without this, your Angular dev server
# (localhost:4200) would be blocked from calling this API (localhost:8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# Run the pipeline ONCE at startup and cache the result in memory.
# This is like APP_INITIALIZER in Angular — expensive work done once,
# result stored in a module-level variable (equivalent to a singleton service).
print("Running pipeline at startup...")
cached_data = run_pipeline()
print("API is ready.")


# ── ENDPOINT ──────────────────────────────────────────────────────────────────
# @app.get("/regimes") is a decorator — like @Component() or @Injectable() in Angular.
# It tells FastAPI: "when a GET request arrives at /regimes, call this function."
@app.get("/regimes")
def get_regimes():
    """
    Returns all labeled trading days as a JSON array.

    Response shape (each item):
    {
        "date": "2008-09-15",
        "close": 1192.70,
        "daily_return": -0.0475,
        "volatility_21d": 0.0312,
        "regime": 2
    }
    """
    # .to_dict("records") converts the DataFrame to a list of dicts —
    # exactly like calling .map(row => ({ ...row })) on a typed array.
    # FastAPI automatically serializes this list to JSON.
    return cached_data.to_dict("records")


# ── REGIME STATS ──────────────────────────────────────────────────────────────
@app.get("/regime-stats")
def get_regime_stats():
    """
    Returns per-regime averages computed from real data.
    Response shape: { "0": { "avg_return": 0.0168, "avg_volatility": 0.019 }, ... }

    .groupby("regime").mean() is like SQL GROUP BY + AVG — it collapses all rows
    for each regime into a single summary row.
    """
    stats = (
        cached_data
        .groupby("regime")[["daily_return", "volatility_21d"]]
        .mean()
        .round(6)
    )
    result = {}
    for regime, row in stats.iterrows():
        result[str(regime)] = {
            "avg_return": row["daily_return"],
            "avg_volatility": row["volatility_21d"],
        }
    return result


# ── HEALTH CHECK ──────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "total_days": len(cached_data),
        "regimes": cached_data["regime"].value_counts().to_dict(),
    }
