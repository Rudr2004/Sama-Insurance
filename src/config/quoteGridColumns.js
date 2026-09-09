// Column definitions for the Insurance Quote Grid — drives the bulk CSV
// upload's expected headers/mapping and the admin's individual-row form.
// `key` matches the field name on a quote grid record (src/data/quoteGridSeed.js).

export const QUOTE_GRID_COLUMNS = [
  { key: 'insurerId', label: 'Insurer', required: true, type: 'insurerSelect' },
  { key: 'vehicleClass', label: 'Vehicle Class', required: true, type: 'select', source: 'vehicleClass' },
  { key: 'vehicleMake', label: 'Motor Company (Make)', required: true, type: 'select', source: 'vehicleMake' },
  { key: 'vehicleModel', label: 'Model', required: true, type: 'select', source: 'vehicleModel' },
  { key: 'vehicleSubclass', label: 'Subclass', required: false, type: 'text' },
  { key: 'variant', label: 'Variant', required: false, type: 'text' },
  { key: 'fuelType', label: 'Fuel Type', required: true, type: 'select', source: 'fuelType' },
  { key: 'cubicCapacity', label: 'Cubic Capacity (cc)', required: false, type: 'number' },
  { key: 'seatingCapacity', label: 'Seating Capacity', required: false, type: 'number' },
  { key: 'rto', label: 'RTO', required: true, type: 'select', source: 'rto' },
  { key: 'vehicleAgeYears', label: 'Vehicle Age (yrs)', required: false, type: 'number' },
  { key: 'policyType', label: 'Policy Type', required: true, type: 'select', source: 'policyType' },
  { key: 'idv', label: 'IDV (₹)', required: true, type: 'number' },
  { key: 'odPremium', label: 'OD Premium (₹)', required: false, type: 'number' },
  { key: 'tpPremium', label: 'TP Premium (₹)', required: false, type: 'number' },
  { key: 'addonPremium', label: 'Add-on Premium Total (₹)', required: false, type: 'number' },
  { key: 'gstAmount', label: 'GST Amount (₹)', required: false, type: 'number' },
  { key: 'finalPremium', label: 'Final Premium (₹)', required: true, type: 'number' },
  { key: 'totalDiscountPercent', label: 'Total Discount (%)', required: false, type: 'number' },
  { key: 'cashlessGarages', label: 'Cashless Garages', required: false, type: 'number' },
  { key: 'claimSettlementRatio', label: 'Claim Settlement Ratio (%)', required: false, type: 'number' },
  { key: 'commissionType', label: 'Commission Type', required: true, type: 'select', source: 'commissionType' },
  { key: 'commissionValue', label: 'Commission Value', required: true, type: 'number' },
];

export const CSV_TEMPLATE_HEADERS = QUOTE_GRID_COLUMNS.map((c) => c.key);

export function csvRowToQuote(rawRow) {
  const numeric = (v) => (v === '' || v === undefined || v === null ? undefined : Number(v));
  return {
    insurerId: rawRow.insurerId?.trim(),
    vehicleClass: rawRow.vehicleClass?.trim(),
    vehicleSubclass: rawRow.vehicleSubclass?.trim() || undefined,
    vehicleMake: rawRow.vehicleMake?.trim(),
    vehicleModel: rawRow.vehicleModel?.trim(),
    variant: rawRow.variant?.trim() || undefined,
    fuelType: rawRow.fuelType?.trim(),
    cubicCapacity: numeric(rawRow.cubicCapacity),
    seatingCapacity: numeric(rawRow.seatingCapacity),
    rto: rawRow.rto?.trim(),
    vehicleAgeYears: numeric(rawRow.vehicleAgeYears),
    policyType: rawRow.policyType?.trim(),
    idv: numeric(rawRow.idv),
    odPremium: numeric(rawRow.odPremium) ?? 0,
    tpPremium: numeric(rawRow.tpPremium) ?? 0,
    addonPremium: numeric(rawRow.addonPremium) ?? 0,
    gstAmount: numeric(rawRow.gstAmount) ?? 0,
    finalPremium: numeric(rawRow.finalPremium),
    totalDiscountPercent: numeric(rawRow.totalDiscountPercent) ?? 0,
    cashlessGarages: numeric(rawRow.cashlessGarages) ?? 0,
    claimSettlementRatio: numeric(rawRow.claimSettlementRatio),
    commission: {
      type: rawRow.commissionType?.trim() === 'flat' ? 'flat' : 'percentage',
      value: numeric(rawRow.commissionValue) ?? 0,
    },
    published: true,
  };
}

export function validateQuoteRow(row) {
  const errors = [];
  if (!row.insurerId) errors.push('Insurer is required');
  if (!row.vehicleClass) errors.push('Vehicle class is required');
  if (!row.vehicleMake) errors.push('Vehicle make is required');
  if (!row.vehicleModel) errors.push('Vehicle model is required');
  if (!row.fuelType) errors.push('Fuel type is required');
  if (!row.rto) errors.push('RTO is required');
  if (!row.policyType) errors.push('Policy type is required');
  if (row.idv === undefined || Number.isNaN(row.idv)) errors.push('IDV must be a number');
  if (row.finalPremium === undefined || Number.isNaN(row.finalPremium)) errors.push('Final premium must be a number');
  if (row.commission?.value === undefined || Number.isNaN(row.commission.value)) errors.push('Commission value must be a number');
  return errors;
}
