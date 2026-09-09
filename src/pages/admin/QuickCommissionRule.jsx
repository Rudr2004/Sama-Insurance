import { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { useToast } from '../../components/common/ToastContext.jsx';
import { RTO_OPTIONS, VEHICLE_MAKES, getOptionLabel } from '../../config/parameters.js';
import { summarizeConditionTree } from '../../engine/ruleSummary.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { FormField, TextInput, Select } from '../../components/common/FormField.jsx';

const ANY_AGENT = 'ANY';

function buildConditionTree({ rtoList, vehicleMakeList }) {
  const conditions = [];
  if (rtoList.length > 0) conditions.push({ field: 'rto', operator: 'in', value: rtoList });
  if (vehicleMakeList.length > 0) conditions.push({ field: 'vehicleMake', operator: 'in', value: vehicleMakeList });
  return { logic: 'AND', conditions };
}

function emptyForm() {
  return {
    insurerId: 'ALL',
    rtoList: [],
    vehicleMakeList: [],
    agentId: ANY_AGENT,
    outcomeType: 'percentage',
    outcomeValue: '',
    priority: 5,
  };
}

export function QuickCommissionRule() {
  const { state, addRule, addOverride, deleteRule, deleteOverride } = useStore();
  const toast = useToast();
  const [form, setForm] = useState(emptyForm());

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleInList = (listKey, value) => {
    setForm((f) => {
      const list = f[listKey];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...f, [listKey]: next };
    });
  };

  const canSubmit =
    (form.rtoList.length > 0 || form.vehicleMakeList.length > 0) && form.outcomeValue !== '' && !Number.isNaN(Number(form.outcomeValue));

  // Rules/overrides created by this shortcut are tagged so they can be
  // listed and removed from this screen without touching manually-built ones.
  const isQuickRule = (r) => r.createdVia === 'quickRule';
  const quickRules = state.rules.filter(isQuickRule);
  const quickOverrides = state.agentOverrides.filter(isQuickRule);

  const insurerName = (id) => (id === 'ALL' ? 'All insurers' : state.insurers.find((i) => i.id === id)?.name ?? id);
  const agentName = (id) => state.agents.find((a) => a.id === id)?.name ?? id;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error('Missing required fields', 'Select at least one RTO or Vehicle Company, and enter a commission value.');
      return;
    }

    const conditionTree = buildConditionTree(form);
    const outcome = { type: form.outcomeType, value: Number(form.outcomeValue) };
    const rtoLabel = form.rtoList.length ? form.rtoList.join(', ') : 'any RTO';
    const makeLabel = form.vehicleMakeList.length
      ? form.vehicleMakeList.map((v) => getOptionLabel('vehicleMake', v)).join(', ')
      : 'any vehicle company';

    try {
      if (form.agentId === ANY_AGENT) {
        addRule({
          name: `Quick rule: ${rtoLabel} + ${makeLabel}`,
          insurerId: form.insurerId,
          scopeType: 'rto',
          priority: Number(form.priority) || 5,
          active: true,
          conditionTree,
          outcome,
          effectiveFrom: null,
          effectiveTo: null,
          createdVia: 'quickRule',
        });
        toast.success('Quick rule created', `${rtoLabel} + ${makeLabel} is now live.`);
      } else {
        addOverride({
          agentId: form.agentId,
          name: `Quick override: ${agentName(form.agentId)} — ${rtoLabel} + ${makeLabel}`,
          insurerId: form.insurerId,
          conditionTree: conditionTree.conditions.length > 0 ? conditionTree : null,
          outcome,
          createdVia: 'quickRule',
        });
        toast.success('Quick override created', `Broker override saved for ${agentName(form.agentId)}.`);
      }
      setForm(emptyForm());
    } catch (err) {
      toast.error('Could not create quick rule', err?.message);
    }
  };

  const handleRemoveOverride = (ov) => {
    try {
      deleteOverride(ov.id);
      toast.success('Override removed', `"${ov.name}" was deleted.`);
    } catch (err) {
      toast.error('Could not remove override', err?.message);
    }
  };

  const handleRemoveRule = (r) => {
    try {
      deleteRule(r.id);
      toast.success('Rule removed', `"${r.name}" was deleted.`);
    } catch (err) {
      toast.error('Could not remove rule', err?.message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Quick Commission Rule"
          subtitle="Set commission by RTO + Vehicle Company (Make) + Broker/Agent in one step — the shortcut for this common combination."
        />
        <form onSubmit={handleSubmit}>
          <CardBody className="space-y-5">
            <FormField label="Applies to insurer" required>
              <Select value={form.insurerId} onChange={(e) => set({ insurerId: e.target.value })}>
                <option value="ALL">All insurers</option>
                {state.insurers.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <div>
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
                RTO <span className="text-xs text-slate-400 font-normal">(leave empty for any RTO)</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {RTO_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleInList('rtoList', opt.value)}
                    className={`text-xs px-2.5 py-1.5 rounded-full font-medium border transition-colors ${
                      form.rtoList.includes(opt.value)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
                Vehicle Company (Make) <span className="text-xs text-slate-400 font-normal">(leave empty for any company)</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {VEHICLE_MAKES.map((make) => (
                  <button
                    key={make.value}
                    type="button"
                    onClick={() => toggleInList('vehicleMakeList', make.value)}
                    className={`text-xs px-2.5 py-1.5 rounded-full font-medium border transition-colors ${
                      form.vehicleMakeList.includes(make.value)
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {make.label}
                  </button>
                ))}
              </div>
            </div>

            <FormField
              label="Broker / Agent"
              required
              hint="Choosing a specific agent creates the highest-precedence agent override; 'Any' creates a standard RTO-tier rule."
            >
              <Select value={form.agentId} onChange={(e) => set({ agentId: e.target.value })}>
                <option value={ANY_AGENT}>Any broker / agent</option>
                {state.agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                    {a.designation ? ` — ${a.designation}` : ''}
                    {a.branch ? ` (${a.branch})` : ''}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Outcome type" required>
                <Select value={form.outcomeType} onChange={(e) => set({ outcomeType: e.target.value })}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat amount (₹)</option>
                </Select>
              </FormField>
              <FormField label={form.outcomeType === 'percentage' ? 'Commission %' : 'Commission ₹'} required>
                <TextInput
                  type="number"
                  step="0.1"
                  value={form.outcomeValue}
                  onChange={(e) => set({ outcomeValue: e.target.value })}
                  placeholder="e.g. 12"
                />
              </FormField>
              {form.agentId === ANY_AGENT && (
                <FormField label="Priority" hint="Lower number evaluated first, within the RTO tier">
                  <TextInput type="number" value={form.priority} onChange={(e) => set({ priority: e.target.value })} />
                </FormField>
              )}
            </div>

            <div className="rounded-lg bg-slate-900 text-slate-100 px-4 py-3 text-sm font-mono leading-relaxed">
              <span className="text-slate-400">IF </span>
              {summarizeConditionTree(buildConditionTree(form)) || <span className="text-slate-500">always</span>}
              {form.agentId !== ANY_AGENT && (
                <span className="text-slate-400"> AND broker = {agentName(form.agentId)}</span>
              )}
            </div>
          </CardBody>
          <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" disabled={!canSubmit}>
              {form.agentId === ANY_AGENT ? 'Create Rule' : 'Create Agent Override'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Quick Rules Created"
          subtitle="Rules and overrides created via this shortcut. Manage the full set under Commission Rules / Agent Overrides."
        />
        <CardBody className="space-y-3">
          {quickRules.length === 0 && quickOverrides.length === 0 && (
            <p className="text-sm text-slate-400 italic">None yet — create one above.</p>
          )}
          {quickOverrides.map((ov) => (
            <div key={ov.id} className="rounded-lg border border-violet-200 bg-violet-50/40 px-4 py-3 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="violet">Broker override</Badge>
                  <Badge tone="slate">{insurerName(ov.insurerId)}</Badge>
                  <Badge tone="brand">{ov.outcome.type === 'percentage' ? `${ov.outcome.value}%` : `₹${ov.outcome.value}`}</Badge>
                </div>
                <p className="text-sm text-slate-700 mt-1">{ov.name}</p>
              </div>
              <Button size="sm" variant="danger" onClick={() => handleRemoveOverride(ov)}>
                Remove
              </Button>
            </div>
          ))}
          {quickRules.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone="brand">RTO-specific rule</Badge>
                  <Badge tone="slate">{insurerName(r.insurerId)}</Badge>
                  <Badge tone="green">{r.outcome.type === 'percentage' ? `${r.outcome.value}%` : `₹${r.outcome.value}`}</Badge>
                </div>
                <p className="text-sm text-slate-700 mt-1">{r.name}</p>
              </div>
              <Button size="sm" variant="danger" onClick={() => handleRemoveRule(r)}>
                Remove
              </Button>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
