import { Link } from 'react-router-dom';
import { modelResults } from '../../data/mockBenchmark';

export default function ReportPreview() {
  const top5 = modelResults.slice(0, 5);

  return (
    <section className="py-20 bg-surface/50">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-[32px] font-semibold text-text-primary tracking-[-0.01em]">
            See a Real Report
          </h2>
          <p className="mt-3 text-text-secondary">
            From a benchmark on a product description extraction prompt
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-surface border border-surface-border rounded-xl p-5 md:p-6">
          {/* Mini table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  <th className="text-left py-2 text-[11px] font-medium text-text-muted uppercase tracking-wider w-12">#</th>
                  <th className="text-left py-2 text-[11px] font-medium text-text-muted uppercase tracking-wider">Model</th>
                  <th className="text-right py-2 text-[11px] font-medium text-text-muted uppercase tracking-wider">Accuracy</th>
                  <th className="text-right py-2 text-[11px] font-medium text-text-muted uppercase tracking-wider">Cost</th>
                  <th className="text-right py-2 text-[11px] font-medium text-text-muted uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody>
                {top5.map((r) => (
                  <tr
                    key={r.model}
                    className={`border-b border-surface-border/50 ${
                      r.rank === 1 ? 'bg-ember/5' : ''
                    }`}
                  >
                    <td className={`py-2.5 font-mono text-sm ${r.rank === 1 ? 'text-ember' : 'text-text-muted'}`}>
                      {r.rank === 1 ? '🏆' : r.rank}
                    </td>
                    <td className={`py-2.5 ${r.rank === 1 ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                      {r.model}
                    </td>
                    <td className="py-2.5 text-right font-mono text-text-secondary">{r.accuracy}</td>
                    <td className="py-2.5 text-right font-mono text-text-secondary">${r.costPerQuery}</td>
                    <td className={`py-2.5 text-right font-mono font-semibold ${r.rank === 1 ? 'text-ember' : 'text-text-secondary'}`}>
                      {r.composite}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              to="/report/demo"
              className="text-ember hover:text-ember-light text-sm font-medium transition-colors"
            >
              See Full Example Report →
            </Link>
            <Link
              to="/benchmark"
              className="bg-ember hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              Run Your Own — $9.99 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
