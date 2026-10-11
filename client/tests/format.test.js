import { test } from "node:test";
import assert from "node:assert/strict";
import { describeAlert } from "../src/sim/format.js";

test("alerts name large orders and order-flow spikes differently", () => {
  assert.equal(describeAlert({ reason: "size", side: "buy", price: 24503.1 }), "large buy @ 24,503.10");
  assert.equal(describeAlert({ reason: "ofi", side: "sell", price: 24499.5 }), "sell-side OFI spike @ 24,499.50");
});
