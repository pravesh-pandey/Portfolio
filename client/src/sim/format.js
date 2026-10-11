// Indian digit grouping, fixed decimals: fmt(24512.3) → "24,512.30".
export const fmt = (value, digits = 2) =>
  value.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
