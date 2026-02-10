import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

const miniTableData = [
  { rank: 1, model: 'Claude Sonnet 4.5', score: 94.2, winner: true },
  { rank: 2, model: 'GPT-4o', score: 89.1, winner: false },
  { rank: 3, model: 'Gemini 3 Pro', score: 88.7, winner: false },
  { rank: 4, model: 'DeepSeek V3', score: 87.3, winner: false },
  { rank: 5, model: 'Claude Haiku 4.5', score: 86.1, winner: false },
];

function AnimatedNumber({ target, delay }: { target: number; delay: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 600;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        start = target * eased;
        setValue(parseFloat(start.toFixed(1)));
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay]);
  return <>{value}</>;
}

export default function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-4xl md:text-5xl lg:text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-text-primary">
              Stop overpaying<br />for AI.
            </h1>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed max-w-lg">
              Test your prompt against 20+ models. Get a ranked report with cost, speed, and accuracy scores. One report. Ten bucks.
            </p>
            <Link
              to="/benchmark"
              className="inline-block mt-8 bg-ember hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors"
            >
              Run a Benchmark — $9.99 →
            </Link>
            <p className="mt-4 text-text-muted text-sm">200+ reports generated</p>
          </div>

          {/* Right: Mini report preview */}
          <div className={`transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-surface border border-surface-border rounded-xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-ember" />
                <span className="text-xs font-semibold text-ember uppercase tracking-wider">Top Results</span>
              </div>
              <div className="space-y-0">
                {/* Header */}
                <div className="grid grid-cols-[2rem_1fr_4rem] gap-2 pb-2 border-b border-surface-border">
                  <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">#</span>
                  <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Model</span>
                  <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider text-right">Score</span>
                </div>
                {miniTableData.map((row, i) => (
                  <div
                    key={row.model}
                    className={`grid grid-cols-[2rem_1fr_4rem] gap-2 py-2.5 border-b border-surface-border/50 ${
                      row.winner ? 'bg-ember/5 -mx-5 px-5 border-l-2 border-l-ember' : ''
                    }`}
                    style={{ animationDelay: `${i * 100 + 400}ms` }}
                  >
                    <span className={`text-sm font-mono ${row.winner ? 'text-ember' : 'text-text-muted'}`}>
                      {row.winner ? '🏆' : row.rank}
                    </span>
                    <span className={`text-sm ${row.winner ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                      {row.model}
                    </span>
                    <span className={`text-sm font-mono text-right ${row.winner ? 'text-ember font-semibold' : 'text-text-secondary'}`}>
                      <AnimatedNumber target={row.score} delay={i * 150 + 500} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
