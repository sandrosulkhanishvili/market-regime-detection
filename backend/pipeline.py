import yfinance as yf
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans


def run_pipeline() -> pd.DataFrame:
    """
    Downloads S&P 500 data, engineers features, and labels each day
    with a market regime (0, 1, or 2) via K-Means clustering.

    Think of this function like an Angular resolver:
    it does all the heavy lifting BEFORE the component renders.
    """

    # ── 1. FETCH ──────────────────────────────────────────────────────────────
    # yf.download() is like HttpClient.get() — it returns structured data.
    # "^GSPC" is the Yahoo Finance ticker symbol for the S&P 500 index.
    print("Downloading S&P 500 data...")
    raw = yf.download("^GSPC", start="2000-01-01", auto_adjust=True)

    # raw is a DataFrame. raw["Close"] is a single column — like plucking
    # one key from every object in an array: data.map(d => d.close)
    df = pd.DataFrame()
    df["close"] = raw["Close"].squeeze()  # .squeeze() flattens a 1-column table to a plain list


    # ── 2. FEATURE ENGINEERING ────────────────────────────────────────────────
    # This is your .pipe(map(...)) chain. We're deriving new columns from existing ones.

    # Daily return: how much % did the price move today vs yesterday?
    # In TS: data.map((d, i) => i === 0 ? null : (d.close - data[i-1].close) / data[i-1].close)
    # pandas does this in one line with .pct_change()
    df["daily_return"] = df["close"].pct_change()

    # Rolling 21-day volatility: the standard deviation of returns over the last ~1 month.
    # This is the KEY signal for regime detection.
    #   - High volatility  → turbulent/crisis market
    #   - Low volatility   → calm/trending market
    # In TS this would be a custom pipe that buffers the last 21 values and computes std dev.
    # pandas: .rolling(window=21).std()
    df["volatility_21d"] = df["daily_return"].rolling(window=21).std()

    # Drop any rows with NaN (like filtering out nulls after your first .pct_change())
    # NaN appears in the first ~21 rows before the rolling window has enough data.
    df.dropna(inplace=True)


    # ── 3. FEATURE SCALING ────────────────────────────────────────────────────
    # K-Means uses DISTANCE to group points. If one feature is in range [0, 0.05]
    # and another is in [0, 50000], the large one dominates all distance calculations.
    # StandardScaler normalizes both to mean=0, std=1.
    features = df[["daily_return", "volatility_21d"]]
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)


    # ── 4. K-MEANS CLUSTERING (THE ML STEP) ───────────────────────────────────
    # Think of KMeans like a service you inject and call in two phases:
    #
    #   Phase 1 — .fit(data):     The algorithm LEARNS from the data.
    #             It finds 3 "cluster centers" (centroids) that best represent
    #             the natural groupings. Like training a model at startup.
    #
    #   Phase 2 — .predict(data): Each data point gets a label (0, 1, or 2)
    #             based on which centroid it's closest to.
    #
    #   .fit_predict() does both in one call.
    #
    # n_clusters=3   → we want exactly 3 regimes
    # random_state=42 → fixes random seed for reproducibility
    # n_init=10       → runs 10 times with different starting points, picks the best

    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    df["regime"] = kmeans.fit_predict(scaled_features)


    # ── 5. CLEAN UP FOR OUTPUT ────────────────────────────────────────────────
    df = df.reset_index()           # makes "Date" a regular column instead of the row index
    df["date"] = df["Date"].dt.strftime("%Y-%m-%d")  # format as ISO string, like .toISOString()
    df = df[["date", "close", "daily_return", "volatility_21d", "regime"]]

    print(f"Pipeline complete. {len(df)} trading days labeled across 3 regimes.")
    print("\nDays per regime:")
    print(df["regime"].value_counts())
    print("\nAverage characteristics per regime:")
    print(df.groupby("regime")[["daily_return", "volatility_21d"]].mean())

    return df


# ── ENTRYPOINT ────────────────────────────────────────────────────────────────
# This block only runs when you execute `python pipeline.py` directly.
# It will NOT run when pipeline.py is imported by main.py (the FastAPI app).
# Equivalent to: if (require.main === module) { ... } in Node.js
if __name__ == "__main__":
    result = run_pipeline()
    print("\nLast 5 rows:")
    print(result.tail(5))
