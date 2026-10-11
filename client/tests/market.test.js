import { test } from "node:test";
import assert from "node:assert/strict";
import { mulberry32 } from "../src/sim/rng.js";
import { createMarket, step, inject, LEVELS, LOT, LARGE_ORDER_LOTS } from "../src/sim/market.js";

const run = (market, steps) => {
  let current = market;
  for (let i = 0; i < steps; i += 1) current = step(current);
  return current;
};
const visible = ({ time, bids, asks, trades }) => ({ time, bids, asks, trades });

test("rng is deterministic and stays in [0, 1)", () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  for (let i = 0; i < 1000; i += 1) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
  assert.notEqual(mulberry32(1)(), mulberry32(2)());
});

test("same seed gives the same market", () => {
  let a = createMarket({ seed: 7 });
  let b = createMarket({ seed: 7 });
  for (let i = 0; i < 100; i += 1) {
    a = step(a);
    b = step(b);
    assert.deepEqual(visible(a), visible(b));
  }
});

test("the book stays well-formed", () => {
  let market = createMarket({ seed: 3, institutionalRate: 0.2 });
  for (let i = 0; i < 500; i += 1) {
    market = step(market);
    const { bids, asks } = market;
    assert.equal(bids.length, LEVELS);
    assert.equal(asks.length, LEVELS);
    assert.ok(bids[0].price < asks[0].price, "crossed book");
    for (let j = 1; j < LEVELS; j += 1) {
      assert.ok(bids[j].price < bids[j - 1].price, "bids not descending");
      assert.ok(asks[j].price > asks[j - 1].price, "asks not ascending");
    }
    for (const level of [...bids, ...asks]) {
      assert.ok(level.size >= LOT && level.size % LOT === 0, `bad size ${level.size}`);
    }
  }
});

test("inject forces one large order on the requested side", () => {
  const market = step(inject(run(createMarket({ seed: 5, institutionalRate: 0 }), 10), "sell"));
  const large = market.trades.filter((trade) => trade.size >= LARGE_ORDER_LOTS[0] * LOT);
  assert.equal(large.length, 1);
  assert.equal(large[0].side, "sell");
  assert.equal(large[0].price, market.bids[0].price);
  assert.equal(market.pending, null);
});
