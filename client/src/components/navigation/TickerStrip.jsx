import { useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { createSession } from "@/sim/session.js";
import { fmt } from "@/sim/format.js";
import { useSimulation } from "@hooks/useSimulation.js";

const TickerItems = ({ snapshot }) => {
  const up = snapshot.changePct >= 0;
  const alert = snapshot.alerts[0];
  return (
    <>
      <span className="ticker__label">SIM·NIFTY</span>
      <span>
        {fmt(snapshot.price)}{" "}
        <span className={up ? "ticker__up" : "ticker__down"}>
          {up ? "▲" : "▼"}
          {fmt(Math.abs(snapshot.changePct))}%
        </span>
      </span>
      <span>
        OFI{" "}
        <span className={snapshot.ofi >= 0 ? "ticker__up" : "ticker__down"}>
          {snapshot.ofi >= 0 ? "+" : "−"}
          {fmt(Math.abs(snapshot.ofi), 0)}
        </span>
      </span>
      <span>μP {fmt(snapshot.microprice)}</span>
      <span>VPIN {fmt(snapshot.vpin)}</span>
      {alert && (
        <span className="ticker__alert">
          ● large {alert.side} @ {fmt(alert.price)}
        </span>
      )}
      <span className="ticker__note">simulated data</span>
    </>
  );
};

export const TickerStrip = () => {
  const [session] = useState(() => createSession({ seed: Date.now() >>> 0, warmup: 60 }));
  const snapshot = useSimulation(session, 500);
  const reduceMotion = useReducedMotion();

  return (
    <Link to="/lab" className="ticker" aria-label="Simulated market ticker: open the order-flow lab">
      <div className={`ticker__track${reduceMotion ? "" : " ticker__track--marquee"}`} aria-hidden="true">
        <span className="ticker__group">
          <TickerItems snapshot={snapshot} />
        </span>
        <span className="ticker__group ticker__group--copy">
          <TickerItems snapshot={snapshot} />
        </span>
      </div>
    </Link>
  );
};
