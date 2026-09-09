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
import { FormField, TextInput, TextArea, Select } from '../../components/common/FormField.jsx';

function emptyPolicy() {
  return {
    insurerId: '',
    policyNumber: '',
    certificateNumber: '',
    category: '',
    policyType: '',

    insuredName: '',
    insuredAddress: '',
    insuredMobile: '',
    insuredEmail: '',

    vehicleMake: '',
    vehicleModel: '',
    vehicleVariant: '',
    registrationNumber: '',
    engineNumber: '',
    chassisNumber: '',
    cubicCapacity: '',
    seatingCapacity: '',
    yearOfManufacture: '',
    registrationDate: '',
    rto: '',
    fuelType: '',

    idv: '',
    idvVehicle: '',
    idvAccessories: '',
    idvElectricalFittings: '',
    idvNonElectricalFittings: '',

    odPremium: '',
    tpPremium: '',
    addonPremium: '',
    gstPercent: '18',
    totalDiscountPercent: '',

    ncbPercent: '',
    previousInsurer: '',
    hypothecationBank: '',

    policyIssueDate: '',
    periodFrom: '',
    periodTo: '',

    claimSettlementRatio: '',
    cashlessGarages: '',
    active: true,
  };
}

function flattenPolicy(policy) {
  return {
    ...emptyPolicy(),
    ...policy,
    idvVehicle: policy.idvBreakup?.vehicle ?? '',
    idvAccessories: policy.idvBreakup?.accessories ?? '',
    idvElectricalFittings: policy.idvBreakup?.electricalFittings ?? '',
    idvNonElectricalFittings: policy.idvBreakup?.nonElectricalFittings ?? '',
    odPremium: policy.premium?.odPremium ?? '',
    tpPremium: policy.premium?.tpPremium ?? '',
    addonPremium: policy.premium?.addonPremium ?? '',
    gstPercent: policy.premium?.gstPercent ?? '18',
    totalDiscountPercent: policy.premium?.totalDiscountPercent ?? '',
  };
}

