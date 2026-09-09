import { useState, useMemo } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import {
  VEHICLE_CLASSES,
  FUEL_TYPES,
  POLICY_TYPES,
  RTO_OPTIONS,
  getMakesForClass,
  getModelsForMake,
} from '../../config/parameters.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FormField, TextInput, Select } from '../../components/common/FormField.jsx';
import { validateQuoteRow } from '../../config/quoteGridColumns.js';

function emptyRow() {
  return {
    insurerId: '',
    vehicleClass: '',
    vehicleSubclass: '',
    vehicleMake: '',
    vehicleModel: '',
    variant: '',
    fuelType: '',
    cubicCapacity: '',
    seatingCapacity: '',
    rto: '',
    vehicleAgeYears: '',
    policyType: '',
    idv: '',
    odPremium: '',
    tpPremium: '',
    addonPremium: '',
    gstAmount: '',
    finalPremium: '',
    totalDiscountPercent: '',
    cashlessGarages: '',
    claimSettlementRatio: '',
    commissionType: 'percentage',
    commissionValue: '',
  };
}

export function QuoteRowForm({ initialRow, onDone }) {
  const { state, addQuoteRow, updateQuoteRow } = useStore();
  const isEdit = Boolean(initialRow?.id);

  const [form, setForm] = useState(() => {
    if (!initialRow) return emptyRow();
    return {
      ...emptyRow(),
      ...initialRow,
      commissionType: initialRow.commission?.type ?? 'percentage',
      commissionValue: initialRow.commission?.value ?? '',
    };
  });
  const [errors, setErrors] = useState([]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const makes = useMemo(() => getMakesForClass(form.vehicleClass), [form.vehicleClass]);
  const models = useMemo(() => getModelsForMake(form.vehicleMake), [form.vehicleMake]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numeric = (v) => (v === '' ? undefined : Number(v));
    const payload = {
      id: initialRow?.id,
      insurerId: form.insurerId,
      vehicleClass: form.vehicleClass,
      vehicleSubclass: form.vehicleSubclass || undefined,
      vehicleMake: form.vehicleMake,
      vehicleModel: form.vehicleModel,
      variant: form.variant || undefined,
      fuelType: form.fuelType,
      cubicCapacity: numeric(form.cubicCapacity),
      seatingCapacity: numeric(form.seatingCapacity),
      rto: form.rto,
      vehicleAgeYears: numeric(form.vehicleAgeYears),
      policyType: form.policyType,
      idv: numeric(form.idv),
      odPremium: numeric(form.odPremium) ?? 0,
      tpPremium: numeric(form.tpPremium) ?? 0,
      addonPremium: numeric(form.addonPremium) ?? 0,
      gstAmount: numeric(form.gstAmount) ?? 0,
      finalPremium: numeric(form.finalPremium),
      totalDiscountPercent: numeric(form.totalDiscountPercent) ?? 0,
      cashlessGarages: numeric(form.cashlessGarages) ?? 0,
      claimSettlementRatio: numeric(form.claimSettlementRatio),
      commission: { type: form.commissionType, value: numeric(form.commissionValue) },
      published: initialRow?.published ?? true,
    };

    const validationErrors = validateQuoteRow(payload);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (isEdit) {
      updateQuoteRow(payload);
    } else {
      addQuoteRow(payload);
    }
    onDone();
  };

  return (
    <Card>
      <CardHeader
        title={isEdit ? 'Edit Quote Row' : 'Add Quote Row'}
        subtitle="One insurer's quote for one vehicle profile — this is what an agent will see when their search matches."
      />
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-5">
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-medium mb-1">Fix the following:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Insurer" required>
              <Select value={form.insurerId} onChange={(e) => set({ insurerId: e.target.value })}>
                <option value="">Select insurer…</option>
                {state.insurers.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Policy type" required>
              <Select value={form.policyType} onChange={(e) => set({ policyType: e.target.value })}>
                <option value="">Select…</option>
                {POLICY_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="RTO" required>
              <Select value={form.rto} onChange={(e) => set({ rto: e.target.value })}>
                <option value="">Select RTO…</option>
                {RTO_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField label="Vehicle class" required>
              <Select
                value={form.vehicleClass}
                onChange={(e) => set({ vehicleClass: e.target.value, vehicleMake: '', vehicleModel: '' })}
              >
                <option value="">Select…</option>
                {VEHICLE_CLASSES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Motor company (Make)" required>
              <Select
                value={form.vehicleMake}
                onChange={(e) => set({ vehicleMake: e.target.value, vehicleModel: '' })}
                disabled={!form.vehicleClass}
              >
                <option value="">Select…</option>
                {makes.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Model" required>
              <Select value={form.vehicleModel} onChange={(e) => set({ vehicleModel: e.target.value })} disabled={!form.vehicleMake}>
                <option value="">Select…</option>
                {models.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Variant" hint="Optional">
              <TextInput value={form.variant} onChange={(e) => set({ variant: e.target.value })} placeholder="e.g. VXI" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField label="Fuel type" required>
              <Select value={form.fuelType} onChange={(e) => set({ fuelType: e.target.value })}>
                <option value="">Select…</option>
                {FUEL_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Cubic capacity (cc)">
              <TextInput type="number" value={form.cubicCapacity} onChange={(e) => set({ cubicCapacity: e.target.value })} />
            </FormField>
            <FormField label="Seating capacity">
              <TextInput type="number" value={form.seatingCapacity} onChange={(e) => set({ seatingCapacity: e.target.value })} />
            </FormField>
            <FormField label="Vehicle age (yrs)">
              <TextInput type="number" value={form.vehicleAgeYears} onChange={(e) => set({ vehicleAgeYears: e.target.value })} />
            </FormField>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Premium & policy figures (₹)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="IDV" required>
                <TextInput type="number" value={form.idv} onChange={(e) => set({ idv: e.target.value })} />
              </FormField>
              <FormField label="OD premium">
                <TextInput type="number" value={form.odPremium} onChange={(e) => set({ odPremium: e.target.value })} />
              </FormField>
              <FormField label="TP premium">
                <TextInput type="number" value={form.tpPremium} onChange={(e) => set({ tpPremium: e.target.value })} />
              </FormField>
              <FormField label="Add-on premium total">
                <TextInput type="number" value={form.addonPremium} onChange={(e) => set({ addonPremium: e.target.value })} />
              </FormField>
              <FormField label="GST amount">
                <TextInput type="number" value={form.gstAmount} onChange={(e) => set({ gstAmount: e.target.value })} />
              </FormField>
              <FormField label="Final premium" required>
                <TextInput type="number" value={form.finalPremium} onChange={(e) => set({ finalPremium: e.target.value })} />
              </FormField>
              <FormField label="Total discount (%)">
                <TextInput type="number" value={form.totalDiscountPercent} onChange={(e) => set({ totalDiscountPercent: e.target.value })} />
              </FormField>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Service metrics</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Cashless garages">
                <TextInput type="number" value={form.cashlessGarages} onChange={(e) => set({ cashlessGarages: e.target.value })} />
              </FormField>
              <FormField label="Claim settlement ratio (%)">
                <TextInput type="number" value={form.claimSettlementRatio} onChange={(e) => set({ claimSettlementRatio: e.target.value })} />
              </FormField>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Agent commission (visible only to agents)</p>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Commission type" required>
                <Select value={form.commissionType} onChange={(e) => set({ commissionType: e.target.value })}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat amount (₹)</option>
                </Select>
              </FormField>
              <FormField label={form.commissionType === 'percentage' ? 'Commission %' : 'Commission ₹'} required>
                <TextInput type="number" step="0.1" value={form.commissionValue} onChange={(e) => set({ commissionValue: e.target.value })} />
              </FormField>
            </div>
          </div>
        </CardBody>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEdit ? 'Save Changes' : 'Add Quote Row'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
