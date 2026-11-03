# Deriv Four-Stick Scanner — starter prototype

## Run
Requires Node.js 18+.
1. Extract the ZIP.
2. In the project folder run `npm install`
3. Run `npm start`
4. Open `http://localhost:3000`

## What it attempts
- Fetch active Deriv instruments from the public market-data WebSocket.
- Subscribe to their tick streams in small batches.
- Aggregate ticks into 17 timeframe bars: M1, M2, M3, M4, M5, M6, M10, M12, M15, M20, M30, H1, H2, H3, H4, H6, H8, H12.
- Display new BUY/SELL breakouts and stop-loss reference on a mobile dashboard.
- Never places trades.

## Important limitations
This is an early prototype, not a production scanner and not validated for live trading. It subscribes to every active symbol, which may exceed current Deriv service limits. It lacks durable storage, complete candle backfill, authenticated dashboard access, mobile push notifications, and health monitoring. Browser-only use is not 24/7 hosting.

The tick-built candle history is not reliable after a restart or a missed tick. It must be backfilled and compared with MT5 candles before trading. The current implementation also needs test cases and review of wick rules before use.

It does not yet calculate MT5 lot size. Accurate sizing needs account free margin and each instrument's MT5 volume step, contract size, tick value, leverage, and margin rules. A 50% free-margin allocation is not a safe-loss limit. Never put MT5 passwords or Deriv API tokens in this project.

Production checklist: load-test symbol subscription limits; add reconnect/backfill and persistent signal IDs; verify exact signals against MT5; add dashboard authentication; deploy to always-on hosting; test on demo before real trading.
