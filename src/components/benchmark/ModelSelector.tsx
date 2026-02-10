import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { allModels } from '../../data/mockBenchmark';

interface Props {
  selected: string[];
  onChange: (models: string[]) => void;
}

export default function ModelSelector({ selected, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  const tiers = ['Premium', 'Mid', 'Budget'] as const;

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((m) => m !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const selectAll = () => onChange(allModels.map((m) => m.name));
  const selectNone = () => onChange([]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-text-primary">Models to Test</label>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-ember hover:text-ember-light transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Collapse' : 'Customize'}
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <p className="text-xs text-text-muted mb-3">
        Testing {selected.length} models across all price tiers
      </p>

      {expanded && (
        <div className="bg-surface-raised border border-surface-border rounded-xl p-4 space-y-5">
          <div className="flex gap-3 text-xs">
            <button type="button" onClick={selectAll} className="text-ember hover:text-ember-light">Select All</button>
            <button type="button" onClick={selectNone} className="text-text-muted hover:text-text-secondary">Deselect All</button>
          </div>
          {tiers.map((tier) => (
            <div key={tier}>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{tier}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allModels
                  .filter((m) => m.tier === tier)
                  .map((m) => (
                    <label
                      key={m.name}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        selected.includes(m.name)
                          ? 'border-ember/30 bg-ember/5'
                          : 'border-surface-border hover:bg-surface/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(m.name)}
                        onChange={() => toggle(m.name)}
                        className="accent-ember w-3.5 h-3.5"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-text-primary">{m.name}</span>
                        <span className="text-xs text-text-muted ml-2">{m.provider}</span>
                      </div>
                      <span className="text-xs font-mono text-text-muted">{m.pricePerQuery}</span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
