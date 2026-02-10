import { Trophy, DollarSign } from 'lucide-react';
import { recommendationText, modelResults } from '../../data/mockBenchmark';

export default function RecommendationCard() {
  const winner = modelResults[0];

  return (
    <div className="bg-surface border border-ember rounded-xl p-6 md:p-8 animate-pulse-glow">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-ember" />
        <span className="text-xs font-bold text-ember uppercase tracking-wider">Our Recommendation</span>
      </div>

      <h3 className="text-2xl font-bold text-text-primary mb-2">{recommendationText.title}</h3>

      <div className="flex flex-wrap gap-4 md:gap-6 mb-4">
        <div>
          <span className="text-xs text-text-muted">Accuracy</span>
          <p className="text-lg font-mono font-semibold text-success">{winner.accuracy}/100</p>
        </div>
        <div>
          <span className="text-xs text-text-muted">Speed</span>
          <p className="text-lg font-mono font-semibold text-text-primary">{winner.avgLatency}s</p>
        </div>
        <div>
          <span className="text-xs text-text-muted">Cost</span>
          <p className="text-lg font-mono font-semibold text-text-primary">${winner.costPerQuery}/query</p>
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed mb-4">
        {recommendationText.summary}
      </p>

      <ul className="space-y-1.5 mb-4">
        {recommendationText.bullets.map((b, i) => (
          <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
            <span className="text-ember mt-0.5">•</span>
            {b}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 px-4 py-3 bg-success/10 rounded-lg">
        <DollarSign className="w-4 h-4 text-success" />
        <span className="text-sm text-success font-medium">{recommendationText.savings}</span>
      </div>

      {/* Honorable mentions */}
      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        {recommendationText.honorable.map((h) => (
          <div key={h.title} className="bg-surface-raised border border-surface-border rounded-lg p-3">
            <p className="text-xs font-semibold text-ember mb-1">{h.title}</p>
            <p className="text-sm font-medium text-text-primary mb-1">{h.model}</p>
            <p className="text-xs text-text-muted leading-relaxed">{h.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
