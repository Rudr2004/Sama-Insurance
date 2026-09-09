import { useState, useMemo } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { VEHICLE_CLASSES, getOptionLabel, getModelsForMake } from '../../config/parameters.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Button } from '../../components/common/Button.jsx';
import { PolicyDetailModal } from './PolicyDetailModal.jsx';

function modelLabel(make, model) {
  const found = getModelsForMake(make).find((m) => m.value === model);
  return found ? found.label : model;
}

export function PolicyBrowse() {
  const { state } = useStore();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const insurerName = (id) => state.insurers.find((i) => i.id === id)?.name ?? id;
  const insurerShortCode = (id) => state.insurers.find((i) => i.id === id)?.shortCode ?? '';

  const visiblePolicies = useMemo(() => {
    return state.policies.filter((p) => p.active && (categoryFilter === 'all' || p.category === categoryFilter));
  }, [state.policies, categoryFilter]);

  return (
    <Card>
      <CardHeader
        title="Browse Insurance Policies"
        subtitle="Published policy certificates — full policy, vehicle, IDV, and premium detail, exactly as issued."
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

        {visiblePolicies.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-6 text-center">No published policies in this category yet.</p>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap">Insurer</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap">Vehicle</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap">Fuel Type</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">Cubic Capacity</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">Seating</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap">Policy Type</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">IDV</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">Final Premium</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {visiblePolicies.map((policy) => (
                  <tr key={policy.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0">
                          {(insurerShortCode(policy.insurerId) || insurerName(policy.insurerId)).charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{insurerName(policy.insurerId)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">
                      {getOptionLabel('vehicleMake', policy.vehicleMake)} {modelLabel(policy.vehicleMake, policy.vehicleModel)}
                      {policy.vehicleVariant ? ` (${policy.vehicleVariant})` : ''}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{getOptionLabel('fuelType', policy.fuelType)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-600 whitespace-nowrap">
                      {policy.cubicCapacity ? `${policy.cubicCapacity} cc` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-600 whitespace-nowrap">{policy.seatingCapacity ?? '—'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <Badge tone="slate">{getOptionLabel('policyType', policy.policyType)}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-600 whitespace-nowrap">
                      {policy.idv ? `₹${policy.idv.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                      ₹{policy.premium.finalPremium.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <Button size="sm" variant="primary" onClick={() => setSelectedPolicy(policy)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
