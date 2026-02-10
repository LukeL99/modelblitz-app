import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How does accuracy scoring work?',
    a: 'We use embedding-based semantic similarity to compare model outputs against your expected output. For JSON, we also check schema compliance and data extraction accuracy.',
  },
  {
    q: 'Which models do you test?',
    a: 'We test 20+ models including GPT-5.2, GPT-4o, Claude Sonnet 4.5, Gemini 3 Pro, DeepSeek V3, Mistral Large 2, Llama 4, and more across OpenAI, Anthropic, Google, Meta, Mistral, Cohere, DeepSeek, and Amazon.',
  },
  {
    q: 'How long does a benchmark take?',
    a: 'Usually 2-4 minutes depending on prompt length and model response times.',
  },
  {
    q: 'Do I need an API key?',
    a: 'Nope. We handle everything. Just paste your prompt and pay.',
  },
  {
    q: 'Can I test multimodal prompts?',
    a: 'Not yet — text-only for now. Multimodal coming soon.',
  },
  {
    q: 'Can I re-run a benchmark?',
    a: 'Each report is a one-time run. Want monthly re-benchmarks? Our subscription plan is coming soon.',
  },
  {
    q: 'What if I\'m not satisfied?',
    a: 'If we fail to deliver your report, full refund. No questions.',
  },
  {
    q: 'Is my prompt data private?',
    a: 'Your prompts are only used for benchmarking and are deleted after 30 days. We never train on your data or share it.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20">
      <div className="max-w-[720px] mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-[32px] font-semibold text-center text-text-primary tracking-[-0.01em] mb-12">
          FAQ
        </h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-surface-border rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-raised/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="text-sm font-medium text-text-primary pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
