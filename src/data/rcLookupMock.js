// Mock "RC Lookup" dataset — stands in for a real vehicle registration
// lookup (Vahan/Parivahan has no free public API; see project notes). An
// agent enters a registration number and, if it matches one of these demo
// records, the vehicle fields on the entry form are auto-filled. Every
// auto-filled field remains a normal, independently editable input — this
// only pre-populates, it never locks anything.
export const seedRcLookupRecords = [
  {
    regNumber: 'GJ01AX7070',
    vehicleClass: 'private_car',
    vehicleSubclass: 'mpv_suv',
    vehicleMake: 'mahindra_cars',
    vehicleModel: 'xuv700',
    fuelType: 'diesel',
    registrationDate: '2022-03-18',
    rto: 'GJ-01',
    // Every vehicle in this mock dataset is treated as a renewal case with a
    // prior policy on file — RC lookup auto-fills these Policy Details from
    // that prior policy (ncb/zeroDepCover/paOwnerCover/isCngLpg use real
    // values where a matching issued certificate exists in seedPolicies).
    // lastAgentId simulates the agent who serviced that prior policy.
    lastPolicyIssueDate: '2026-03-20',
    lastPolicyType: 'package',
    lastNcb: '0',
    lastZeroDepCover: 'yes',
    lastPaOwnerCover: 'yes',
    lastIsCngLpg: 'no',
    lastAgentId: 'AGT-1001',
  },
  {
    regNumber: 'MH12AB1234',
    vehicleClass: 'private_car',
    vehicleSubclass: 'compact',
    vehicleMake: 'maruti_suzuki',
    vehicleModel: 'swift',
    fuelType: 'petrol',
    registrationDate: '2022-06-15',
    rto: 'MH-12',
    lastPolicyIssueDate: '2026-06-10',
    lastPolicyType: 'package',
    lastNcb: '25',
    lastZeroDepCover: 'yes',
    lastPaOwnerCover: 'yes',
    lastIsCngLpg: 'no',
    lastAgentId: 'AGT-1003',
  },
  {
    regNumber: 'MP09CD5678',
    vehicleClass: 'private_car',
    vehicleSubclass: 'mid_size',
    vehicleMake: 'honda_cars',
    vehicleModel: 'city',
    fuelType: 'petrol',
    registrationDate: '2023-08-05',
    rto: 'MP-09',
    lastPolicyIssueDate: '2026-07-28',
    lastPolicyType: 'saod',
    lastNcb: '35',
    lastZeroDepCover: 'yes',
    lastPaOwnerCover: 'no',
    lastIsCngLpg: 'no',
    lastAgentId: 'AGT-1002',
  },
  {
    regNumber: 'RJ14EF9012',
    vehicleClass: 'two_wheeler',
    vehicleSubclass: 'tw_150_350cc',
    vehicleMake: 'bajaj_auto',
    vehicleModel: 'pulsar',
    fuelType: 'petrol',
    registrationDate: '2022-02-28',
    rto: 'RJ-14',
    lastPolicyIssueDate: '2026-02-20',
    lastPolicyType: 'liability',
    lastNcb: '20',
    lastZeroDepCover: 'no',
    lastPaOwnerCover: 'no',
    lastIsCngLpg: 'no',
    lastAgentId: 'AGT-1002',
  },
  {
    regNumber: 'TN09GH3456',
    vehicleClass: 'private_car',
    vehicleSubclass: 'mpv_suv',
    vehicleMake: 'toyota',
    vehicleModel: 'innova_crysta',
    fuelType: 'diesel',
    registrationDate: '2020-09-25',
    rto: 'TN-09',
    lastPolicyIssueDate: '2025-09-25',
    lastPolicyType: 'package',
    lastNcb: '50',
    lastZeroDepCover: 'no',
    lastPaOwnerCover: 'yes',
    lastIsCngLpg: 'no',
    lastAgentId: 'AGT-1004',
  },
  {
    regNumber: 'DL01KL6789',
    vehicleClass: 'private_car',
    vehicleSubclass: 'mpv_suv',
    vehicleMake: 'hyundai',
    vehicleModel: 'creta',
    fuelType: 'petrol',
    registrationDate: '2023-01-10',
    rto: 'DL-01',
    lastPolicyIssueDate: '2025-01-10',
    lastPolicyType: 'bundle',
    lastNcb: '20',
    lastZeroDepCover: 'yes',
    lastPaOwnerCover: 'yes',
    lastIsCngLpg: 'no',
    lastAgentId: 'AGT-1004',
  },
  {
    regNumber: 'UP32MN2345',
    vehicleClass: 'two_wheeler',
    vehicleSubclass: 'tw_75_150cc',
    vehicleMake: 'hero_motocorp',
    vehicleModel: 'splendor',
    fuelType: 'petrol',
    registrationDate: '2023-05-12',
    rto: 'UP-32',
    lastPolicyIssueDate: '2025-05-12',
    lastPolicyType: 'liability',
    lastNcb: '25',
    lastZeroDepCover: 'no',
    lastPaOwnerCover: 'no',
    lastIsCngLpg: 'no',
    lastAgentId: 'AGT-1005',
  },
  {
    regNumber: 'WB06PQ7890',
    vehicleClass: 'two_wheeler',
    vehicleSubclass: 'tw_150_350cc',
    vehicleMake: 'royal_enfield',
    vehicleModel: 'classic_350',
    fuelType: 'petrol',
    registrationDate: '2021-07-14',
    rto: 'WB-06',
    lastPolicyIssueDate: '2025-07-14',
    lastPolicyType: 'saod',
    lastNcb: '35',
    lastZeroDepCover: 'no',
    lastPaOwnerCover: 'no',
    lastIsCngLpg: 'no',
    lastAgentId: 'AGT-1001',
  },
];

function normalizeRegNumber(regNumber) {
  return (regNumber || '').replace(/\s|-/g, '').toUpperCase();
}

/**
 * Looks up a vehicle by registration number in the mock RC dataset.
 * @returns {object|null} the matching record, or null if not found
 */
export function lookupVehicleByRegNumber(regNumber) {
  const normalized = normalizeRegNumber(regNumber);
  if (!normalized) return null;
  return seedRcLookupRecords.find((r) => normalizeRegNumber(r.regNumber) === normalized) ?? null;
}
