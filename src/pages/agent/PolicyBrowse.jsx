import { useState, useMemo } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { VEHICLE_CLASSES, getOptionLabel, getModelsForMake } from '../../config/parameters.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { PolicyDetailModal } from './PolicyDetailModal.jsx';

function modelLabel(make, model) {
  const found = getModelsForMake(make).find((m) => m.value === model);
  return found ? found.label : model;
}

const SORT_OPTIONS = [
  { key: 'premium_asc', label: 'Lowest premium' },
  { key: 'idv_desc', label: 'Highest IDV' },
  { key: 'insurer', label: 'Insurer name' },
];

// A stable, deterministic accent color per insurer (cycled), so each card
// reads as visually distinct at a glance without random re-renders.
const ACCENTS = [
  { ring: 'ring-brand-200', bar: 'bg-brand-500', chip: 'bg-brand-50 text-brand-700' },
  { ring: 'ring-violet-200', bar: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700' },
  { ring: 'ring-emerald-200', bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  { ring: 'ring-amber-200', bar: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700' },
  { ring: 'ring-rose-200', bar: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700' },
  { ring: 'ring-cyan-200', bar: 'bg-cyan-500', chip: 'bg-cyan-50 text-cyan-700' },
];
function accentFor(insurerId, insurers) {
  const idx = insurers.findIndex((i) => i.id === insurerId);
  return ACCENTS[idx % ACCENTS.length] ?? ACCENTS[0];
}

export function PolicyBrowse() {
  const { state } = useStore();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('premium_asc');
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const insurerName = (id) => state.insurers.find((i) => i.id === id)?.name ?? id;
  const insurerShortCode = (id) => state.insurers.find((i) => i.id === id)?.shortCode ?? '';

  const visiblePolicies = useMemo(() => {
    let list = state.policies.filter((p) => p.active && (categoryFilter === 'all' || p.category === categoryFilter));

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const haystack = `${insurerName(p.insurerId)} ${getOptionLabel('vehicleMake', p.vehicleMake)} ${modelLabel(p.vehicleMake, p.vehicleModel)} ${p.vehicleVariant ?? ''}`.toLowerCase();
        return haystack.includes(q);
      });
    }

    const sorted = [...list];
    if (sortBy === 'premium_asc') sorted.sort((a, b) => a.premium.finalPremium - b.premium.finalPremium);
    else if (sortBy === 'idv_desc') sorted.sort((a, b) => (b.idv || 0) - (a.idv || 0));
    else sorted.sort((a, b) => insurerName(a.insurerId).localeCompare(insurerName(b.insurerId)));
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.policies, categoryFilter, search, sortBy, state.insurers]);

  const lowestPremiumId = useMemo(() => {
    if (visiblePolicies.length === 0) return null;
    return visiblePolicies.reduce((min, p) => (p.premium.finalPremium < min.premium.finalPremium ? p : min)).id;
  }, [visiblePolicies]);

  return (
    <Card>
      <CardHeader
        title="Browse Insurance Policies"
        subtitle="Published policy certificates — compare vehicle, IDV, and premium at a glance, then open one for full detail."
      />
      <CardBody className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                categoryFilter === 'all'
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {VEHICLE_CLASSES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategoryFilter(c.value)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  categoryFilter === c.value
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative sm:ml-auto sm:w-64">
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search insurer or vehicle…"
              className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="flex gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  sortBy === opt.key ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {visiblePolicies.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm text-slate-400 italic">No published policies match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visiblePolicies.map((policy) => {
              const accent = accentFor(policy.insurerId, state.insurers);
              const isLowest = policy.id === lowestPremiumId && sortBy === 'premium_asc';
              return (
                <button
                  key={policy.id}
                  onClick={() => setSelectedPolicy(policy)}
                  className={`group relative text-left rounded-2xl border border-slate-200 bg-white overflow-hidden
                    transition-all duration-200 ease-out
                    hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10 hover:border-slate-300
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
                    ${isLowest ? `ring-2 ${accent.ring}` : ''}`}
                >
                  <div className={`h-1.5 w-full ${accent.bar}`} />

                  {isLowest && (
                    <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white text-[10px] font-semibold px-2.5 py-1 shadow-sm">
                      ★ Best price here
                    </span>
                  )}

                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${accent.chip}`}
                      >
                        {(insurerShortCode(policy.insurerId) || insurerName(policy.insurerId)).charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 leading-tight truncate">{insurerName(policy.insurerId)}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {getOptionLabel('vehicleMake', policy.vehicleMake)} {modelLabel(policy.vehicleMake, policy.vehicleModel)}
                          {policy.vehicleVariant ? ` · ${policy.vehicleVariant}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-slate-50 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Fuel</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{getOptionLabel('fuelType', policy.fuelType)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Cubic Cap.</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                          {policy.cubicCapacity ? `${policy.cubicCapacity}cc` : '—'}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Seating</p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{policy.seatingCapacity ?? '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Badge tone="slate">{getOptionLabel('policyType', policy.policyType)}</Badge>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">IDV</p>
                        <p className="text-xs font-mono font-medium text-slate-600">
                          {policy.idv ? `₹${policy.idv.toLocaleString('en-IN')}` : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Final premium</p>
                        <p className="text-2xl font-bold text-slate-900 leading-none mt-0.5">
                          ₹{policy.premium.finalPremium.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:text-brand-700 group-hover:gap-1.5 transition-all">
                        View details
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
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
