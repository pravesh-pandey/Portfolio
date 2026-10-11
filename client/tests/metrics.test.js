import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../src/sim/rng.js";
import { LOT } from "../src/sim/market.js";
import { microprice, ofi, createVpin, createDetector } from "../src/sim/metrics.js";

test("microprice weights toward the thinner side", () => {
  const book = { bids: [{ price: 100, size: 300 }], asks: [{ price: 101, size: 100 }] };
  assert.equal(microprice(book), 100.75);
});

const top = (bidPrice, bidSize, askPrice, askSize) => ({
  bids: [{ price: bidPrice, size: bidSize }],
  asks: [{ price: askPrice, size: askSize }]
});

test("ofi follows the Cont–Kukanov–Stoikov definition", () => {
  assert.equal(ofi(top(100, 100, 101, 100), top(100, 150, 101, 100)), 50, "bid size up");
  assert.equal(ofi(top(100, 100, 101, 100), top(100, 100, 101, 150)), -50, "ask size up");
  assert.equal(ofi(top(100, 100, 101, 100), top(100.5, 150, 101, 100)), 150, "bid price up");
  assert.equal(ofi(top(100, 100, 101, 100), top(100, 100, 100.5, 120)), -120, "ask price down");
  assert.equal(ofi(top(100, 100, 101, 100), top(100, 100, 101, 100)), 0, "no change");
});

test("vpin buckets volume and signs trades with the tick rule", () => {
  const vpin = createVpin({ bucketVolume: 100 });
  assert.equal(vpin.value(), 0);
  vpin.add({ price: 10, size: 60 });
  vpin.add({ price: 9, size: 40 });
  assert.equal(vpin.value(), 0.2);
  vpin.add({ price: 9, size: 150 });
  assert.equal(vpin.value(), 0.6);
});

test("vpin stays within [0, 1] on a random tape", () => {
  const rng = mulberry32(11);
  const vpin = createVpin({ bucketVolume: 500, window: 10 });
  for (let i = 0; i < 2000; i += 1) {
    vpin.add({ price: 100 + Math.floor(rng() * 5), size: 1 + Math.floor(rng() * 900) });
    const value = vpin.value();
    assert.ok(value >= 0 && value <= 1, `vpin ${value}`);
  }
});

test("detector flags a large order but not normal ones", () => {
  const detector = createDetector();
  for (let i = 0; i < 30; i += 1) {
    assert.equal(detector.trade({ side: "buy", price: 100, size: LOT }, i), null);
  }
  assert.equal(detector.trade({ side: "buy", price: 100, size: LOT * 2 }, 30), null);
  const alert = detector.trade({ side: "sell", price: 99.95, size: LOT * 40 }, 31);
  assert.deepEqual(alert, { time: 31, side: "sell", price: 99.95, size: LOT * 40, reason: "size" });
});

test("detector stays quiet before it has enough history", () => {
  const detector = createDetector();
  assert.equal(detector.trade({ side: "buy", price: 100, size: LOT * 80 }, 0), null);
  assert.equal(detector.flow(1e6, 0, 100), null);
});

test("detector flags an order-flow spike and survives a flat series", () => {
  const detector = createDetector();
  for (let i = 0; i < 30; i += 1) assert.equal(detector.flow(i % 2 ? 10 : -10, i, 100), null);
  assert.deepEqual(detector.flow(500, 30, 100), { time: 30, side: "buy", price: 100, size: 500, reason: "ofi" });

  const flat = createDetector();
  for (let i = 0; i < 30; i += 1) flat.flow(5, i, 100);
  assert.equal(flat.flow(5000, 30, 100), null, "zero variance must not divide by zero");
});
