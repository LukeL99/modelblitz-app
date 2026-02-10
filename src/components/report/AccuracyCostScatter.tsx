import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { modelResults } from '../../data/mockBenchmark';

export default function AccuracyCostScatter() {
  const data = modelResults.map((r) => ({
    name: r.model,
    cost: r.costPerQuery,
    accuracy: r.accuracy,
    isRecommended: r.rank === 1,
    size: r.rank === 1 ? 200 : 100,
  }));

  return (
    <div className="bg-surface border border-surface-border rounded-xl p-5">
      <h3 className="text-base font-semibold text-text-primary mb-4">Accuracy vs Cost</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
            <XAxis
              type="number"
              dataKey="cost"
              name="Cost"
              tickFormatter={(v) => `$${v}`}
              tick={{ fill: '#A1A1AA', fontSize: 11 }}
              axisLine={{ stroke: '#2A2A2D' }}
              tickLine={false}
              label={{ value: '$/query', position: 'bottom', fill: '#71717A', fontSize: 11, offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="accuracy"
              name="Accuracy"
              domain={[60, 100]}
              tick={{ fill: '#A1A1AA', fontSize: 11 }}
              axisLine={{ stroke: '#2A2A2D' }}
              tickLine={false}
              label={{ value: 'Accuracy', angle: -90, position: 'insideLeft', fill: '#71717A', fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="size" range={[80, 200]} />
            <Tooltip
              contentStyle={{
                background: '#1E1E20',
                border: '1px solid #2A2A2D',
                borderRadius: '8px',
                color: '#F5F5F5',
                fontSize: '12px',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                if (name === 'Cost') return [`$${value ?? 0}`, name];
                return [value ?? 0, name];
              }}
              labelFormatter={() => ''}
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                return (
                  <div className="bg-surface-raised border border-surface-border rounded-lg px-3 py-2 text-xs">
                    <p className="font-semibold text-text-primary">{d.name}</p>
                    <p className="text-text-secondary">Accuracy: {d.accuracy} · Cost: ${d.cost}</p>
                  </div>
                );
              }}
            />
            <Scatter data={data}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isRecommended ? '#F97316' : '#71717A'}
                  stroke={entry.isRecommended ? '#F97316' : 'none'}
                  strokeWidth={entry.isRecommended ? 2 : 0}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
