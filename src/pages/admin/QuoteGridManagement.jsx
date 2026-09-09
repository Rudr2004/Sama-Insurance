import { useState, useMemo } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { QuoteRowForm } from './QuoteRowForm.jsx';
import { QuoteGridBulkUpload } from './QuoteGridBulkUpload.jsx';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { getOptionLabel, getModelsForMake } from '../../config/parameters.js';
import { computeCommissionAmount } from '../../engine/matchQuoteGrid.js';

function modelLabel(make, model) {
  const found = getModelsForMake(make).find((m) => m.value === model);
  return found ? found.label : model;
}

export function QuoteGridManagement() {
  const { state, deleteQuoteRow, toggleQuoteRowPublished } = useStore();
  const [view, setView] = useState({ mode: 'list' });
  const [insurerFilter, setInsurerFilter] = useState('all');
  const [search, setSearch] = useState('');

  const insurerName = (id) => state.insurers.find((i) => i.id === id)?.name ?? id;

  const filtered = useMemo(() => {
    return state.quoteGrid.filter((row) => {
      if (insurerFilter !== 'all' && row.insurerId !== insurerFilter) return false;
      if (search.trim()) {
        const haystack = `${modelLabel(row.vehicleMake, row.vehicleModel)} ${row.vehicleMake} ${row.rto} ${insurerName(row.insurerId)}`.toLowerCase();
        if (!haystack.includes(search.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [state.quoteGrid, insurerFilter, search]);

  if (view.mode === 'create') {
    return <QuoteRowForm onDone={() => setView({ mode: 'list' })} />;
  }
  if (view.mode === 'edit') {
    return <QuoteRowForm initialRow={view.row} onDone={() => setView({ mode: 'list' })} />;
  }
  if (view.mode === 'bulk') {
    return <QuoteGridBulkUpload onDone={() => setView({ mode: 'list' })} />;
  }

  return (
    <Card>
      <CardHeader
        title="Insurance Quote Grid"
        subtitle="The uploaded grid of insurer quotes agents search against — vehicle profile, full policy details, and agent commission per row."
        action={
          <div className="flex gap-2">
            <Button onClick={() => setView({ mode: 'bulk' })}>Bulk Upload (CSV)</Button>
            <Button variant="primary" onClick={() => setView({ mode: 'create' })}>
              + Add Quote Row
            </Button>
          </div>
        }
      />
      <CardBody className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vehicle, RTO, or insurer…"
            className="flex-1 min-w-[220px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <select
            value={insurerFilter}
            onChange={(e) => setInsurerFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All insurers</option>
            {state.insurers.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400">
            {filtered.length} of {state.quoteGrid.length} row(s)
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2.5 font-medium">Insurer</th>
                <th className="px-3 py-2.5 font-medium">Vehicle</th>
                <th className="px-3 py-2.5 font-medium">RTO</th>
                <th className="px-3 py-2.5 font-medium">Policy Type</th>
                <th className="px-3 py-2.5 font-medium text-right">Final Premium</th>
                <th className="px-3 py-2.5 font-medium text-right">Commission</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-400 italic">
                    No quote rows match. Add one, or bulk upload a CSV.
                  </td>
                </tr>
              )}
              {filtered.map((row) => (
                <tr key={row.id} className={`border-b border-slate-100 last:border-0 ${!row.published ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-2.5 font-medium text-slate-900">{insurerName(row.insurerId)}</td>
                  <td className="px-3 py-2.5 text-slate-700">
                    {getOptionLabel('vehicleMake', row.vehicleMake)} {modelLabel(row.vehicleMake, row.vehicleModel)}
                    {row.variant ? ` (${row.variant})` : ''}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{row.rto}</td>
                  <td className="px-3 py-2.5 text-slate-600">{getOptionLabel('policyType', row.policyType)}</td>
                  <td className="px-3 py-2.5 text-right font-mono">₹{row.finalPremium.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2.5 text-right">
                    <Badge tone="brand">
                      {row.commission.type === 'percentage' ? `${row.commission.value}%` : `₹${row.commission.value}`}
                      {row.commission.type === 'percentage' && (
                        <span className="ml-1 text-[10px] opacity-70">(₹{computeCommissionAmount(row).toLocaleString('en-IN')})</span>
                      )}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge tone={row.published ? 'green' : 'slate'}>{row.published ? 'Published' : 'Draft'}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" onClick={() => setView({ mode: 'edit', row })}>
                        Edit
                      </Button>
                      <Button size="sm" onClick={() => toggleQuoteRowPublished(row.id)}>
                        {row.published ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm('Delete this quote row?')) deleteQuoteRow(row.id);
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
      </CardBody>
    </Card>
  );
}
