// Size-weighted mid: leans toward the side with less resting size.
export const microprice = ({ bids, asks }) => {
  const bid = bids[0];
  const ask = asks[0];
  return (bid.price * ask.size + ask.price * bid.size) / (bid.size + ask.size);
};

// Order-flow imbalance between two top-of-book snapshots (Cont, Kukanov & Stoikov, 2014).
export const ofi = (prev, next) => {
  const [pb, nb, pa, na] = [prev.bids[0], next.bids[0], prev.asks[0], next.asks[0]];
  const bidFlow = (nb.price >= pb.price ? nb.size : 0) - (nb.price <= pb.price ? pb.size : 0);
  const askFlow = (na.price <= pa.price ? na.size : 0) - (na.price >= pa.price ? pa.size : 0);
  return bidFlow - askFlow;
};

// VPIN over fixed-volume buckets; trades are signed with the tick rule.
// value() is the mean |buy − sell| / bucketVolume over the last `window` full buckets, in [0, 1].
export const createVpin = ({ bucketVolume, window = 50 }) => {
  let lastPrice = null;
  let lastSide = "buy";
  let buy = 0;
  let sell = 0;
  const imbalances = [];

  return {
    add({ price, size }) {
      const side =
        lastPrice === null || price === lastPrice ? lastSide : price > lastPrice ? "buy" : "sell";
      lastPrice = price;
      lastSide = side;
      let remaining = size;
      while (remaining > 0) {
        const take = Math.min(bucketVolume - buy - sell, remaining);
        if (side === "buy") buy += take;
        else sell += take;
        remaining -= take;
        if (buy + sell === bucketVolume) {
          imbalances.push(Math.abs(buy - sell) / bucketVolume);
          if (imbalances.length > window) imbalances.shift();
          buy = 0;
          sell = 0;
        }
      }
    },
    value: () =>
      imbalances.length ? imbalances.reduce((sum, x) => sum + x, 0) / imbalances.length : 0
  };
};

export const SIZE_MULTIPLE = 5;
export const SIZE_WINDOW = 200;
export const OFI_Z = 3;
export const OFI_WINDOW = 50;
const MIN_SAMPLES = 20;

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

// Flags orders far larger than recent typical orders, and order-flow imbalance spikes.
// Alerts look like { time, side, price, size, reason: "size" | "ofi" }.
export const createDetector = () => {
  const sizes = [];
  const flows = [];

  return {
    trade(trade, time) {
      const typical = sizes.length >= MIN_SAMPLES ? median(sizes) : null;
      sizes.push(trade.size);
      if (sizes.length > SIZE_WINDOW) sizes.shift();
      if (typical === null || trade.size <= SIZE_MULTIPLE * typical) return null;
      return { time, side: trade.side, price: trade.price, size: trade.size, reason: "size" };
    },
    flow(value, time, price) {
      let alert = null;
      if (flows.length >= MIN_SAMPLES) {
        const mean = flows.reduce((sum, x) => sum + x, 0) / flows.length;
        const sd = Math.sqrt(flows.reduce((sum, x) => sum + (x - mean) ** 2, 0) / flows.length);
        if (sd > 0 && Math.abs(value - mean) / sd > OFI_Z) {
          alert = { time, side: value > mean ? "buy" : "sell", price, size: Math.abs(value), reason: "ofi" };
        }
      }
      flows.push(value);
      if (flows.length > OFI_WINDOW) flows.shift();
      return alert;
    }
  };
};
