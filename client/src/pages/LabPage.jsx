import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageIntro } from "@components/common/PageIntro.jsx";
import { Sparkline, Bars } from "@components/lab/charts.jsx";
import { OrderBookLadder } from "@components/lab/OrderBookLadder.jsx";
import { createSession } from "@/sim/session.js";
import { fmt } from "@/sim/format.js";
import { useSimulation } from "@hooks/useSimulation.js";
import { useDocumentTitle } from "@hooks/useDocumentTitle.js";
import "./labPage.css";

const DEFAULT_RATE = 0.03;
const MAX_SEED = 2 ** 32 - 1;
const parseSeed = (value) => {
  const seed = Number(value);
  return value !== null && Number.isInteger(seed) && seed >= 0 && seed <= MAX_SEED ? seed : null;
};
const randomSeed = () => Math.floor(Math.random() * MAX_SEED);
const newSession = (seed, rate) => createSession({ seed, institutionalRate: rate, warmup: 60 });

export const LabPage = () => {
  useDocumentTitle("Order-flow lab");
  const [searchParams, setSearchParams] = useSearchParams();
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [seed, setSeed] = useState(() => parseSeed(searchParams.get("seed")) ?? randomSeed());
  const [session, setSession] = useState(() => newSession(seed, DEFAULT_RATE));
  const [running, setRunning] = useState(true);
  const [fast, setFast] = useState(false);
  const [copied, setCopied] = useState(false);
  const snapshot = useSimulation(session, fast ? 125 : 500, running);

  // The seed lives in the URL, so a run can be shared: same seed, same simulated market (at default settings).
  useEffect(() => {
    if (searchParams.get("seed") !== String(seed)) setSearchParams({ seed: String(seed) }, { replace: true });
  }, [seed, searchParams, setSearchParams]);

  const changeRate = (value) => {
    setRate(value);
    session.setRate(value);
  };

  const reset = () => {
    const next = randomSeed();
    setSeed(next);
    setSession(newSession(next, rate));
    setCopied(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="page lab">
      <PageIntro
        eyebrow="Lab · simulated data"
        title="Order-flow playground"
        lead="A simulated order book for a made-up index, SIM·NIFTY. Watch order-flow imbalance, microprice and VPIN react as orders arrive, then inject a large institutional order and see the detector catch it. Nothing here is real market data."
      />

      <div className="pane lab__controls">
        <button type="button" className="button" aria-pressed={!running} onClick={() => setRunning((value) => !value)}>
          {running ? "pause" : "play"}
        </button>
        <button type="button" className="button" aria-pressed={fast} onClick={() => setFast((value) => !value)}>
          speed {fast ? "4×" : "1×"}
        </button>
        <label className="lab__slider">
          institutional activity
          <input
            type="range"
            min="0"
            max="0.2"
            step="0.01"
            value={rate}
            onChange={(event) => changeRate(Number(event.target.value))}
          />
        </label>
        <button type="button" className="button button--primary" onClick={() => session.inject("buy")}>
          inject large buy
        </button>
        <button type="button" className="button" onClick={() => session.inject("sell")}>
          inject large sell
        </button>
        <button type="button" className="button" onClick={reset}>
          reset
        </button>
        <span className="lab__seed">seed {seed}</span>
        <button type="button" className="button" onClick={copyLink}>
          {copied ? "link copied" : "copy link to this seed"}
        </button>
      </div>

      <div className="lab__grid">
        <section className="pane lab__book">
          <h2 className="pane__label">Order book (simulated)</h2>
          <OrderBookLadder bids={snapshot.bids} asks={snapshot.asks} />
        </section>

        <section className="pane">
          <h2 className="pane__label">Price vs microprice</h2>
          <p className="lab__value">
            {fmt(snapshot.price)} · μP {fmt(snapshot.microprice)}
          </p>
          <Sparkline
            label="Price and microprice over time"
            series={[
              { values: snapshot.history.price, className: "lab__line--price" },
              { values: snapshot.history.microprice, className: "lab__line--micro" }
            ]}
          />
          <p className="lab__explain">
            Microprice weights the mid-price by resting size. When buyers stack the bid, it leans above the mid before
            the price moves.
          </p>
        </section>

        <section className="pane">
          <h2 className="pane__label">Order-flow imbalance</h2>
          <p className="lab__value">
            rolling {snapshot.ofi >= 0 ? "+" : "−"}
            {fmt(Math.abs(snapshot.ofi), 0)}
          </p>
          <Bars values={snapshot.history.ofi} label="Order-flow imbalance per step" />
          <p className="lab__explain">
            OFI nets out size added and removed at the best bid and ask. Positive means buying pressure is building;
            negative means selling pressure.
          </p>
        </section>

        <section className="pane">
          <h2 className="pane__label">VPIN (tick-rule variant)</h2>
          <p className="lab__value">{fmt(snapshot.vpin)}</p>
          <Sparkline
            label="VPIN over time"
            min={0}
            max={1}
            series={[{ values: snapshot.history.vpin, className: "lab__line--vpin" }]}
          />
          <p className="lab__explain">
            VPIN measures how one-sided recent volume has been, over equal-volume buckets. This version signs trades
            with the tick rule rather than bulk volume classification. Near 1 means one side dominates the flow, a
            typical sign of informed or institutional trading.
          </p>
        </section>

        <section className="pane lab__alerts">
          <h2 className="pane__label">Detector alerts</h2>
          {snapshot.alerts.length > 0 ? (
            <ol>
              {snapshot.alerts.map((alert) => (
                <li key={`${alert.time}-${alert.reason}-${alert.side}`}>
                  <span className="lab__alert-dot">●</span> t{alert.time} {alert.side.toUpperCase()}{" "}
                  {fmt(alert.size, 0)} @ {fmt(alert.price)} · {alert.reason === "size" ? "large order" : "OFI spike"}
                </li>
              ))}
            </ol>
          ) : (
            <p>No alerts yet. Inject a large order to trigger one.</p>
          )}
          <p className="lab__explain">
            Flags an order more than five times the recent median size, or a step whose order-flow imbalance is more than
            three standard deviations from its recent mean.
          </p>
        </section>
      </div>
    </div>
  );
};
