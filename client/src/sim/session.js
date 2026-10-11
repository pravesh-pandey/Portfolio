import { createMarket, step, inject, LOT } from "./market.js";
import { microprice, ofi, createVpin, createDetector } from "./metrics.js";

export const HISTORY = 120;
export const MAX_ALERTS = 8;
const OFI_ROLL = 20;

const midOf = (market) => (market.bids[0].price + market.asks[0].price) / 2;
const pushBounded = (list, value, limit) => [...list, value].slice(-limit);

// One running simulation: call next() to advance a step and get a render-ready snapshot.
// `warmup` steps run up front so charts start full and the detector is primed.
export const createSession = ({ seed = 1, institutionalRate = 0.03, warmup = 0 } = {}) => {
  let market = createMarket({ seed, institutionalRate });
  const open = midOf(market);
  const vpin = createVpin({ bucketVolume: LOT * 50 });
  const detector = createDetector();
  let flows = [];
  let snapshot = {
    time: 0,
    price: open,
    changePct: 0,
    microprice: microprice(market),
    ofi: 0,
    vpin: 0,
    bids: market.bids,
    asks: market.asks,
    alerts: [],
    history: { price: [], microprice: [], ofi: [], vpin: [] }
  };

  const session = {
    next() {
      const prev = market;
      market = step(market);
      const price = midOf(market);
      const flow = ofi(prev, market);
      flows = pushBounded(flows, flow, OFI_ROLL);

      const fresh = [];
      for (const trade of market.trades) {
        vpin.add(trade);
        const alert = detector.trade(trade, market.time);
        if (alert) fresh.push(alert);
      }
      const flowAlert = detector.flow(flow, market.time, price);
      if (flowAlert) fresh.push(flowAlert);

      const rollingOfi = flows.reduce((sum, x) => sum + x, 0);
      const micro = microprice(market);
      const { history } = snapshot;
      snapshot = {
        time: market.time,
        price,
        changePct: ((price - open) / open) * 100,
        microprice: micro,
        ofi: rollingOfi,
        vpin: vpin.value(),
        bids: market.bids,
        asks: market.asks,
        alerts: [...fresh.reverse(), ...snapshot.alerts].slice(0, MAX_ALERTS),
        history: {
          price: pushBounded(history.price, price, HISTORY),
          microprice: pushBounded(history.microprice, micro, HISTORY),
          ofi: pushBounded(history.ofi, flow, HISTORY),
          vpin: pushBounded(history.vpin, vpin.value(), HISTORY)
        }
      };
      return snapshot;
    },
    inject(side) {
      market = inject(market, side);
    },
    setRate(rate) {
      market = { ...market, institutionalRate: rate };
    },
    current: () => snapshot
  };
  for (let i = 0; i < warmup; i += 1) session.next();
  return session;
};
