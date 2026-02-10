import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Clock } from 'lucide-react';
import { modelResults } from '../data/mockBenchmark';

type ModelStatus = 'queued' | 'running' | 'done';

interface ModelProgress {
  model: string;
  status: ModelStatus;
  latency?: number;
}

export default function ProcessingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ModelProgress[]>(
    modelResults.map((r) => ({ model: r.model, status: 'queued' }))
  );
  const [, setCurrentIndex] = useState(0);
  const [overallPercent, setOverallPercent] = useState(0);

  useEffect(() => {
    const total = modelResults.length;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next > total) {
          clearInterval(interval);
          // Navigate to report after short delay
          setTimeout(() => navigate('/report/demo'), 800);
          return prev;
        }

        setProgress((models) =>
          models.map((m, i) => {
            if (i < next) return { ...m, status: 'done' as ModelStatus, latency: modelResults[i].avgLatency };
            if (i === next) return { ...m, status: 'running' as ModelStatus };
            return m;
          })
        );

        setOverallPercent(Math.round((next / total) * 100));
        return next;
      });
    }, 350);

    // Start first model immediately
    setProgress((models) =>
      models.map((m, i) => (i === 0 ? { ...m, status: 'running' as ModelStatus } : m))
    );

    return () => clearInterval(interval);
  }, [navigate]);

  const doneCount = progress.filter((m) => m.status === 'done').length;
  const total = modelResults.length;

  // Top 3 leaderboard from completed models
  const completed = progress
    .filter((m) => m.status === 'done')
    .map((m) => {
      const data = modelResults.find((r) => r.model === m.model)!;
      return { ...m, composite: data.composite };
    })
    .sort((a, b) => b.composite - a.composite)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Running your benchmark...</h1>
          <p className="text-text-secondary text-sm">
            Testing model {Math.min(doneCount + 1, total)} of {total}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-text-muted mb-2">
            <span>{overallPercent}% complete</span>
            <span>~{Math.max(0, Math.ceil((total - doneCount) * 0.35 / 60))} min remaining</span>
          </div>
          <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
            <div
              className="h-full bg-ember rounded-full transition-all duration-300 ease-out"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* Live leaderboard */}
        {completed.length > 0 && (
          <div className="bg-surface border border-surface-border rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-ember uppercase tracking-wider mb-3">Live Leaderboard</p>
            {completed.map((m, i) => (
              <div key={m.model} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-text-secondary">
                  <span className="font-mono text-text-muted mr-2">{i + 1}.</span>
                  {m.model}
                </span>
                <span className="text-sm font-mono text-ember font-semibold">{m.composite}</span>
              </div>
            ))}
          </div>
        )}

        {/* Model list */}
        <div className="bg-surface border border-surface-border rounded-xl p-4 max-h-[320px] overflow-y-auto">
          <div className="space-y-1">
            {progress.map((m) => (
              <div
                key={m.model}
                className={`flex items-center justify-between py-2 px-2 rounded transition-all ${
                  m.status === 'running' ? 'bg-ember/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {m.status === 'done' && <CheckCircle className="w-4 h-4 text-success" />}
                  {m.status === 'running' && <Loader2 className="w-4 h-4 text-ember animate-spin" />}
                  {m.status === 'queued' && <Clock className="w-4 h-4 text-text-muted" />}
                  <span className={`text-sm ${
                    m.status === 'done' ? 'text-text-secondary' :
                    m.status === 'running' ? 'text-text-primary font-medium' :
                    'text-text-muted'
                  }`}>
                    {m.model}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {m.latency !== undefined && (
                    <span className="font-mono text-text-muted">{m.latency}s</span>
                  )}
                  <span className={`${
                    m.status === 'done' ? 'text-success' :
                    m.status === 'running' ? 'text-ember' :
                    'text-text-muted'
                  }`}>
                    {m.status === 'done' ? 'Done' : m.status === 'running' ? 'Running' : 'Queued'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
