import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { modelResults } from '../../data/mockBenchmark';

type SortKey = 'rank' | 'accuracy' | 'avgLatency' | 'costPerQuery' | 'composite';

function ScoreBadge({ score }: { score: number }) {
  let colorClass = 'bg-danger/15 text-danger';
  if (score >= 80) colorClass = 'bg-success/15 text-success';
  else if (score >= 50) colorClass = 'bg-warning/15 text-warning';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
      {score}
    </span>
  );
}

export default function RankedTable() {
  const [sortKey, setSortKey] = useState<SortKey>('composite');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...modelResults].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  // For rank and cost, default ascending; for scores, default descending
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'rank' || key === 'avgLatency' || key === 'costPerQuery');
    }
  };

  const columns: { key: SortKey; label: string; align: string }[] = [
    { key: 'rank', label: 'Rank', align: 'text-left' },
    { key: 'accuracy', label: 'Accuracy', align: 'text-right' },
    { key: 'avgLatency', label: 'Latency', align: 'text-right' },
    { key: 'costPerQuery', label: 'Cost/Query', align: 'text-right' },
    { key: 'composite', label: 'Score', align: 'text-right' },
  ];

  return (
    <div className="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-raised">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-[0.05em] cursor-pointer hover:text-text-secondary transition-colors ${col.align} ${
                    col.key === 'rank' ? 'w-16' : ''
                  }`}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <ArrowUpDown className="w-3 h-3 text-ember" />
                    )}
                  </span>
                </th>
              ))}
              {/* Model + provider columns not sortable */}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.model}
                className={`border-b border-surface-border/50 hover:bg-surface-raised/50 transition-colors ${
                  r.rank === 1 ? 'bg-ember/[0.03] border-l-[3px] border-l-ember' : ''
                }`}
              >
                <td className={`px-4 py-3 font-mono ${r.rank === 1 ? 'text-ember font-semibold' : 'text-text-muted'}`}>
                  {r.rank === 1 ? '🏆' : r.rank}
                </td>
                <td className="px-4 py-3 text-right"><ScoreBadge score={r.accuracy} /></td>
                <td className="px-4 py-3 text-right font-mono text-text-secondary">{r.avgLatency}s</td>
                <td className="px-4 py-3 text-right font-mono text-text-secondary">${r.costPerQuery}</td>
                <td className={`px-4 py-3 text-right font-mono font-semibold ${r.rank === 1 ? 'text-ember' : 'text-text-primary'}`}>
                  {r.composite}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add a second view with model names for mobile-friendliness */}
      <div className="block md:hidden px-4 py-2 text-xs text-text-muted text-center border-t border-surface-border">
        ← Scroll for more →
      </div>
    </div>
  );
}

// Extended table that shows model names
export function FullRankedTable() {
  const [sortKey, setSortKey] = useState<SortKey>('composite');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...modelResults].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'rank' || key === 'avgLatency' || key === 'costPerQuery');
    }
  };

  return (
    <div className="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-surface-raised">
              <th className="px-4 py-3 text-left text-[11px] font-medium text-text-muted uppercase tracking-[0.05em] w-12 cursor-pointer" onClick={() => handleSort('rank')}>
                <span className="inline-flex items-center gap-1"># {sortKey === 'rank' && <ArrowUpDown className="w-3 h-3 text-ember" />}</span>
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-text-muted uppercase tracking-[0.05em]">Model</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-text-muted uppercase tracking-[0.05em]">Provider</th>
              <th className="px-4 py-3 text-right text-[11px] font-medium text-text-muted uppercase tracking-[0.05em] cursor-pointer" onClick={() => handleSort('accuracy')}>
                <span className="inline-flex items-center gap-1 justify-end">Accuracy {sortKey === 'accuracy' && <ArrowUpDown className="w-3 h-3 text-ember" />}</span>
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium text-text-muted uppercase tracking-[0.05em] cursor-pointer" onClick={() => handleSort('avgLatency')}>
                <span className="inline-flex items-center gap-1 justify-end">Latency {sortKey === 'avgLatency' && <ArrowUpDown className="w-3 h-3 text-ember" />}</span>
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium text-text-muted uppercase tracking-[0.05em] cursor-pointer" onClick={() => handleSort('costPerQuery')}>
                <span className="inline-flex items-center gap-1 justify-end">Cost/Query {sortKey === 'costPerQuery' && <ArrowUpDown className="w-3 h-3 text-ember" />}</span>
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium text-text-muted uppercase tracking-[0.05em] cursor-pointer" onClick={() => handleSort('composite')}>
                <span className="inline-flex items-center gap-1 justify-end">Score {sortKey === 'composite' && <ArrowUpDown className="w-3 h-3 text-ember" />}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.model}
                className={`border-b border-surface-border/50 hover:bg-surface-raised/50 transition-colors ${
                  r.rank === 1 ? 'bg-ember/[0.03] border-l-[3px] border-l-ember' : ''
                }`}
              >
                <td className={`px-4 py-3 font-mono ${r.rank === 1 ? 'text-ember font-semibold' : 'text-text-muted'}`}>
                  {r.rank === 1 ? '🏆' : r.rank}
                </td>
                <td className={`px-4 py-3 font-medium ${r.rank === 1 ? 'text-text-primary' : 'text-text-secondary'}`}>{r.model}</td>
                <td className="px-4 py-3 text-text-muted text-xs">{r.provider}</td>
                <td className="px-4 py-3 text-right">
                  <ScoreBadge score={r.accuracy} />
                </td>
                <td className="px-4 py-3 text-right font-mono text-text-secondary">{r.avgLatency}s</td>
                <td className="px-4 py-3 text-right font-mono text-text-secondary">${r.costPerQuery}</td>
                <td className={`px-4 py-3 text-right font-mono font-semibold ${r.rank === 1 ? 'text-ember' : 'text-text-primary'}`}>
                  {r.composite}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
