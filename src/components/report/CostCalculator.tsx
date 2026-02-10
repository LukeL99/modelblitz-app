import { useState } from 'react';
import { Calculator, TrendingDown } from 'lucide-react';
import { modelResults } from '../../data/mockBenchmark';

export default function CostCalculator() {
  const [queriesPerDay, setQueriesPerDay] = useState(1000);

  const top10 = [...modelResults].slice(0, 10);
  const gpt4o = modelResults.find((m) => m.model === 'GPT-4o')!;
  const recommended = modelResults[0]; // Claude 3.5 Sonnet

  const monthlyCost = (costPerQuery: number) => costPerQuery * queriesPerDay * 30;
  const gpt4oCost = monthlyCost(gpt4o.costPerQuery);

  return (
    <div className="bg-surface border border-surface-border rounded-xl p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-ember" />
        <h3 className="text-base font-semibold text-text-primary">Monthly Cost Calculator</h3>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-text-secondary mb-2">How many queries per day?</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={queriesPerDay}
            onChange={(e) => setQueriesPerDay(parseInt(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={queriesPerDay}
            onChange={(e) => setQueriesPerDay(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 bg-surface-raised border border-surface-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary text-right focus:border-ember focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[1fr_6rem_7rem] gap-2 pb-2 border-b border-surface-border">
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Model</span>
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider text-right">Monthly</span>
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider text-right">vs GPT-4o</span>
        </div>

        {top10.map((r) => {
          const cost = monthlyCost(r.costPerQuery);
          const diff = cost - gpt4oCost;
          const isRec = r.rank === 1;
          const isGpt4o = r.model === 'GPT-4o';

          return (
            <div
              key={r.model}
              className={`grid grid-cols-[1fr_6rem_7rem] gap-2 py-2 border-b border-surface-border/30 ${
                isRec ? 'bg-ember/5 -mx-5 px-5 rounded' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isRec ? 'text-ember font-medium' : 'text-text-secondary'}`}>
                  {r.model}
                </span>
                {isRec && <span className="text-[10px] bg-ember/20 text-ember px-1.5 py-0.5 rounded-full font-semibold">Recommended</span>}
              </div>
              <span className="text-sm font-mono text-right text-text-primary">
                ${cost.toFixed(0)}/mo
              </span>
              <span className={`text-sm font-mono text-right ${
                isGpt4o ? 'text-text-muted' : diff < 0 ? 'text-success' : 'text-danger'
              }`}>
                {isGpt4o ? '—' : `${diff < 0 ? '-' : '+'}$${Math.abs(diff).toFixed(0)}/mo`}
                {!isGpt4o && (diff < 0 ? ' 💰' : ' 📈')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-success/10 rounded-lg">
        <TrendingDown className="w-4 h-4 text-success shrink-0" />
        <span className="text-sm text-success font-medium">
          Switch to {recommended.model}: Save ${(gpt4oCost - monthlyCost(recommended.costPerQuery)).toFixed(0)}/month
          (${((gpt4oCost - monthlyCost(recommended.costPerQuery)) * 12).toFixed(0)}/year)
        </span>
      </div>
    </div>
  );
}
