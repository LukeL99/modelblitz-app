import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import CriteriaSliders from '../components/benchmark/CriteriaSliders';
import ModelSelector from '../components/benchmark/ModelSelector';
import { benchmarkConfig, allModels } from '../data/mockBenchmark';

const outputTypes = ['Free Text', 'JSON', 'Code', 'Classification', 'Extraction'];

export default function BenchmarkPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(benchmarkConfig.prompt);
  const [exampleInput, setExampleInput] = useState(benchmarkConfig.exampleInput);
  const [expectedOutput, setExpectedOutput] = useState(benchmarkConfig.expectedOutput);
  const [outputType, setOutputType] = useState('JSON');
  const [weights, setWeights] = useState(benchmarkConfig.weights);
  const [selectedModels, setSelectedModels] = useState(allModels.map((m) => m.name));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 10) {
      setError('Prompt must be at least 10 characters');
      return;
    }
    if (selectedModels.length < 5) {
      setError('Select at least 5 models');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      navigate('/benchmark/demo/progress');
    }, 800);
  };

  const handleWeightChange = (key: 'accuracy' | 'speed' | 'cost', value: number) => {
    setWeights((w) => ({ ...w, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <div className="pt-24 pb-32 px-4 md:px-6">
        <div className="max-w-[720px] mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-ember text-white text-xs font-bold flex items-center justify-center">1</span>
              <span className="text-sm font-medium text-text-primary">Input</span>
            </div>
            <div className="flex-1 h-px bg-surface-border" />
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-surface-raised text-text-muted text-xs font-bold flex items-center justify-center border border-surface-border">2</span>
              <span className="text-sm text-text-muted">Pay</span>
            </div>
            <div className="flex-1 h-px bg-surface-border" />
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-surface-raised text-text-muted text-xs font-bold flex items-center justify-center border border-surface-border">3</span>
              <span className="text-sm text-text-muted">Results</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Your Prompt</label>
              <p className="text-xs text-text-muted mb-2">Paste your system prompt and/or user prompt</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20 resize-y"
                placeholder="You are a helpful assistant that extracts product data from descriptions..."
              />
              <p className="text-xs text-text-muted text-right mt-1">{prompt.length} characters</p>
            </div>

            {/* Example Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Example Input Data</label>
              <p className="text-xs text-text-muted mb-2">Sample data your prompt will process. Leave blank if not needed.</p>
              <textarea
                value={exampleInput}
                onChange={(e) => setExampleInput(e.target.value)}
                rows={4}
                className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20 resize-y"
                placeholder="Nike Air Max 90, Men's Running Shoe, $129.99..."
              />
            </div>

            {/* Expected Output */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Expected Output
                <span className="ml-2 px-2 py-0.5 bg-ember/10 text-ember text-[10px] font-semibold rounded-full">Recommended</span>
              </label>
              <p className="text-xs text-text-muted mb-2">What should the ideal response look like? Used for accuracy scoring.</p>
              <textarea
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                rows={4}
                className="w-full bg-surface border border-surface-border rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/20 resize-y"
                placeholder='{"name": "Nike Air Max 90", "category": "Running Shoe", ...}'
              />
            </div>

            {/* Output Type */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">Output Type</label>
              <div className="flex flex-wrap gap-2">
                {outputTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOutputType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      outputType === type
                        ? 'bg-ember text-white'
                        : 'bg-surface border border-surface-border text-text-secondary hover:bg-surface-raised'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Criteria Weights */}
            <CriteriaSliders weights={weights} onChange={handleWeightChange} />

            {/* Model Selector */}
            <ModelSelector selected={selectedModels} onChange={setSelectedModels} />

            {/* Error */}
            {error && (
              <p className="text-sm text-danger">{error}</p>
            )}

            {/* Submit */}
            <div className="bg-surface border border-surface-border rounded-xl p-5 sticky bottom-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-ember" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Ready to benchmark</p>
                    <p className="text-xs text-text-muted">{selectedModels.length} models · 3 runs each · ~3 min</p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-ember hover:bg-orange-600 active:bg-orange-700 disabled:opacity-70 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    'Pay $9.99 & Run Benchmark →'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
