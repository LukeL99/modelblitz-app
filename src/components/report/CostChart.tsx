import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { modelResults } from '../../data/mockBenchmark';

export default function CostChart() {
  const data = [...modelResults]
    .sort((a, b) => a.costPerQuery - b.costPerQuery)
    .map((r) => ({
      name: r.model.length > 18 ? r.model.slice(0, 16) + '…' : r.model,
      fullName: r.model,
      cost: r.costPerQuery,
      isRecommended: r.rank === 1,
    }));

  return (
    <div className="bg-surface border border-surface-border rounded-xl p-5">
      <h3 className="text-base font-semibold text-text-primary mb-4">Cost per Query</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
            <XAxis
              type="number"
              tickFormatter={(v) => `$${v}`}
              tick={{ fill: '#A1A1AA', fontSize: 11 }}
              axisLine={{ stroke: '#2A2A2D' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              tick={{ fill: '#A1A1AA', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1E1E20',
                border: '1px solid #2A2A2D',
                borderRadius: '8px',
                color: '#F5F5F5',
                fontSize: '12px',
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`$${value ?? 0}`, 'Cost/Query']}
              labelFormatter={(label) => {
                const item = data.find(d => d.name === label);
                return item?.fullName || label;
              }}
            />
            <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.isRecommended ? '#F97316' : '#71717A'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
