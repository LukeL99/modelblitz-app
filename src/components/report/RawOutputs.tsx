import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { topModelRunDetails, benchmarkConfig } from '../../data/mockBenchmark';

export default function RawOutputs() {
  const [showDetails, setShowDetails] = useState(false);
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="space-y-3">
      {/* Per-run details */}
      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-raised/50 transition-colors"
          onClick={() => setShowDetails(!showDetails)}
        >
          <span className="text-sm font-medium text-text-primary">Per-Run Details — Claude Sonnet 4.5</span>
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>
        {showDetails && (
          <div className="px-5 pb-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="py-2 text-left text-[11px] font-medium text-text-muted uppercase tracking-wider">Metric</th>
                    <th className="py-2 text-right text-[11px] font-medium text-text-muted uppercase tracking-wider">Run 1</th>
                    <th className="py-2 text-right text-[11px] font-medium text-text-muted uppercase tracking-wider">Run 2</th>
                    <th className="py-2 text-right text-[11px] font-medium text-text-muted uppercase tracking-wider">Run 3</th>
                    <th className="py-2 text-right text-[11px] font-medium text-text-muted uppercase tracking-wider">Avg</th>
                    <th className="py-2 text-right text-[11px] font-medium text-text-muted uppercase tracking-wider">Std Dev</th>
                  </tr>
                </thead>
                <tbody>
                  {topModelRunDetails.map((row) => (
                    <tr key={row.metric} className="border-b border-surface-border/30">
                      <td className="py-2 text-text-secondary">{row.metric}</td>
                      <td className="py-2 text-right font-mono text-text-secondary">{row.run1}</td>
                      <td className="py-2 text-right font-mono text-text-secondary">{row.run2}</td>
                      <td className="py-2 text-right font-mono text-text-secondary">{row.run3}</td>
                      <td className="py-2 text-right font-mono text-text-primary font-medium">{row.average}</td>
                      <td className="py-2 text-right font-mono text-text-muted">{row.stdDev}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Original input */}
      <div className="bg-surface border border-surface-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-raised/50 transition-colors"
          onClick={() => setShowInput(!showInput)}
        >
          <span className="text-sm font-medium text-text-primary">Your Input</span>
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showInput ? 'rotate-180' : ''}`} />
        </button>
        {showInput && (
          <div className="px-5 pb-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Prompt</p>
              <pre className="bg-surface-raised border border-surface-border rounded-lg p-3 text-xs font-mono text-text-secondary whitespace-pre-wrap">{benchmarkConfig.prompt}</pre>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Example Input</p>
              <pre className="bg-surface-raised border border-surface-border rounded-lg p-3 text-xs font-mono text-text-secondary whitespace-pre-wrap">{benchmarkConfig.exampleInput}</pre>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Expected Output</p>
              <pre className="bg-surface-raised border border-surface-border rounded-lg p-3 text-xs font-mono text-text-secondary whitespace-pre-wrap">{benchmarkConfig.expectedOutput}</pre>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Criteria Weights</p>
              <div className="flex gap-4 text-sm">
                <span className="text-text-secondary">Accuracy: <span className="font-mono text-ember">{benchmarkConfig.weights.accuracy}</span></span>
                <span className="text-text-secondary">Speed: <span className="font-mono text-ember">{benchmarkConfig.weights.speed}</span></span>
                <span className="text-text-secondary">Cost: <span className="font-mono text-ember">{benchmarkConfig.weights.cost}</span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
