# Scanner 2.0 — Browser-only prototype

This build is designed to run directly in a modern browser (Chrome on Android) without a Node.js server.

## Publish using GitHub Pages
1. In your existing GitHub repository, replace `public/index.html` with this version.
2. For GitHub Pages, the published entry file must be at the repository root. Copy this `public/index.html` to a root-level `index.html` (or move it there). You may keep `public/index.html` as a backup.
3. In GitHub: Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save.
4. Open the Pages URL shown by GitHub in Chrome.

## Operation
Press **Start scanning**. The page connects directly to the Deriv public WebSocket feed and requests active symbols. It subscribes in small batches and builds candles from ticks received after the page starts. Press **Stop** to disconnect.

## Important limitations
- Experimental prototype; not validated against MT5 or for live trading.
- No historical tick/candle backfill. Each timeframe needs enough time to accumulate three completed candles after starting. H12 can take up to 36 hours.
- Tick-built candles may differ from MT5 candles.
- A browser tab is not a reliable 24/7 process. Android/Chrome can suspend background tabs, and closing/reloading the page stops scanning.
- Subscribing to every active symbol may exceed browser/API connection or subscription limits on some devices/accounts. If this occurs, reduce the instrument list or scan in groups.
- No automatic trading, no credentials, no persistence; signals disappear on reload.
- The Deriv public endpoint and subscription policies may change. Confirm the feed is working before relying on it.
