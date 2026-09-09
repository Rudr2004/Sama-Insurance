import { useState, useMemo } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import {
  VEHICLE_CLASSES,
  FUEL_TYPES,
  RTO_OPTIONS,
  DEFAULT_FUEL_BY_CLASS,
  getMakesForClass,
  getModelsForMake,
  getOptionLabel,
} from '../../config/parameters.js';
import { sortQuotesByFinalPremium, computeCommissionAmount } from '../../engine/matchQuoteGrid.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { FormField, Select } from '../../components/common/FormField.jsx';

const initialFilter = {
  vehicleClass: '',
  vehicleMake: '',
  vehicleModel: '',
  fuelType: '',
  rto: '',
};

function modelLabel(make, model) {
  const found = getModelsForMake(make).find((m) => m.value === model);
  return found ? found.label : model;
}

export function InsuranceQuotes() {
  const { state } = useStore();
  const [filter, setFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState('premium');

  const makes = useMemo(() => getMakesForClass(filter.vehicleClass), [filter.vehicleClass]);
  const models = useMemo(() => getModelsForMake(filter.vehicleMake), [filter.vehicleMake]);

  const set = (patch) => setFilter((f) => ({ ...f, ...patch }));

  const handleClassChange = (vehicleClass) => {
    const defaultFuel = DEFAULT_FUEL_BY_CLASS[vehicleClass];
    set({ vehicleClass, vehicleMake: '', vehicleModel: '', ...(defaultFuel ? { fuelType: defaultFuel } : {}) });
  };

  const clearFilters = () => setFilter(initialFilter);

  const hasActiveFilter = Object.values(filter).some(Boolean);

  const insurerName = (id) => state.insurers.find((i) => i.id === id)?.name ?? id;
  const insurerShortCode = (id) => state.insurers.find((i) => i.id === id)?.shortCode ?? '';

  const results = useMemo(() => {
    const published = state.quoteGrid.filter((row) => row.published);
    const filtered = published.filter((row) => {
      if (filter.vehicleClass && row.vehicleClass !== filter.vehicleClass) return false;
      if (filter.vehicleMake && row.vehicleMake !== filter.vehicleMake) return false;
      if (filter.vehicleModel && row.vehicleModel !== filter.vehicleModel) return false;
      if (filter.fuelType && row.fuelType !== filter.fuelType) return false;
      if (filter.rto && row.rto !== filter.rto) return false;
      return true;
    });

    if (sortBy === 'premium') return sortQuotesByFinalPremium(filtered);
    if (sortBy === 'commission') return [...filtered].sort((a, b) => computeCommissionAmount(b) - computeCommissionAmount(a));
    return [...filtered].sort((a, b) => insurerName(a.insurerId).localeCompare(insurerName(b.insurerId)));
  }, [state.quoteGrid, filter, sortBy, state.insurers]);

  const lowestPremiumId = sortQuotesByFinalPremium(results)[0]?.id;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Insurance Quotes"
          subtitle="Every published quote from the uploaded grid — narrow down by vehicle to match a specific customer, or browse everything below."
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <FormField label="Vehicle class">
              <Select value={filter.vehicleClass} onChange={(e) => handleClassChange(e.target.value)}>
                <option value="">All classes</option>
                {VEHICLE_CLASSES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Motor company (Make)">
              <Select
                value={filter.vehicleMake}
                onChange={(e) => set({ vehicleMake: e.target.value, vehicleModel: '' })}
                disabled={!filter.vehicleClass}
              >
                <option value="">All companies</option>
                {makes.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Model">
              <Select value={filter.vehicleModel} onChange={(e) => set({ vehicleModel: e.target.value })} disabled={!filter.vehicleMake}>
                <option value="">All models</option>
                {models.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Fuel type">
              <Select value={filter.fuelType} onChange={(e) => set({ fuelType: e.target.value })}>
                <option value="">All fuel types</option>
                {FUEL_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="RTO">
              <Select value={filter.rto} onChange={(e) => set({ rto: e.target.value })}>
                <option value="">All RTOs</option>
                {RTO_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          {hasActiveFilter && (
            <button onClick={clearFilters} className="text-xs font-medium text-brand-600 hover:text-brand-700">
              ✕ Clear filters
            </button>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={`${results.length} published quote${results.length === 1 ? '' : 's'}`}
          subtitle={hasActiveFilter ? 'Filtered to your selected vehicle profile.' : 'Showing the full grid — every insurer, every vehicle profile.'}
          action={
            results.length > 0 && (
              <div className="flex gap-1">
                {[
                  { key: 'premium', label: 'Lowest premium' },
                  { key: 'commission', label: 'Highest commission' },
                  { key: 'insurer', label: 'Insurer name' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      sortBy === opt.key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )
          }
        />
        <CardBody>
          {results.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-6 text-center">
              No published quotes match this filter. Try clearing a field, or ask admin to publish quotes for this vehicle.
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 font-medium whitespace-nowrap">Insurer</th>
                    <th className="px-3 py-2.5 font-medium whitespace-nowrap">Vehicle</th>
                    <th className="px-3 py-2.5 font-medium whitespace-nowrap">RTO</th>
                    <th className="px-3 py-2.5 font-medium whitespace-nowrap">Policy Type</th>
                    <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">IDV</th>
                    <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">Final Premium</th>
                    <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">Discount</th>
                    <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">Claim Settled</th>
                    <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">Cashless Garages</th>
                    <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right bg-brand-50">Your Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row) => (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${
                        row.id === lowestPremiumId && sortBy === 'premium' ? 'bg-emerald-50/60' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0">
                            {(insurerShortCode(row.insurerId) || insurerName(row.insurerId)).charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 leading-tight">{insurerName(row.insurerId)}</p>
                            {row.id === lowestPremiumId && sortBy === 'premium' && (
                              <span className="text-[10px] font-semibold text-emerald-600">Lowest premium</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">
                        {getOptionLabel('vehicleMake', row.vehicleMake)} {modelLabel(row.vehicleMake, row.vehicleModel)}
                        {row.variant ? ` (${row.variant})` : ''}
                        <div className="text-[11px] text-slate-400">{getOptionLabel('fuelType', row.fuelType)}</div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">{row.rto}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <Badge tone="slate">{getOptionLabel('policyType', row.policyType)}</Badge>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-slate-600">
                        ₹{row.idv.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono font-semibold text-slate-900">
                        ₹{row.finalPremium.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-amber-600">{row.totalDiscountPercent}%</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-slate-600">{row.claimSettlementRatio}%</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right font-mono text-slate-600">
                        {row.cashlessGarages.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-right bg-brand-50/60">
                        <p className="font-semibold text-brand-800">
                          {row.commission.type === 'percentage' ? `${row.commission.value}%` : `₹${row.commission.value}`}
                        </p>
                        <p className="text-[11px] font-mono text-brand-600">
                          ≈ ₹{computeCommissionAmount(row).toLocaleString('en-IN')}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
