// Indian digit grouping, fixed decimals: fmt(24512.3) → "24,512.30".
export const fmt = (value, digits = 2) =>
  value.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });

// A large order is one trade; an OFI spike is pressure across the book, so it isn't called an order.
export const describeAlert = (alert) =>
  alert.reason === "size"
    ? `large ${alert.side} @ ${fmt(alert.price)}`
    : `${alert.side}-side OFI spike @ ${fmt(alert.price)}`;
