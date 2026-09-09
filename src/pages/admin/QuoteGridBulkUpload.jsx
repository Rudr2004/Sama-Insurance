import { useRef, useState } from 'react';
import { useStore } from '../../store/StoreContext.jsx';
import { csvToObjects } from '../../utils/csv.js';
import { CSV_TEMPLATE_HEADERS, csvRowToQuote, validateQuoteRow } from '../../config/quoteGridColumns.js';
import { Card, CardHeader, CardBody } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';

function downloadTemplate() {
  const csv = CSV_TEMPLATE_HEADERS.join(',') + '\n';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quote_grid_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function QuoteGridBulkUpload({ onDone }) {
  const { bulkAddQuoteRows } = useStore();
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState(null); // { valid: [], invalid: [] }

  const handleFile = async (file) => {
    setFileName(file.name);
    const text = await file.text();
    const rawRows = csvToObjects(text);
    const valid = [];
    const invalid = [];
    rawRows.forEach((raw, idx) => {
      const quote = csvRowToQuote(raw);
      const errors = validateQuoteRow(quote);
      if (errors.length === 0) {
        valid.push(quote);
      } else {
        invalid.push({ rowNumber: idx + 2, errors, raw }); // +2: header row + 1-indexed
      }
    });
    setPreview({ valid, invalid });
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleConfirmImport = () => {
    if (!preview || preview.valid.length === 0) return;
    bulkAddQuoteRows(preview.valid);
    onDone();
  };

  const handleReset = () => {
    setPreview(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card>
      <CardHeader
        title="Bulk Upload Quote Grid"
        subtitle="Upload a CSV of insurer quotes — one row per insurer per vehicle profile, including each row's agent commission."
      />
      <CardBody className="space-y-5">
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm text-slate-600 mb-3">Drop a CSV file here, or choose one from your computer.</p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => fileInputRef.current?.click()}>Choose CSV File</Button>
            <Button variant="ghost" onClick={downloadTemplate}>
              Download template
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleInputChange} />
          {fileName && <p className="text-xs text-slate-400 mt-3">Selected: {fileName}</p>}
        </div>

        {preview && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="green">{preview.valid.length} row(s) ready to import</Badge>
              {preview.invalid.length > 0 && <Badge tone="red">{preview.invalid.length} row(s) with errors</Badge>}
            </div>

            {preview.invalid.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 max-h-48 overflow-y-auto">
                {preview.invalid.map((item) => (
                  <p key={item.rowNumber} className="mb-1">
                    <strong>Row {item.rowNumber}:</strong> {item.errors.join('; ')}
                  </p>
                ))}
              </div>
            )}

            {preview.valid.length > 0 && (
              <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr className="text-left text-slate-500">
                      <th className="px-3 py-2 font-medium">Insurer</th>
                      <th className="px-3 py-2 font-medium">Vehicle</th>
                      <th className="px-3 py-2 font-medium">RTO</th>
                      <th className="px-3 py-2 font-medium text-right">Final Premium</th>
                      <th className="px-3 py-2 font-medium text-right">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.valid.map((row, idx) => (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="px-3 py-1.5">{row.insurerId}</td>
                        <td className="px-3 py-1.5">
                          {row.vehicleMake} {row.vehicleModel} {row.variant}
                        </td>
                        <td className="px-3 py-1.5">{row.rto}</td>
                        <td className="px-3 py-1.5 text-right">₹{row.finalPremium}</td>
                        <td className="px-3 py-1.5 text-right">
                          {row.commission.type === 'percentage' ? `${row.commission.value}%` : `₹${row.commission.value}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardBody>
      <div className="px-5 py-4 border-t border-slate-100 flex justify-between items-center">
        <Button variant="ghost" onClick={preview ? handleReset : onDone}>
          {preview ? 'Choose a different file' : 'Cancel'}
        </Button>
        <Button variant="primary" onClick={handleConfirmImport} disabled={!preview || preview.valid.length === 0}>
          Import {preview ? preview.valid.length : ''} Row(s)
        </Button>
      </div>
    </Card>
  );
}
