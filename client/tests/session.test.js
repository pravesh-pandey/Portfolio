import { test } from "node:test";
import assert from "node:assert/strict";
import { createSession, HISTORY, MAX_ALERTS } from "../src/sim/session.js";

test("session is deterministic and keeps bounded history", () => {
  const a = createSession({ seed: 9 });
  const b = createSession({ seed: 9 });
  for (let i = 0; i < 50; i += 1) assert.deepEqual(a.next(), b.next());
  for (let i = 0; i < 300; i += 1) a.next();
  const { history, alerts, vpin } = a.current();
  for (const key of ["price", "microprice", "ofi", "vpin"]) assert.equal(history[key].length, HISTORY, key);
  assert.ok(alerts.length <= MAX_ALERTS);
  assert.ok(vpin >= 0 && vpin <= 1);
});

test("session raises an alert soon after an injected order", () => {
  const session = createSession({ seed: 4, institutionalRate: 0 });
  for (let i = 0; i < 80; i += 1) session.next();
  session.inject("buy");
  const snapshot = session.next();
  assert.ok(
    snapshot.alerts.some((alert) => alert.side === "buy" && alert.time === snapshot.time),
    "no buy alert on the injection step"
  );
});

test("a warmed-up session starts with history and catches an immediate injection", () => {
  const session = createSession({ seed: 4, institutionalRate: 0, warmup: 60 });
  assert.equal(session.current().history.price.length, 60);
  session.inject("buy");
  const snapshot = session.next();
  assert.ok(snapshot.alerts.some((alert) => alert.side === "buy" && alert.time === snapshot.time));
});
