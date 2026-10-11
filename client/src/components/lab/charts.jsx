const W = 300;
const H = 80;

const toPoints = (values, min, max) => {
  const span = max - min || 1;
  const last = Math.max(values.length - 1, 1);
  return values.map((value, i) => `${(i / last) * W},${H - ((value - min) / span) * H}`).join(" ");
};

// Line chart; series share one y-scale (min/max default to the data range).
export const Sparkline = ({ series, min, max, label }) => {
  const all = series.flatMap((item) => item.values);
  const low = min ?? Math.min(...all);
  const high = max ?? Math.max(...all);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
      {series.map(
        (item) =>
          item.values.length > 1 && (
            <polyline
              key={item.className}
              className={item.className}
              points={toPoints(item.values, low, high)}
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          )
      )}
    </svg>
  );
};

// Signed bars around a zero line, scaled to the largest magnitude.
export const Bars = ({ values, label }) => {
  const peak = Math.max(1, ...values.map(Math.abs));
  const width = W / Math.max(values.length, 1);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
      <line className="chart__axis" x1="0" x2={W} y1={H / 2} y2={H / 2} vectorEffect="non-scaling-stroke" />
      {values.map((value, i) => {
        const height = (Math.abs(value) / peak) * (H / 2);
        return (
          <rect
            key={i}
            className={value >= 0 ? "chart__bar--up" : "chart__bar--down"}
            x={i * width}
            width={Math.max(width - 0.5, 0.5)}
            y={value >= 0 ? H / 2 - height : H / 2}
            height={height}
          />
        );
      })}
    </svg>
  );
};
