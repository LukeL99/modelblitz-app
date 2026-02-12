"use client";

const PROVIDER_COLORS: Record<string, string> = {
  openai: "#10A37F",
  anthropic: "#D4A574",
  google: "#4285F4",
  "meta-llama": "#0668E1",
  qwen: "#6366F1",
  mistralai: "#FF7000",
  "x-ai": "#FFFFFF",
  nvidia: "#76B900",
};

function getProviderColor(provider: string): string {
  return PROVIDER_COLORS[provider] ?? "#6B7280";
}

interface BubbleDataPoint {
  modelName: string;
  cost: number;
  accuracy: number;
  p95: number;
  spread: number;
  provider: string;
}

interface BubbleChartProps {
  data: BubbleDataPoint[];
}

export function BubbleChart({ data }: BubbleChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-text-muted text-sm">No data available for chart.</p>
    );
  }

  const width = 600;
  const height = 400;
  const padding = { top: 30, right: 40, bottom: 50, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // X-axis: Cost per run
  const maxCost = Math.max(...data.map((d) => d.cost));
  const xMax = maxCost > 0 ? maxCost * 1.1 : 0.01;

  // Y-axis: Accuracy (%)
  const minAccuracy = Math.min(...data.map((d) => d.accuracy));
  const yMin = Math.max(0, Math.floor((minAccuracy - 5) / 5) * 5);
  const yMax = 100;

  // P95 for radius scaling
  const maxP95 = Math.max(...data.map((d) => d.p95), 1);

  function scaleX(cost: number): number {
    return padding.left + (cost / xMax) * plotWidth;
  }

  function scaleY(accuracy: number): number {
    return padding.top + ((yMax - accuracy) / (yMax - yMin)) * plotHeight;
  }

  // Generate tick values
  const xTicks = Array.from({ length: 5 }, (_, i) => (xMax / 5) * (i + 1));
  const yRange = yMax - yMin;
  const yStep = yRange <= 20 ? 5 : yRange <= 50 ? 10 : 20;
  const yTicks: number[] = [];
  for (let v = yMin; v <= yMax; v += yStep) {
    yTicks.push(v);
  }
  if (yTicks[yTicks.length - 1] !== yMax) yTicks.push(yMax);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Grid lines */}
      {yTicks.map((tick) => (
        <line
          key={`grid-${tick}`}
          x1={padding.left}
          y1={scaleY(tick)}
          x2={width - padding.right}
          y2={scaleY(tick)}
          stroke="#333"
          strokeDasharray="4 4"
          strokeWidth={0.5}
        />
      ))}

      {/* X-axis */}
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="#555"
        strokeWidth={1}
      />
      {xTicks.map((tick) => (
        <g key={`xtick-${tick}`}>
          <line
            x1={scaleX(tick)}
            y1={height - padding.bottom}
            x2={scaleX(tick)}
            y2={height - padding.bottom + 5}
            stroke="#555"
            strokeWidth={1}
          />
          <text
            x={scaleX(tick)}
            y={height - padding.bottom + 18}
            textAnchor="middle"
            fill="#6B7280"
            fontSize={10}
          >
            ${tick.toFixed(tick < 0.01 ? 4 : 3)}
          </text>
        </g>
      ))}
      <text
        x={padding.left + plotWidth / 2}
        y={height - 6}
        textAnchor="middle"
        fill="#6B7280"
        fontSize={11}
      >
        Cost per Run ($)
      </text>

      {/* Y-axis */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke="#555"
        strokeWidth={1}
      />
      {yTicks.map((tick) => (
        <g key={`ytick-${tick}`}>
          <line
            x1={padding.left - 5}
            y1={scaleY(tick)}
            x2={padding.left}
            y2={scaleY(tick)}
            stroke="#555"
            strokeWidth={1}
          />
          <text
            x={padding.left - 10}
            y={scaleY(tick) + 4}
            textAnchor="end"
            fill="#6B7280"
            fontSize={10}
          >
            {tick}%
          </text>
        </g>
      ))}
      <text
        x={14}
        y={padding.top + plotHeight / 2}
        textAnchor="middle"
        fill="#6B7280"
        fontSize={11}
        transform={`rotate(-90, 14, ${padding.top + plotHeight / 2})`}
      >
        Field Accuracy (%)
      </text>

      {/* Data points */}
      {data.map((d) => {
        const color = getProviderColor(d.provider);
        const r = 8 + (d.p95 / maxP95) * 24;
        const opacity = Math.max(0.3, 1 - d.spread / 50);

        return (
          <circle
            key={d.modelName}
            cx={scaleX(d.cost)}
            cy={scaleY(d.accuracy)}
            r={r}
            fill={color}
            fillOpacity={opacity}
            stroke={color}
            strokeWidth={1.5}
          >
            <title>
              {d.modelName}
              {"\n"}Accuracy: {d.accuracy}%{"\n"}Cost: ${d.cost.toFixed(4)}
              {"\n"}P95: {d.p95}ms{"\n"}Spread: +/-{d.spread.toFixed(1)}%
            </title>
          </circle>
        );
      })}
    </svg>
  );
}
