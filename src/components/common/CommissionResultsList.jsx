import { useState, useMemo } from 'react';
import { Badge } from './Badge.jsx';

const TIER_TONE = {
  agentOverride: 'violet',
  rto: 'brand',
  vehicleParam: 'green',
  insurerDefault: 'slate',
};

function outcomeLabel(outcome) {
  return outcome.type === 'percentage' ? `${outcome.value}%` : `₹${outcome.value}`;
}

function outcomeNumericValue(outcome) {
  // For sort-by-commission purposes; flat amounts and percentages aren't
  // directly comparable, but both trend "higher is better" for the agent.
  return outcome.value;
}

export function CommissionResultsList({ results }) {
  const [sortBy, setSortBy] = useState('commission');

  const sorted = useMemo(() => {
    const copy = [...results];
    if (sortBy === 'commission') {
      copy.sort((a, b) => outcomeNumericValue(b.outcome) - outcomeNumericValue(a.outcome));
    } else {
      copy.sort((a, b) => a.insurerName.localeCompare(b.insurerName));
    }
    return copy;
  }, [results, sortBy]);

  if (results.length === 0) {
    return <p className="text-sm text-slate-400 italic">No insurers configured.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-1">
        <span className="text-xs text-slate-400 self-center mr-1">Sort by:</span>
        {[
          { key: 'commission', label: 'Commission' },
          { key: 'insurer', label: 'Insurer name' },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
              sortBy === opt.key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((result, idx) => (
          <div
            key={result.insurerId}
            className={`rounded-xl border p-4 bg-white flex flex-col gap-3 ${
              idx === 0 && sortBy === 'commission' ? 'border-brand-400 ring-1 ring-brand-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                  {result.insurerName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-tight">{result.insurerName}</p>
                  {idx === 0 && sortBy === 'commission' && (
                    <span className="text-[11px] font-semibold text-brand-600">Best rate</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-900">{outcomeLabel(result.outcome)}</p>
              <p className="text-xs text-slate-400">{result.outcome.type === 'percentage' ? 'of premium' : 'flat commission'}</p>
            </div>

            <div className="mt-auto pt-2 border-t border-slate-100 space-y-1.5">
              <Badge tone={TIER_TONE[result.precedenceTier]}>{result.precedenceLabel}</Badge>
              <p className="text-xs text-slate-500 leading-relaxed">{result.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
