import { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { PolicyForm } from './PolicyForm.jsx';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { getOptionLabel } from '../../config/parameters.js';

export function PolicyCatalog() {
  const { state, deletePolicy, togglePolicyActive } = useStore();
  const [view, setView] = useState({ mode: 'list' });

  const insurerName = (id) => state.insurers.find((i) => i.id === id)?.name ?? id;

  if (view.mode === 'create') {
    return <PolicyForm onDone={() => setView({ mode: 'list' })} />;
  }
  if (view.mode === 'edit') {
    return <PolicyForm initialPolicy={view.policy} onDone={() => setView({ mode: 'list' })} />;
  }

  return (
    <Card>
      <CardHeader
        title="Policy Catalog"
        subtitle="Insurance plans uploaded for agents and users to browse — separate from commission rules."
        action={
          <Button variant="primary" onClick={() => setView({ mode: 'create' })}>
            + Upload Policy
          </Button>
        }
      />
      <CardBody className="space-y-3">
        {state.policies.length === 0 && <p className="text-sm text-slate-400 italic">No policies uploaded yet.</p>}
        {state.policies.map((policy) => (
          <div
            key={policy.id}
            className={`rounded-lg border px-4 py-3 ${policy.active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900">{policy.name}</h3>
                  <Badge tone="brand">{insurerName(policy.insurerId)}</Badge>
                  <Badge tone="slate">{getOptionLabel('vehicleClass', policy.category)}</Badge>
                  <Badge tone="green">From ₹{policy.premiumStartingAt}</Badge>
                  {!policy.active && <Badge tone="red">Unpublished</Badge>}
                </div>
                {policy.tagline && <p className="text-sm text-slate-600 mt-1.5">{policy.tagline}</p>}
                <p className="text-xs text-slate-400 mt-1">
                  {policy.coverageHighlights.length} coverage highlight(s) · {policy.features.length} feature(s) ·{' '}
                  {policy.exclusions.length} exclusion(s)
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => setView({ mode: 'edit', policy })}>
                  Edit
                </Button>
                <Button size="sm" onClick={() => togglePolicyActive(policy.id)}>
                  {policy.active ? 'Unpublish' : 'Publish'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Delete policy "${policy.name}"?`)) deletePolicy(policy.id);
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
