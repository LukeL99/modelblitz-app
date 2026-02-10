import { ClipboardPaste, Cpu, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: ClipboardPaste,
    title: 'Paste Your Prompt',
    description: 'Drop in your prompt, example input, and expected output.',
  },
  {
    icon: Cpu,
    title: 'We Test 20+ Models',
    description: 'Your prompt runs against models from OpenAI, Anthropic, Google, Meta, Mistral & more.',
  },
  {
    icon: BarChart3,
    title: 'Get Your Report',
    description: 'Ranked results with cost, speed, and accuracy. Plus our recommendation.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-[32px] font-semibold text-center text-text-primary tracking-[-0.01em]">
          How It Works
        </h2>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-ember/10 mb-4">
                <step.icon className="w-7 h-7 text-ember" />
              </div>
              <div className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">Step {i + 1}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
