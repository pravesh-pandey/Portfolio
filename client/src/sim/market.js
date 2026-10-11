import { mulberry32 } from "./rng.js";

// Simulated "SIM·NIFTY" market: a 10-level book on a 0.05 tick grid, random trades,
// and occasional large institutional orders. Not real market data.
export const TICK = 0.05;
export const LEVELS = 10;
export const LOT = 75;
export const START_PRICE = 24500;
export const LARGE_ORDER_LOTS = [40, 80];

const toPrice = (ticks) => Math.round(ticks * TICK * 100) / 100;
const randomLots = (rng, min, max) => LOT * (min + Math.floor(rng() * (max - min + 1)));

// direction -1 builds bids downward from the best bid, +1 builds asks upward from the best ask.
// Levels that survive a price move keep their size with ±20% churn.
const buildSide = (rng, bestTicks, direction, previous = []) =>
  Array.from({ length: LEVELS }, (_, index) => {
    const price = toPrice(bestTicks + direction * index);
    const prior = previous.find((level) => level.price === price);
    const size = prior
      ? Math.max(LOT, Math.round((prior.size * (0.8 + 0.4 * rng())) / LOT) * LOT)
      : randomLots(rng, 1, 12);
    return { price, size };
  });

export const createMarket = ({ seed = 1, institutionalRate = 0.03 } = {}) => {
  const rng = mulberry32(seed);
  const bidTicks = Math.round(START_PRICE / TICK);
  return {
    rng,
    time: 0,
    bidTicks,
    institutionalRate,
    pending: null,
    bids: buildSide(rng, bidTicks, -1),
    asks: buildSide(rng, bidTicks + 1, 1),
    trades: []
  };
};

// Forces one large order on `side` ("buy" | "sell") at the next step.
export const inject = (market, side) => ({ ...market, pending: side });

export const step = (market) => {
  const { rng } = market;
  const largeSide =
    market.pending ?? (rng() < market.institutionalRate ? (rng() < 0.5 ? "buy" : "sell") : null);
  // Random walk of 1–6 ticks most steps; a large order also pushes price 10–30 ticks its way.
  const walk = rng() < 0.6 ? (rng() < 0.5 ? 1 : -1) * (1 + Math.floor(rng() * 6)) : 0;
  const impact = largeSide ? (largeSide === "buy" ? 1 : -1) * (10 + Math.floor(rng() * 21)) : 0;
  const bidTicks = market.bidTicks + walk + impact;
  const bids = buildSide(rng, bidTicks, -1, market.bids);
  const asks = buildSide(rng, bidTicks + 1, 1, market.asks);
  const touch = (side) => (side === "buy" ? asks[0].price : bids[0].price);

  const trades = Array.from({ length: Math.floor(rng() * 4) }, () => {
    const side = rng() < 0.5 ? "buy" : "sell";
    return { side, price: touch(side), size: randomLots(rng, 1, 4) };
  });

  if (largeSide) {
    const size = randomLots(rng, ...LARGE_ORDER_LOTS);
    trades.push({ side: largeSide, price: touch(largeSide), size });
    // Size also builds at the touch behind the aggressor, so order-flow imbalance reacts.
    const book = largeSide === "buy" ? bids : asks;
    book[0] = { ...book[0], size: book[0].size + size };
  }

  return { ...market, time: market.time + 1, bidTicks, bids, asks, trades, pending: null };
};
