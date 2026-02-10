import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const features = [
  '20+ models tested',
  '3 runs per model',
  'Accuracy scoring',
  'Cost & latency data',
  'Top recommendation',
  'Shareable link',
  'PDF export',
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex justify-center">
        <div className="bg-surface border border-surface-border rounded-xl p-8 md:p-10 max-w-sm w-full text-center">
          <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">One Report</p>
          <p className="mt-3 text-5xl font-bold text-text-primary">$9.99</p>

          <ul className="mt-8 space-y-3 text-left">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-text-secondary">
                <Check className="w-4 h-4 text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            to="/benchmark"
            className="block mt-8 bg-ember hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-base px-6 py-3.5 rounded-lg transition-colors"
          >
            Run a Benchmark →
          </Link>

          <p className="mt-6 text-text-muted text-xs">
            Coming soon: $19/mo for monthly re-benchmarking
          </p>
        </div>
      </div>
    </section>
  );
}
