import { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { ConditionTreeBuilder } from '../../components/conditionBuilder/ConditionTreeBuilder.jsx';
import { makeEmptyGroup } from '../../components/conditionBuilder/conditionTreeUtils.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { FormField, TextInput, Select } from '../../components/common/FormField.jsx';

const SCOPE_TYPE_OPTIONS = [
  { value: 'rto', label: 'RTO-specific rule' },
  { value: 'vehicleParam', label: 'Vehicle/policy parameter rule' },
];

function emptyRule() {
  return {
    name: '',
    insurerId: 'ALL',
    scopeType: 'vehicleParam',
    priority: 50,
    active: true,
    conditionTree: makeEmptyGroup('AND'),
    outcome: { type: 'percentage', value: '' },
    effectiveFrom: '',
    effectiveTo: '',
  };
}

export function RuleForm({ initialRule, onDone }) {
  const { state, addRule, updateRule } = useStore();
  const [rule, setRule] = useState(initialRule ? { ...initialRule } : emptyRule());

  const isEdit = Boolean(initialRule?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rule.name.trim() || rule.outcome.value === '') return;
    const payload = {
      ...rule,
      priority: Number(rule.priority) || 0,
      outcome: { ...rule.outcome, value: Number(rule.outcome.value) },
      effectiveFrom: rule.effectiveFrom || null,
      effectiveTo: rule.effectiveTo || null,
    };
    if (isEdit) {
      updateRule(payload);
    } else {
      addRule(payload);
    }
    onDone();
  };

  return (
    <Card>
      <CardHeader
        title={isEdit ? `Edit Rule: ${initialRule.name}` : 'New Commission Rule'}
        subtitle="Build a condition tree, then set what commission it produces."
      />
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Rule name" required hint="Shown to admins in the rule list — keep it descriptive.">
              <TextInput
                value={rule.name}
                onChange={(e) => setRule({ ...rule, name: e.target.value })}
                placeholder="e.g. Ahmedabad RTO — Two-Wheeler boost"
                autoFocus
              />
            </FormField>
            <FormField label="Applies to insurer" required>
              <Select value={rule.insurerId} onChange={(e) => setRule({ ...rule, insurerId: e.target.value })}>
                <option value="ALL">All insurers</option>
                {state.insurers.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Rule scope"
              required
              hint="Determines this rule's precedence tier (RTO rules outrank general parameter rules)."
            >
              <Select value={rule.scopeType} onChange={(e) => setRule({ ...rule, scopeType: e.target.value })}>
                {SCOPE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Priority" required hint="Lower number = evaluated first, within the same tier.">
              <TextInput
                type="number"
                value={rule.priority}
                onChange={(e) => setRule({ ...rule, priority: e.target.value })}
              />
            </FormField>
            <FormField label="Active">
              <div className="flex items-center h-[38px]">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={rule.active}
                    onChange={(e) => setRule({ ...rule, active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  Enabled
                </label>
              </div>
            </FormField>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">Condition tree</span>
            <ConditionTreeBuilder
              conditionTree={rule.conditionTree}
              onChange={(conditionTree) => setRule({ ...rule, conditionTree })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField label="Outcome type" required>
              <Select
                value={rule.outcome.type}
                onChange={(e) => setRule({ ...rule, outcome: { ...rule.outcome, type: e.target.value } })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat amount (₹)</option>
              </Select>
            </FormField>
            <FormField label={rule.outcome.type === 'percentage' ? 'Commission %' : 'Commission ₹'} required>
              <TextInput
                type="number"
                step="0.1"
                value={rule.outcome.value}
                onChange={(e) => setRule({ ...rule, outcome: { ...rule.outcome, value: e.target.value } })}
                placeholder={rule.outcome.type === 'percentage' ? 'e.g. 12' : 'e.g. 1500'}
              />
            </FormField>
            <FormField label="Effective from" hint="Optional">
              <TextInput
                type="date"
                value={rule.effectiveFrom || ''}
                onChange={(e) => setRule({ ...rule, effectiveFrom: e.target.value })}
              />
            </FormField>
            <FormField label="Effective to" hint="Optional">
              <TextInput
                type="date"
                value={rule.effectiveTo || ''}
                onChange={(e) => setRule({ ...rule, effectiveTo: e.target.value })}
              />
            </FormField>
          </div>
        </CardBody>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEdit ? 'Save Changes' : 'Create Rule'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
