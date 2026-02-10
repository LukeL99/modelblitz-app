import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Clock } from 'lucide-react';
import { MODELS } from '../data/models';

interface ModelProgress {
  model: string;
  provider: string;
  status: 'queued' | 'running' | 'done';
  progress: number; // 0-50
  correct?: number;
}

export default function ProcessingPage() {
  const navigate = useNavigate();
  const RUNS_PER_MODEL = 50;
  const TOTAL_RUNS = MODELS.length * RUNS_PER_MODEL;

  const [models, setModels] = useState<ModelProgress[]>(
    MODELS.map(m => ({ model: m.model, provider: m.provider, status: 'queued', progress: 0 }))
  );

  const completedRuns = models.reduce((sum, m) => sum + m.progress, 0);
  const doneModels = models.filter(m => m.status === 'done').length;

  const navigateToReport = useCallback(() => {
    navigate('/report/demo-123');
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      
      setModels(prev => {
        const next = [...prev];
        
        // Find the current running model (or start the first one)
        let runningIdx = next.findIndex(m => m.status === 'running');
        
        if (runningIdx === -1) {
          // Start first queued model
          const firstQueued = next.findIndex(m => m.status === 'queued');
          if (firstQueued === -1) {
            clearInterval(interval);
            return next;
          }
          next[firstQueued] = { ...next[firstQueued], status: 'running', progress: 0 };
          return next;
        }

        const model = next[runningIdx];
        const modelData = MODELS[runningIdx];
        const newProgress = Math.min(RUNS_PER_MODEL, model.progress + Math.ceil(RUNS_PER_MODEL / 3));

        if (newProgress >= RUNS_PER_MODEL) {
          // Model done
          next[runningIdx] = {
            ...model,
            status: 'done',
            progress: RUNS_PER_MODEL,
            correct: modelData.correct,
          };
          // Start next
          const nextQueued = next.findIndex(m => m.status === 'queued');
          if (nextQueued !== -1) {
            next[nextQueued] = { ...next[nextQueued], status: 'running', progress: 0 };
          }
          
          // Check if all done
          if (next.every(m => m.status === 'done')) {
            clearInterval(interval);
            setTimeout(navigateToReport, 1000);
          }
        } else {
          next[runningIdx] = { ...model, progress: newProgress };
        }

        return next;
      });
    }, 500);

    // Force complete and navigate after 15 seconds
    const forceComplete = setTimeout(() => {
      clearInterval(interval);
      setModels(prev => prev.map((m, i) => ({
        ...m,
        status: 'done' as const,
        progress: RUNS_PER_MODEL,
        correct: MODELS[i].correct,
      })));
      setTimeout(navigateToReport, 800);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(forceComplete);
    };
  }, [navigateToReport]);

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Running your benchmark...</h1>
          <p className="text-text-secondary text-sm">
            Testing model {Math.min(doneModels + 1, MODELS.length)} of {MODELS.length}...
            ({completedRuns}/{TOTAL_RUNS} runs complete)
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-text-muted mb-2">
            <span>{Math.round((completedRuns / TOTAL_RUNS) * 100)}% complete</span>
            <span>{doneModels}/{MODELS.length} models done</span>
          </div>
          <div className="h-2.5 bg-surface-raised rounded-full overflow-hidden">
            <div
              className="h-full bg-ember rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(completedRuns / TOTAL_RUNS) * 100}%` }}
            />
          </div>
        </div>

        {/* Model list */}
        <div className="bg-surface border border-surface-border rounded-xl p-4 max-h-[480px] overflow-y-auto">
          <div className="space-y-1">
            {models.map((m) => (
              <div
                key={m.model}
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all ${
                  m.status === 'running' ? 'bg-ember/5' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {m.status === 'done' && <CheckCircle className="w-4 h-4 text-success shrink-0" />}
                  {m.status === 'running' && <Loader2 className="w-4 h-4 text-ember animate-spin shrink-0" />}
                  {m.status === 'queued' && <Clock className="w-4 h-4 text-text-muted shrink-0" />}
                  <div className="min-w-0">
                    <span className={`text-sm block truncate ${
                      m.status === 'done' ? 'text-text-secondary' :
                      m.status === 'running' ? 'text-text-primary font-medium' :
                      'text-text-muted'
                    }`}>
                      {m.model}
                    </span>
                    <span className="text-xs text-text-muted">{m.provider}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {m.status === 'running' && (
                    <div className="w-20 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ember rounded-full transition-all duration-300"
                        style={{ width: `${(m.progress / RUNS_PER_MODEL) * 100}%` }}
                      />
                    </div>
                  )}
                  {m.status === 'done' && m.correct !== undefined && (
                    <span className={`text-xs font-mono font-semibold ${
                      m.correct >= 90 ? 'text-success' : m.correct >= 75 ? 'text-warning' : 'text-danger'
                    }`}>
                      {m.correct}%
                    </span>
                  )}
                  {m.status === 'queued' && (
                    <span className="text-xs text-text-muted">Queued</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <p className="mt-4 text-center text-xs text-text-muted italic">
          This usually takes 8-12 minutes. We're running an accelerated demo.
        </p>
      </div>
    </div>
  );
}
