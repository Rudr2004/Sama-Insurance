import { useState, useMemo } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { VEHICLE_CLASSES } from '../../config/parameters.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { PolicyDetailModal } from './PolicyDetailModal.jsx';

export function PolicyBrowse() {
  const { state } = useStore();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const insurerName = (id) => state.insurers.find((i) => i.id === id)?.name ?? id;

  const visiblePolicies = useMemo(() => {
    return state.policies.filter((p) => p.active && (categoryFilter === 'all' || p.category === categoryFilter));
  }, [state.policies, categoryFilter]);

  return (
    <Card>
      <CardHeader
        title="Browse Insurance Policies"
        subtitle="Plans currently published by insurers — compare coverage, features, and starting premium."
      />
      <CardBody className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              categoryFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {VEHICLE_CLASSES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                categoryFilter === c.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {visiblePolicies.length === 0 && <p className="text-sm text-slate-400 italic">No published policies in this category yet.</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visiblePolicies.map((policy) => (
            <div key={policy.id} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge tone="brand">{insurerName(policy.insurerId)}</Badge>
                  <h3 className="font-semibold text-slate-900 mt-1.5 leading-snug">{policy.name}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                  {insurerName(policy.insurerId).charAt(0)}
                </div>
              </div>

              {policy.tagline && <p className="text-sm text-slate-600">{policy.tagline}</p>}

              <ul className="space-y-1">
                {policy.coverageHighlights.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex gap-1.5 text-xs text-slate-600">
                    <span className="text-emerald-600 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Starting at</p>
                  <p className="font-bold text-slate-900">₹{policy.premiumStartingAt}</p>
                </div>
                <Button size="sm" variant="primary" onClick={() => setSelectedPolicy(policy)}>
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardBody>

      {selectedPolicy && (
        <PolicyDetailModal
          policy={selectedPolicy}
          insurerName={insurerName(selectedPolicy.insurerId)}
          onClose={() => setSelectedPolicy(null)}
        />
      )}
    </Card>
  );
}
