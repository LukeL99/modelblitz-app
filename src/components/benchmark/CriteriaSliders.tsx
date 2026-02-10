import { Target, Zap, DollarSign } from 'lucide-react';

interface Props {
  weights: { accuracy: number; speed: number; cost: number };
  onChange: (key: 'accuracy' | 'speed' | 'cost', value: number) => void;
}

const sliders = [
  { key: 'accuracy' as const, label: 'Accuracy', icon: Target },
  { key: 'speed' as const, label: 'Speed', icon: Zap },
  { key: 'cost' as const, label: 'Cost', icon: DollarSign },
];

function getPriorityText(w: Props['weights']) {
  const items = [
    { label: 'accuracy', val: w.accuracy },
    { label: 'speed', val: w.speed },
    { label: 'cost', val: w.cost },
  ].sort((a, b) => b.val - a.val);

  if (items[0].val === items[1].val && items[1].val === items[2].val) {
    return 'Balanced across all criteria';
  }
  const top = items.filter(i => i.val >= items[0].val - 1).map(i => i.label);
  const bottom = items.filter(i => i.val <= items[2].val + 1).map(i => i.label);
  return `Prioritizing ${top.join(' and ')} over ${bottom.join(' and ')}`;
}

export default function CriteriaSliders({ weights, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">What matters most to you?</label>
      <p className="text-xs text-text-muted mb-4">{getPriorityText(weights)}</p>
      <div className="grid sm:grid-cols-3 gap-6">
        {sliders.map(({ key, label, icon: Icon }) => (
          <div key={key}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-ember" />
              <span className="text-sm text-text-secondary">{label}</span>
              <span className="ml-auto text-sm font-mono font-semibold text-ember">{weights[key]}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={weights[key]}
              onChange={(e) => onChange(key, parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
