import { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { RuleForm } from './RuleForm.jsx';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { summarizeRule } from '../../engine/ruleSummary.js';
import { PRECEDENCE_TIERS } from '../../engine/evaluateCommission.js';

const TIER_BADGE_TONE = {
  rto: 'violet',
  vehicleParam: 'brand',
};

export function RuleList() {
  const { state, deleteRule, duplicateRule, toggleRuleActive } = useStore();
  const [view, setView] = useState({ mode: 'list' }); // { mode: 'list' } | { mode: 'create' } | { mode: 'edit', rule }

  const insurerName = (id) => (id === 'ALL' ? 'All insurers' : state.insurers.find((i) => i.id === id)?.name ?? id);

  const sortedRules = [...state.rules].sort((a, b) => a.priority - b.priority);

  if (view.mode === 'create') {
    return <RuleForm onDone={() => setView({ mode: 'list' })} />;
  }
  if (view.mode === 'edit') {
    return <RuleForm initialRule={view.rule} onDone={() => setView({ mode: 'list' })} />;
  }

  return (
    <Card>
      <CardHeader
        title="Commission Rules"
        subtitle="All rules, evaluated by precedence tier then priority. Lower priority number runs first within a tier."
        action={
          <Button variant="primary" onClick={() => setView({ mode: 'create' })}>
            + New Rule
          </Button>
        }
      />
      <CardBody className="space-y-3">
        {sortedRules.length === 0 && <p className="text-sm text-slate-400 italic">No rules configured yet.</p>}
        {sortedRules.map((rule) => (
          <div
            key={rule.id}
            className={`rounded-lg border px-4 py-3 ${rule.active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900">{rule.name}</h3>
                  <Badge tone={TIER_BADGE_TONE[rule.scopeType] || 'slate'}>{PRECEDENCE_TIERS[rule.scopeType]?.label ?? rule.scopeType}</Badge>
                  <Badge tone="slate">{insurerName(rule.insurerId)}</Badge>
                  <Badge tone="slate">Priority {rule.priority}</Badge>
                  {!rule.active && <Badge tone="red">Disabled</Badge>}
                  {(rule.effectiveFrom || rule.effectiveTo) && (
                    <Badge tone="amber">
                      {rule.effectiveFrom || '…'} → {rule.effectiveTo || '…'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 font-mono mt-1.5 break-words">{summarizeRule(rule)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => setView({ mode: 'edit', rule })}>
                  Edit
                </Button>
                <Button size="sm" onClick={() => duplicateRule(rule.id)}>
                  Duplicate
                </Button>
                <Button size="sm" onClick={() => toggleRuleActive(rule.id)}>
                  {rule.active ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Delete rule "${rule.name}"?`)) deleteRule(rule.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
