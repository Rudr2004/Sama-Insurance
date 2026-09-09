import { useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { PolicyForm } from './PolicyForm.jsx';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { getOptionLabel, getModelsForMake } from '../../config/parameters.js';

function modelLabel(make, model) {
  const found = getModelsForMake(make).find((m) => m.value === model);
  return found ? found.label : model;
}

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
        subtitle="Issued policy certificates uploaded for agents and users to browse — full certificate detail, one record per policy."
        action={
          <Button variant="primary" onClick={() => setView({ mode: 'create' })}>
            + Upload Policy Certificate
          </Button>
        }
      />
      <CardBody>
        {state.policies.length === 0 && <p className="text-sm text-slate-400 italic">No policy certificates uploaded yet.</p>}
        {state.policies.length > 0 && (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2.5 font-medium">Policy No.</th>
                  <th className="px-3 py-2.5 font-medium">Insurer</th>
                  <th className="px-3 py-2.5 font-medium">Company (Make)</th>
                  <th className="px-3 py-2.5 font-medium">Model</th>
                  <th className="px-3 py-2.5 font-medium">Fuel Type</th>
                  <th className="px-3 py-2.5 font-medium text-right">Cubic Capacity</th>
                  <th className="px-3 py-2.5 font-medium text-right">IDV</th>
                  <th className="px-3 py-2.5 font-medium text-right">Final Premium</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.policies.map((policy) => (
                  <tr key={policy.id} className={`border-b border-slate-100 last:border-0 ${!policy.active ? 'opacity-50' : ''}`}>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-600">{policy.policyNumber}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-900">{insurerName(policy.insurerId)}</td>
                    <td className="px-3 py-2.5 text-slate-700">{getOptionLabel('vehicleMake', policy.vehicleMake)}</td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {modelLabel(policy.vehicleMake, policy.vehicleModel)}
                      {policy.vehicleVariant ? ` (${policy.vehicleVariant})` : ''}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{getOptionLabel('fuelType', policy.fuelType)}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                      {policy.cubicCapacity ? `${policy.cubicCapacity} cc` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">₹{policy.idv.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold">
                      ₹{policy.premium.finalPremium.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone={policy.active ? 'green' : 'slate'}>{policy.active ? 'Published' : 'Draft'}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1.5">
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
                            if (confirm(`Delete policy ${policy.policyNumber}?`)) deletePolicy(policy.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
