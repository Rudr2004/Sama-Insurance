// Matches an agent's entered vehicle profile against the admin-uploaded
// Insurance Quote Grid. Pure function, no React — unit-testable in isolation.
//
// Matching key: vehicleClass + vehicleMake + vehicleModel + fuelType + rto.
// (Cubic/seating capacity and age are informational on each row, not part of
// the match key, since they're intrinsic to the make/model rather than
// independently choosable by the agent.)

const MATCH_FIELDS = ['vehicleClass', 'vehicleMake', 'vehicleModel', 'fuelType', 'rto'];

export function matchQuoteGrid(input, quoteGrid) {
  return quoteGrid.filter((row) => {
    if (!row.published) return false;
    return MATCH_FIELDS.every((field) => String(row[field]) === String(input[field]));
  });
}

export function sortQuotesByFinalPremium(quotes) {
  return [...quotes].sort((a, b) => a.finalPremium - b.finalPremium);
}

export function computeCommissionAmount(row) {
  if (row.commission.type === 'flat') return row.commission.value;
  return Math.round((row.finalPremium * row.commission.value) / 100);
}
