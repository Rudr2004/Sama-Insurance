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
