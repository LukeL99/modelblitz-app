const providers = [
  'OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'Cohere', 'DeepSeek',
];

export default function ModelLogos() {
  return (
    <section className="py-16 border-t border-b border-surface-border">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 text-center">
        <p className="text-text-muted text-sm mb-8">
          20+ models across every price tier — from $0.0001 to $0.06 per 1K tokens
        </p>
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {providers.map((p) => (
            <div
              key={p}
              className="px-4 py-2 bg-surface-raised rounded-lg border border-surface-border text-text-secondary text-sm font-medium"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
