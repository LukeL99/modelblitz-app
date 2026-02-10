import { BarChart3, Share2, FileDown } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import RecommendationCard from '../components/report/RecommendationCard';
import { FullRankedTable } from '../components/report/RankedTable';
import CostChart from '../components/report/CostChart';
import LatencyChart from '../components/report/LatencyChart';
import AccuracyCostScatter from '../components/report/AccuracyCostScatter';
import CostCalculator from '../components/report/CostCalculator';
import RawOutputs from '../components/report/RawOutputs';
import { benchmarkConfig } from '../data/mockBenchmark';

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <div className="pt-24 pb-16 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Header */}
          <div className="bg-surface border border-surface-border rounded-xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-ember" />
              <div>
                <h1 className="text-lg font-semibold text-text-primary">Your Benchmark Report</h1>
                <p className="text-xs text-text-muted">
                  Generated: {benchmarkConfig.date} · {benchmarkConfig.totalModels} models · {benchmarkConfig.totalRuns} runs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-surface-border rounded-lg text-text-secondary text-sm hover:bg-surface-raised transition-colors">
                <Share2 className="w-4 h-4" />
                Share Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-surface-border rounded-lg text-text-secondary text-sm hover:bg-surface-raised transition-colors">
                <FileDown className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Recommendation */}
          <RecommendationCard />

          {/* Ranked Table */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">All Models Ranked</h2>
            <FullRankedTable />
          </div>

          {/* Charts */}
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

          {/* Cost Calculator */}
          <CostCalculator />

          {/* Raw outputs + input reference */}
          <RawOutputs />
        </div>
      </div>
      <Footer />
    </div>
  );
}
