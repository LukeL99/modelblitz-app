import { Link } from 'react-router-dom';
import { BarChart3, Share2 } from 'lucide-react';
import Footer from '../components/layout/Footer';
import RecommendationCard from '../components/report/RecommendationCard';
import { FullRankedTable } from '../components/report/RankedTable';
import CostChart from '../components/report/CostChart';
import LatencyChart from '../components/report/LatencyChart';
import AccuracyCostScatter from '../components/report/AccuracyCostScatter';
import CostCalculator from '../components/report/CostCalculator';
import RawOutputs from '../components/report/RawOutputs';
import { benchmarkConfig } from '../data/mockBenchmark';

export default function SharedReportPage() {
  return (
    <div className="min-h-screen bg-void">
      {/* Shared banner */}
      <div className="bg-ember/10 border-b border-ember/20 px-4 py-3">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-ember" />
            <span className="text-sm text-text-secondary">
              This report was generated with <span className="text-ember font-semibold">ModelPick</span>
            </span>
          </div>
          <Link
            to="/benchmark"
            className="bg-ember hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
          >
            Run your own benchmark →
          </Link>
        </div>
      </div>

      {/* Simple nav */}
      <nav className="border-b border-surface-border bg-void px-4 py-3">
        <div className="max-w-[1200px] mx-auto">
          <Link to="/" className="flex items-center gap-2 text-text-primary font-bold text-lg">
            <BarChart3 className="w-6 h-6 text-ember" />
            <span>ModelPick</span>
          </Link>
        </div>
      </nav>

      <div className="pt-8 pb-16 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Header */}
          <div className="bg-surface border border-surface-border rounded-xl p-5 md:p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-ember" />
              <div>
                <h1 className="text-lg font-semibold text-text-primary">Benchmark Report</h1>
                <p className="text-xs text-text-muted">
                  Generated: {benchmarkConfig.date} · {benchmarkConfig.totalModels} models · {benchmarkConfig.totalRuns} runs
                </p>
              </div>
            </div>
          </div>

          <RecommendationCard />

          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">All Models Ranked</h2>
            <FullRankedTable />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Detailed Comparison</h2>
            <div className="grid lg:grid-cols-2 gap-4">
              <CostChart />
              <LatencyChart />
            </div>
            <div className="mt-4">
              <AccuracyCostScatter />
            </div>
          </div>

          <CostCalculator />
          <RawOutputs />
        </div>
      </div>
      <Footer />
    </div>
  );
}
