export const caseStudies = [
  {
    slug: "flowpulse",
    kind: "trading",
    title: "FlowPulse",
    summary:
      "A C++ engine that continuously watches Indian index options and MCX commodities, spots large institutional orders as they hit the book, and paper-trades every signal so each idea is judged on realistic P&L.",
    problem:
      "Institutional orders are where moves start, but they hide inside a fast, noisy options market. Spotting them means reading the order book continuously, separating real pressure from routine churn, and acting before the signal goes stale — without a human staring at screens all day.",
    pipeline: [
      "Market data feed",
      "Order-book analyzer",
      "OFI · microprice · VPIN",
      "Institutional-order detector",
      "Telegram alerts + paper trades",
      "PostgreSQL · Grafana"
    ],
    approach: [
      "FlowPulse polls market depth for NIFTY, BANKNIFTY and FINNIFTY options and MCX contracts, tracks how the order book changes between snapshots, and computes market-microstructure signals on every update: order-flow imbalance, microprice and VPIN.",
      "A detector combines those signals to flag likely institutional activity. Each alert goes to Telegram with inline feedback buttons and opens a paper trade, so every signal is scored on what it would actually have earned after costs."
    ],
    decisions: [
      {
        decision: "Acting on signals",
        chosen: "Paper-trade every alert with full F&O charges and lot sizes",
        rejected: "Routing live orders from the start: a signal should prove itself after costs before it touches capital."
      },
      {
        decision: "Detector thresholds",
        chosen: "Recalibrate automatically from feedback on Telegram alerts",
        rejected: "Fixed, hand-tuned thresholds: as market conditions change they drift into noise or silence."
      },
      {
        decision: "Where results live",
        chosen: "PostgreSQL for alerts, trades and market data, with Grafana dashboards",
        rejected: "Log files: every review question becomes a scripting job instead of a query."
      }
    ],
    highlights: [
      "Modern C++20 core built with CMake, with candle building and indicators (EMA, RSI, volatility) on top of the raw feed.",
      "Feedback loop: reactions to Telegram alerts automatically recalibrate the detector's thresholds.",
      "Paper trading that models full NSE F&O charges, lot sizes, time-based exits and end-of-day square-off.",
      "Short-horizon return forecasting models alongside the rule-based detector.",
      "Dockerized deployment with CI pipelines, PostgreSQL persistence and Grafana dashboards."
    ],
    limitations: [
      "Paper trading only — no live capital is routed through it.",
      "Signals are tuned for Indian index options and MCX; other markets would need their own calibration.",
      "Next: richer order-book features and a replay mode for studying past sessions."
    ],
    stack: ["C++20", "CMake", "PostgreSQL", "Grafana", "Docker", "Telegram API"],
    codeLink: null
  },
  {
    slug: "options-backtester",
    kind: "trading",
    title: "Options Backtester for Indian F&O",
    summary:
      "A research platform that replays options strategies minute by minute on archived index and option-chain data, charging every order the way an Indian F&O broker would, and stress-tests ideas with walk-forward research instead of a single lucky backtest.",
    problem:
      "Most options backtests flatter the strategy: they peek at bars that haven't closed, forward-fill missing prices, ignore charges, and tune parameters on the same data they report. Each shortcut inflates results that then fail live.",
    pipeline: [
      "Index + option-chain archive",
      "Completed-bar resampling",
      "Strategy signals",
      "Leg and strike selection",
      "Minute simulation with F&O charges",
      "Sweeps + walk-forward research"
    ],
    approach: [
      "The engine is deterministic: strategies only ever see completed underlying bars, missing prices are never forward-filled, and each leg is matched to a real contract by strike step and budget before an order is simulated with full charges.",
      "On top of the engine, a parallel sweep explores strategies, parameters, strike offsets and risk settings, while walk-forward research with Fixed Share weights and purged chronological validation checks whether an edge survives on data it was not tuned on."
    ],
    decisions: [
      {
        decision: "Fill prices",
        chosen: "Worst case: buys fill at the candle high, sells at the low, plus slippage",
        rejected: "Candle close or mid-price: optimistic fills are the most common way backtests flatter a strategy."
      },
      {
        decision: "What a strategy can see",
        chosen: "Only completed underlying bars; entries execute at the next minute's open",
        rejected: "Signals on the bar still forming: that is look-ahead bias, and it inflates every result."
      },
      {
        decision: "Missing prices",
        chosen: "Never forward-fill; a position whose strike leaves the archive settles at its last observed price",
        rejected: "Forward-filling gaps: invented prices create trades that could never have happened."
      },
      {
        decision: "Validation",
        chosen: "Walk-forward research with purged chronological splits",
        rejected: "One backtest tuned and scored on the same data: it reports luck as skill."
      }
    ],
    highlights: [
      "Look-ahead-safe simulation: session-anchored resampling and completed-bar signals only.",
      "Conservative worst-case fills: market buys fill at the candle high, sells at the low, plus configurable slippage.",
      "Per-order Indian F&O charge model on premium turnover.",
      "Plugin-style strategy library with validated parameters.",
      "Parallel parameter sweeps across processes."
    ],
    limitations: [
      "Research only — it never places orders.",
      "Sell-side margin is a user-configured estimate, not a broker margin calculation.",
      "Next: an options payoff and Greeks view for designing strategies before backtesting them."
    ],
    stack: ["Python", "FastAPI", "pandas", "NumPy", "Parquet", "Pydantic"],
    codeLink: null
  },
  {
    slug: "localcache",
    kind: "infrastructure",
    title: "LocalCache",
    summary:
      "A filesystem-backed cache with Redis-like ergonomics: entries live as sharded, hash-addressed files, so lookups stay constant-time as the cache grows, without holding an index in memory.",
    problem:
      "Services sometimes need a cache that is larger than RAM and survives restarts, but a full database is overkill. Naive file caches slow down as directories fill up, corrupt entries on crashes, and race when several processes write at once.",
    pipeline: [
      "Key",
      "SHA-256 hash",
      "Sharded path",
      "Atomic write / locked read",
      "TTL check",
      "Journal-driven eviction"
    ],
    approach: [
      "Every key is hashed with SHA-256 and mapped to a sharded directory path, so the cost of a lookup does not depend on how many entries exist. Writes go to a temporary file and are renamed into place, with optional fsync, so a crash never leaves a half-written entry.",
      "Concurrent access is coordinated with POSIX file locks. Expiry metadata sits next to each payload and is checked lazily on read, and an append-only access journal drives background eviction without keeping usage statistics in memory."
    ],
    decisions: [
      {
        decision: "Finding a key",
        chosen: "SHA-256 hash mapped to a sharded directory path",
        rejected: "An in-memory index: it caps the cache at what fits in RAM and must be rebuilt on every start."
      },
      {
        decision: "Crash safety",
        chosen: "Write to a temporary file, then rename it into place atomically (optional fsync)",
        rejected: "Writing in place: a crash mid-write leaves a corrupt entry behind."
      },
      {
        decision: "Concurrency",
        chosen: "POSIX file locks",
        rejected: "In-process locks only: two services sharing one cache directory would race."
      },
      {
        decision: "Eviction bookkeeping",
        chosen: "An append-only access journal",
        rejected: "An in-memory LRU list: memory use would grow with the number of entries."
      }
    ],
    highlights: [
      "Constant-time lookups via hash-addressed, sharded storage.",
      "Crash-safe atomic writes with optional durability (fsync).",
      "Multi-process safety with POSIX file locking.",
      "TTL support, batch get/put/delete and stream-based iteration.",
      "Java implementation with an earlier Python prototype."
    ],
    limitations: [
      "Single-host by design — it is not a distributed cache.",
      "Throughput is bounded by the underlying filesystem.",
      "Next: pluggable serializers and metrics hooks."
    ],
    stack: ["Java", "Python", "File systems", "Concurrency"],
    codeLink: "https://github.com/pravesh-pandey/LocalCache"
  }
];

export const findCaseStudy = (slug) => caseStudies.find((study) => study.slug === slug);
