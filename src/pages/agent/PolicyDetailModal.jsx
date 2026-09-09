import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { getOptionLabel } from '../../config/parameters.js';

export function PolicyDetailModal({ policy, insurerName, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge tone="brand">{insurerName}</Badge>
              <Badge tone="slate">{getOptionLabel('vehicleClass', policy.category)}</Badge>
            </div>
            <h3 className="font-semibold text-lg text-slate-900">{policy.name}</h3>
            {policy.tagline && <p className="text-sm text-slate-500 mt-0.5">{policy.tagline}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none px-1">
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 text-center">
              <p className="text-xs text-slate-400">Starting premium</p>
              <p className="font-bold text-slate-900">₹{policy.premiumStartingAt}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 text-center">
              <p className="text-xs text-slate-400">IDV range</p>
              <p className="font-bold text-slate-900">{policy.idvRangeLabel || '—'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5 text-center">
              <p className="text-xs text-slate-400">Claim settlement</p>
              <p className="font-bold text-slate-900">{policy.claimSettlementRatio != null ? `${policy.claimSettlementRatio}%` : '—'}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-2">What's covered</h4>
            <ul className="space-y-1.5">
              {policy.coverageHighlights.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-slate-700">
                  <span className="text-emerald-600 shrink-0">✓</span>
                  {item}
                </li>
              ))}
              {policy.coverageHighlights.length === 0 && <p className="text-sm text-slate-400 italic">Not specified.</p>}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-2">Features & add-ons</h4>
            <div className="flex flex-wrap gap-1.5">
              {policy.features.map((item, idx) => (
                <Badge key={idx} tone="violet">
                  {item}
                </Badge>
              ))}
              {policy.features.length === 0 && <p className="text-sm text-slate-400 italic">Not specified.</p>}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-2">Exclusions</h4>
            <ul className="space-y-1.5">
              {policy.exclusions.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-slate-600">
                  <span className="text-red-500 shrink-0">✕</span>
                  {item}
                </li>
              ))}
              {policy.exclusions.length === 0 && <p className="text-sm text-slate-400 italic">Not specified.</p>}
            </ul>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