export function PolicyForm({ initialPolicy, onDone }) {
  const { state, addPolicy, updatePolicy } = useStore();
  const isEdit = Boolean(initialPolicy?.id);
  const [form, setForm] = useState(() => (initialPolicy ? flattenPolicy(initialPolicy) : emptyPolicy()));

  const makes = useMemo(() => getMakesForClass(form.category), [form.category]);
  const models = useMemo(() => getModelsForMake(form.vehicleMake), [form.vehicleMake]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.insurerId || !form.policyNumber.trim() || !form.insuredName.trim() || !form.registrationNumber.trim()) return;

    const num = (v) => (v === '' ? undefined : Number(v));

    const odPremium = num(form.odPremium) ?? 0;
    const tpPremium = num(form.tpPremium) ?? 0;
    const addonPremium = num(form.addonPremium) ?? 0;
    const gstPercent = num(form.gstPercent) ?? 18;
    const netPremium = odPremium + tpPremium + addonPremium;
    const gstAmount = Math.round(((odPremium + addonPremium) * gstPercent) / 100 + (tpPremium * gstPercent) / 100);
    const finalPremium = Math.round(netPremium + gstAmount);

    const payload = {
      id: initialPolicy?.id,
      insurerId: form.insurerId,
      policyNumber: form.policyNumber.trim(),
      certificateNumber: form.certificateNumber.trim(),
      category: form.category,
      policyType: form.policyType,

      insuredName: form.insuredName.trim(),
      insuredAddress: form.insuredAddress.trim(),
      insuredMobile: form.insuredMobile.trim(),
      insuredEmail: form.insuredEmail.trim(),

      vehicleMake: form.vehicleMake,
      vehicleModel: form.vehicleModel,
      vehicleVariant: form.vehicleVariant.trim(),
      registrationNumber: form.registrationNumber.trim().toUpperCase(),
      engineNumber: form.engineNumber.trim().toUpperCase(),
      chassisNumber: form.chassisNumber.trim().toUpperCase(),
      cubicCapacity: num(form.cubicCapacity),
      seatingCapacity: num(form.seatingCapacity),
      yearOfManufacture: num(form.yearOfManufacture),
      registrationDate: form.registrationDate || null,
      rto: form.rto,
      fuelType: form.fuelType,

      idv: num(form.idv) ?? 0,
      idvBreakup:
        form.idvVehicle || form.idvAccessories || form.idvElectricalFittings || form.idvNonElectricalFittings
          ? {
              vehicle: num(form.idvVehicle) ?? 0,
              accessories: num(form.idvAccessories) ?? 0,
              electricalFittings: num(form.idvElectricalFittings) ?? 0,
              nonElectricalFittings: num(form.idvNonElectricalFittings) ?? 0,
            }
          : null,

      premium: {
        odPremium,
        tpPremium,
        addonPremium,
        netPremium,
        gstPercent,
        gstAmount,
        finalPremium,
        totalDiscountPercent: num(form.totalDiscountPercent) ?? 0,
      },

      ncbPercent: num(form.ncbPercent) ?? 0,
      previousInsurer: form.previousInsurer.trim(),
      hypothecationBank: form.hypothecationBank.trim(),

      policyIssueDate: form.policyIssueDate || null,
      periodFrom: form.periodFrom || null,
      periodTo: form.periodTo || null,

      claimSettlementRatio: num(form.claimSettlementRatio),
      cashlessGarages: num(form.cashlessGarages) ?? 0,
      active: form.active,
    };

    if (isEdit) {
      updatePolicy(payload);
    } else {
      addPolicy(payload);
    }
    onDone();
  };

  return (
    <Card>
      <CardHeader
        title={isEdit ? `Edit Policy Certificate: ${initialPolicy.policyNumber}` : 'Upload New Policy Certificate'}
        subtitle="Enter the details exactly as they appear on the insurer's Certificate cum Policy Schedule."
      />
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Policy</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <FormField label="Policy number" required>
                <TextInput value={form.policyNumber} onChange={(e) => set({ policyNumber: e.target.value })} placeholder="e.g. 231702312310000060" />
              </FormField>
              <FormField label="Certificate number">
                <TextInput
                  value={form.certificateNumber}
                  onChange={(e) => set({ certificateNumber: e.target.value })}
                  placeholder="e.g. 2317/PVT CAR/1234567/00/000"
                />
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
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Insured (Policyholder)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Insured name" required>
                <TextInput value={form.insuredName} onChange={(e) => set({ insuredName: e.target.value })} placeholder="e.g. Arjun Mehta" />
              </FormField>
              <FormField label="Address">
                <TextArea value={form.insuredAddress} onChange={(e) => set({ insuredAddress: e.target.value })} rows={2} />
              </FormField>
              <FormField label="Mobile">
                <TextInput value={form.insuredMobile} onChange={(e) => set({ insuredMobile: e.target.value })} />
              </FormField>
              <FormField label="Email">
                <TextInput type="email" value={form.insuredEmail} onChange={(e) => set({ insuredEmail: e.target.value })} />
              </FormField>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Vehicle</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Vehicle class" required>
                <Select value={form.category} onChange={(e) => set({ category: e.target.value, vehicleMake: '', vehicleModel: '' })}>
                  <option value="">Select…</option>
                  {VEHICLE_CLASSES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Make" required>
                <Select value={form.vehicleMake} onChange={(e) => set({ vehicleMake: e.target.value, vehicleModel: '' })} disabled={!form.category}>
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
              <FormField label="Variant">
                <TextInput value={form.vehicleVariant} onChange={(e) => set({ vehicleVariant: e.target.value })} placeholder="e.g. VXI" />
              </FormField>

              <FormField label="Registration number" required>
                <TextInput value={form.registrationNumber} onChange={(e) => set({ registrationNumber: e.target.value })} placeholder="e.g. GJ01AX7070" />
              </FormField>
              <FormField label="Engine number">
                <TextInput value={form.engineNumber} onChange={(e) => set({ engineNumber: e.target.value })} />
              </FormField>
              <FormField label="Chassis number">
                <TextInput value={form.chassisNumber} onChange={(e) => set({ chassisNumber: e.target.value })} />
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
              <FormField label="Year of manufacture">
                <TextInput type="number" value={form.yearOfManufacture} onChange={(e) => set({ yearOfManufacture: e.target.value })} />
              </FormField>

              <FormField label="Registration date">
                <TextInput type="date" value={form.registrationDate} onChange={(e) => set({ registrationDate: e.target.value })} />
              </FormField>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Insured's Declared Value (IDV)</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <FormField label="Total IDV (₹)" required>
                <TextInput type="number" value={form.idv} onChange={(e) => set({ idv: e.target.value })} />
              </FormField>
              <FormField label="Vehicle (₹)" hint="Optional breakup">
                <TextInput type="number" value={form.idvVehicle} onChange={(e) => set({ idvVehicle: e.target.value })} />
              </FormField>
              <FormField label="Accessories (₹)">
                <TextInput type="number" value={form.idvAccessories} onChange={(e) => set({ idvAccessories: e.target.value })} />
              </FormField>
              <FormField label="Electrical fittings (₹)">
                <TextInput type="number" value={form.idvElectricalFittings} onChange={(e) => set({ idvElectricalFittings: e.target.value })} />
              </FormField>
              <FormField label="Non-electrical fittings (₹)">
                <TextInput type="number" value={form.idvNonElectricalFittings} onChange={(e) => set({ idvNonElectricalFittings: e.target.value })} />
              </FormField>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Premium Schedule (₹)</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <FormField label="Own Damage (OD) premium">
                <TextInput type="number" value={form.odPremium} onChange={(e) => set({ odPremium: e.target.value })} />
              </FormField>
              <FormField label="Third-Party (TP) / liability premium">
                <TextInput type="number" value={form.tpPremium} onChange={(e) => set({ tpPremium: e.target.value })} />
              </FormField>
              <FormField label="Add-on premium total">
                <TextInput type="number" value={form.addonPremium} onChange={(e) => set({ addonPremium: e.target.value })} />
              </FormField>
              <FormField label="GST %">
                <TextInput type="number" value={form.gstPercent} onChange={(e) => set({ gstPercent: e.target.value })} />
              </FormField>
              <FormField label="Total discount (%)">
                <TextInput type="number" value={form.totalDiscountPercent} onChange={(e) => set({ totalDiscountPercent: e.target.value })} />
              </FormField>
            </div>
            <p className="text-xs text-slate-400 mt-2">Net premium, GST amount, and final premium are calculated automatically on save.</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">No Claim Bonus & Prior Insurance</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="NCB (%)">
                <TextInput type="number" value={form.ncbPercent} onChange={(e) => set({ ncbPercent: e.target.value })} />
              </FormField>
              <FormField label="Previous insurer">
                <TextInput value={form.previousInsurer} onChange={(e) => set({ previousInsurer: e.target.value })} placeholder="e.g. New Policy" />
              </FormField>
              <FormField label="Hypothecation / financier" hint="Bank name, if vehicle is on loan">
                <TextInput value={form.hypothecationBank} onChange={(e) => set({ hypothecationBank: e.target.value })} />
              </FormField>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Policy Dates & Service Metrics</p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <FormField label="Policy issue date">
                <TextInput type="date" value={form.policyIssueDate} onChange={(e) => set({ policyIssueDate: e.target.value })} />
              </FormField>
              <FormField label="Period of insurance — from" required>
                <TextInput type="date" value={form.periodFrom} onChange={(e) => set({ periodFrom: e.target.value })} />
              </FormField>
              <FormField label="Period of insurance — to" required>
                <TextInput type="date" value={form.periodTo} onChange={(e) => set({ periodTo: e.target.value })} />
              </FormField>
              <FormField label="Claim settlement ratio (%)">
                <TextInput type="number" step="0.1" value={form.claimSettlementRatio} onChange={(e) => set({ claimSettlementRatio: e.target.value })} />
              </FormField>
              <FormField label="Cashless garages">
                <TextInput type="number" value={form.cashlessGarages} onChange={(e) => set({ cashlessGarages: e.target.value })} />
              </FormField>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set({ active: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Published (visible to agents/users)
          </label>
        </CardBody>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEdit ? 'Save Changes' : 'Upload Policy Certificate'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
