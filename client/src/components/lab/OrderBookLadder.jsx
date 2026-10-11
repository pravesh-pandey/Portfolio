import { fmt } from "@/sim/format.js";

// Asks on top (highest first), bids below; a depth bar behind each size shows its share of the largest level.
export const OrderBookLadder = ({ bids, asks }) => {
  const peak = Math.max(...bids.map((level) => level.size), ...asks.map((level) => level.size));
  const row = (level, side) => (
    <tr
      key={`${side}-${level.price}`}
      className={`ladder__row ladder__row--${side}`}
      style={{ "--depth": `${(level.size / peak) * 100}%` }}
    >
      <td>{side === "bid" ? fmt(level.size, 0) : ""}</td>
      <td className="ladder__price">{fmt(level.price)}</td>
      <td>{side === "ask" ? fmt(level.size, 0) : ""}</td>
    </tr>
  );

  return (
    <table className="ladder">
      <thead>
        <tr>
          <th scope="col">bid size</th>
          <th scope="col">price</th>
          <th scope="col">ask size</th>
        </tr>
      </thead>
      <tbody>
        {[...asks].reverse().map((level) => row(level, "ask"))}
        {bids.map((level) => row(level, "bid"))}
      </tbody>
    </table>
  );
};
