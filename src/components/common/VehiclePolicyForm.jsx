import { useMemo } from 'react';
import {
  RTO_OPTIONS,
  VEHICLE_CLASSES,
  FUEL_TYPES,
  POLICY_TYPES,
  CASE_TYPES,
  PARAMETERS,
  DEFAULT_FUEL_BY_CLASS,
  getSubclassesForClass,
  getMakesForClass,
  getModelsForMake,
} from '../../config/parameters.js';
import { FormField, Select, TextInput } from './FormField.jsx';

function calcAgeFromDate(dateStr) {
  if (!dateStr) return '';
  const reg = new Date(dateStr);
  if (Number.isNaN(reg.getTime())) return '';
  const diffMs = Date.now() - reg.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.round(years * 10) / 10);
}

// Addon toggles rendered in their own "Addons" section, matching the
// dedicated entry-form layout rather than the generic extras grid.
const ADDON_KEYS = ['zeroDepCover', 'paOwnerCover', 'isCngLpg'];

// Additional/extensible parameters are anything in the config registry
// that isn't one of the core dedicated fields or a dedicated addon.
const CORE_KEYS = [
  'rto',
  'vehicleClass',
  'vehicleSubclass',
  'vehicleMake',
  'vehicleModel',
  'fuelType',
  'cubicCapacity',
  'seatingCapacity',
  'vehicleAge',
  'policyType',
  'caseType',
  'agentId',
  ...ADDON_KEYS,
];
const EXTRA_PARAMETERS = PARAMETERS.filter((p) => !CORE_KEYS.includes(p.key));
const ADDON_PARAMETERS = PARAMETERS.filter((p) => ADDON_KEYS.includes(p.key));

export function VehiclePolicyForm({ value, onChange, agents, showAgentField = true }) {
  const subclasses = useMemo(() => getSubclassesForClass(value.vehicleClass), [value.vehicleClass]);
  const makes = useMemo(() => getMakesForClass(value.vehicleClass), [value.vehicleClass]);
  const models = useMemo(() => getModelsForMake(value.vehicleMake), [value.vehicleMake]);

  const hasRegistrationDate = value.hasRegistrationDate !== false;

  const set = (patch) => onChange({ ...value, ...patch });

  const handleClassChange = (vehicleClass) => {
    const defaultFuel = DEFAULT_FUEL_BY_CLASS[vehicleClass];
    set({
      vehicleClass,
      vehicleSubclass: '',
      vehicleMake: '',
      vehicleModel: '',
      ...(defaultFuel ? { fuelType: defaultFuel } : {}),
    });
  };

  const handleMakeChange = (vehicleMake) => {
    set({ vehicleMake, vehicleModel: '' });
  };

  const handleRegistrationDate = (registrationDate) => {
    set({ registrationDate, vehicleAge: calcAgeFromDate(registrationDate) });
  };

  const handleHasRegistrationDateToggle = (checked) => {
    set({ hasRegistrationDate: checked, ...(checked ? {} : { registrationDate: '', vehicleAge: '' }) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Vehicle Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Vehicle class" required>
            <Select value={value.vehicleClass || ''} onChange={(e) => handleClassChange(e.target.value)}>
              <option value="">Select class…</option>
              {VEHICLE_CLASSES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Policy issue date" required>
            <TextInput
              type="date"
              value={value.policyIssueDate || ''}
              onChange={(e) => set({ policyIssueDate: e.target.value })}
            />
          </FormField>

          <FormField label="Motor company (Make)" required hint="Vehicle manufacturer">
            <Select value={value.vehicleMake || ''} onChange={(e) => handleMakeChange(e.target.value)} disabled={!value.vehicleClass}>
              <option value="">Select company…</option>
              {makes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Model" required>
            <Select value={value.vehicleModel || ''} onChange={(e) => set({ vehicleModel: e.target.value })} disabled={!value.vehicleMake}>
              <option value="">Select model…</option>
              {models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Vehicle subclass">
            <Select
              value={value.vehicleSubclass || ''}
              onChange={(e) => set({ vehicleSubclass: e.target.value })}
              disabled={!value.vehicleClass}
            >
              <option value="">Select subclass…</option>
              {subclasses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Fuel type" required>
            <Select value={value.fuelType || ''} onChange={(e) => set({ fuelType: e.target.value })}>
              <option value="">Select fuel type…</option>
              {FUEL_TYPES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Cubic capacity (cc)" required>
            <TextInput
              type="number"
              value={value.cubicCapacity || ''}
              onChange={(e) => set({ cubicCapacity: e.target.value })}
              placeholder="e.g. 1197"
            />
          </FormField>
          <FormField label="Seating capacity" required>
            <TextInput
              type="number"
              value={value.seatingCapacity || ''}
              onChange={(e) => set({ seatingCapacity: e.target.value })}
              placeholder="e.g. 5"
            />
          </FormField>

          <FormField label="Vehicle registration number" hint="Free text, for reference only">
            <TextInput
              value={value.regNumber || ''}
              onChange={(e) => set({ regNumber: e.target.value })}
              placeholder="e.g. GJ01AB1234"
            />
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Registration Details</h3>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700 mb-3">
          <input
            type="checkbox"
            checked={hasRegistrationDate}
            onChange={(e) => handleHasRegistrationDateToggle(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Has Registration Date?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasRegistrationDate && (
            <>
              <FormField label="Registration date" required hint="Vehicle age is derived automatically">
                <TextInput
                  type="date"
                  value={value.registrationDate || ''}
                  onChange={(e) => handleRegistrationDate(e.target.value)}
                />
              </FormField>
              <FormField label="Vehicle age (years)">
                <TextInput
                  type="number"
                  step="0.1"
                  value={value.vehicleAge ?? ''}
                  onChange={(e) => set({ vehicleAge: e.target.value })}
                  placeholder="Auto-filled or enter manually"
                />
              </FormField>
            </>
          )}
          <FormField label="RTO" required>
            <Select value={value.rto || ''} onChange={(e) => set({ rto: e.target.value })}>
              <option value="">Select RTO…</option>
              {RTO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Policy Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Policy type" required>
            <Select value={value.policyType || ''} onChange={(e) => set({ policyType: e.target.value })}>
              <option value="">Select policy type…</option>
              {POLICY_TYPES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Case type" required>
            <Select value={value.caseType || ''} onChange={(e) => set({ caseType: e.target.value })}>
              <option value="">Select case type…</option>
              {CASE_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </FormField>
          {showAgentField && (
            <FormField label="Agent" required hint="Determines whether an agent-specific override applies">
              <Select value={value.agentId || ''} onChange={(e) => set({ agentId: e.target.value })}>
                <option value="">Select agent…</option>
                {(agents || []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id})
                  </option>
                ))}
              </Select>
            </FormField>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Addons</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADDON_PARAMETERS.map((param) => (
            <FormField key={param.key} label={param.label} required>
              <Select value={value[param.key] || ''} onChange={(e) => set({ [param.key]: e.target.value })}>
                <option value="">Select…</option>
                {param.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>
          ))}
        </div>
      </div>

      {EXTRA_PARAMETERS.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Additional parameters</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXTRA_PARAMETERS.map((param) => (
              <FormField key={param.key} label={param.label}>
                {param.options ? (
                  <Select value={value[param.key] || ''} onChange={(e) => set({ [param.key]: e.target.value })}>
                    <option value="">Select…</option>
                    {param.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <TextInput
                    type={param.type === 'number' ? 'number' : 'text'}
                    value={value[param.key] || ''}
                    onChange={(e) => set({ [param.key]: e.target.value })}
                  />
                )}
              </FormField>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
