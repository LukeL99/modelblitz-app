import { Target, Zap, DollarSign, BarChart3 } from 'lucide-react';

const cards = [
  {
    icon: Target,
    title: 'Accuracy',
    description: 'Semantic similarity to your expected output. JSON schema compliance. Format matching.',
  },
  {
    icon: Zap,
    title: 'Speed',
    description: 'Time to first token. Total response time. Tokens per second.',
  },
  {
    icon: DollarSign,
    title: 'Cost',
    description: 'Actual dollar cost per query. Monthly projection at your volume.',
  },
  {
    icon: BarChart3,
    title: 'Consistency',
    description: 'Run 3x per model. Measure variance. Flag unreliable models.',
  },
];

export default function WhatWeTest() {
  return (
    <section className="py-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-[32px] font-semibold text-center text-text-primary tracking-[-0.01em]">
          What We Test
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-surface border border-surface-border rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150"
            >
              <card.icon className="w-6 h-6 text-ember mb-4" />
              <h3 className="text-base font-semibold text-text-primary mb-2">{card.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
