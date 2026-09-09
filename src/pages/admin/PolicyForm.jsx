import { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { VEHICLE_CLASSES } from '../../config/parameters.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FormField, TextInput, TextArea, Select } from '../../components/common/FormField.jsx';
import { ListEditor } from '../../components/common/ListEditor.jsx';

function emptyPolicy() {
  return {
    insurerId: '',
    name: '',
    category: '',
    tagline: '',
    premiumStartingAt: '',
    idvRangeLabel: '',
    coverageHighlights: [''],
    features: [''],
    exclusions: [''],
    claimSettlementRatio: '',
    active: true,
  };
}

export function PolicyForm({ initialPolicy, onDone }) {
  const { state, addPolicy, updatePolicy } = useStore();
  const [policy, setPolicy] = useState(initialPolicy ? { ...initialPolicy } : emptyPolicy());

  const isEdit = Boolean(initialPolicy?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!policy.name.trim() || !policy.insurerId || !policy.category) return;
    const payload = {
      ...policy,
      premiumStartingAt: Number(policy.premiumStartingAt) || 0,
      claimSettlementRatio: policy.claimSettlementRatio === '' ? null : Number(policy.claimSettlementRatio),
      coverageHighlights: policy.coverageHighlights.map((s) => s.trim()).filter(Boolean),
      features: policy.features.map((s) => s.trim()).filter(Boolean),
      exclusions: policy.exclusions.map((s) => s.trim()).filter(Boolean),
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
        title={isEdit ? `Edit Policy: ${initialPolicy.name}` : 'Upload New Policy'}
        subtitle="Add a customer-facing insurance plan — what agents and users will browse and compare."
      />
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Policy / plan name" required>
              <TextInput
                value={policy.name}
                onChange={(e) => setPolicy({ ...policy, name: e.target.value })}
                placeholder="e.g. Complete Shield Comprehensive Car Insurance"
                autoFocus
              />
            </FormField>
            <FormField label="Insurer" required>
              <Select value={policy.insurerId} onChange={(e) => setPolicy({ ...policy, insurerId: e.target.value })}>
                <option value="">Select insurer…</option>
                {state.insurers.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Vehicle category" required>
              <Select value={policy.category} onChange={(e) => setPolicy({ ...policy, category: e.target.value })}>
                <option value="">Select category…</option>
                {VEHICLE_CLASSES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Tagline" hint="One-line pitch shown on the catalog card">
              <TextInput
                value={policy.tagline}
                onChange={(e) => setPolicy({ ...policy, tagline: e.target.value })}
                placeholder="e.g. Own-damage + third-party cover with cashless garages"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Starting premium (₹)" required>
              <TextInput
                type="number"
                value={policy.premiumStartingAt}
                onChange={(e) => setPolicy({ ...policy, premiumStartingAt: e.target.value })}
                placeholder="e.g. 2499"
              />
            </FormField>
            <FormField label="IDV range" hint="Optional, e.g. ₹2L – ₹25L">
              <TextInput
                value={policy.idvRangeLabel}
                onChange={(e) => setPolicy({ ...policy, idvRangeLabel: e.target.value })}
              />
            </FormField>
            <FormField label="Claim settlement ratio (%)" hint="Optional">
              <TextInput
                type="number"
                step="0.1"
                value={policy.claimSettlementRatio}
                onChange={(e) => setPolicy({ ...policy, claimSettlementRatio: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ListEditor
              label="Coverage highlights"
              items={policy.coverageHighlights}
              onChange={(coverageHighlights) => setPolicy({ ...policy, coverageHighlights })}
              placeholder="e.g. Zero depreciation cover"
            />
            <ListEditor
              label="Features / add-ons"
              items={policy.features}
              onChange={(features) => setPolicy({ ...policy, features })}
              placeholder="e.g. Roadside assistance"
            />
            <ListEditor
              label="Exclusions"
              items={policy.exclusions}
              onChange={(exclusions) => setPolicy({ ...policy, exclusions })}
              placeholder="e.g. Driving without a license"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={policy.active}
              onChange={(e) => setPolicy({ ...policy, active: e.target.checked })}
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
            {isEdit ? 'Save Changes' : 'Upload Policy'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
