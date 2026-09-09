// Seed data for the in-memory mock store. Structured so each entity list
// could later be swapped for a real API response with minimal refactor.

export const seedInsurers = [
  { id: 'icici_lombard', name: 'ICICI Lombard General Insurance', shortCode: 'ICICI', baseCommissionRate: 10 },
  { id: 'bajaj_allianz', name: 'Bajaj Allianz General Insurance', shortCode: 'BAJAJ', baseCommissionRate: 9 },
  { id: 'hdfc_ergo', name: 'HDFC ERGO General Insurance', shortCode: 'HDFC ERGO', baseCommissionRate: 11 },
  { id: 'tata_aig', name: 'Tata AIG General Insurance', shortCode: 'TATA AIG', baseCommissionRate: 8.5 },
  { id: 'magma_hdi', name: 'Magma HDI General Insurance', shortCode: 'MAGMA HDI', baseCommissionRate: 9.5 },
  { id: 'acko_general', name: 'ACKO General Insurance', shortCode: 'ACKO', baseCommissionRate: 7.5 },
  { id: 'sbi_general', name: 'SBI General Insurance Company Limited', shortCode: 'SBI', baseCommissionRate: 10.5 },
  { id: 'go_digit', name: 'Go Digit General Insurance Limited', shortCode: 'DIGIT', baseCommissionRate: 8 },
  { id: 'united_india', name: 'United India Insurance Company Limited', shortCode: 'UIIC', baseCommissionRate: 12 },
  { id: 'reliance_general', name: 'Reliance General Insurance', shortCode: 'RELIANCE', baseCommissionRate: 9.8 },
  { id: 'iffco_tokio', name: 'IFFCO Tokio General Insurance', shortCode: 'IFFCO TOKIO', baseCommissionRate: 10.2 },
];

export const seedAgents = [
  { id: 'AGT-1001', name: 'Ravi Shah' },
  { id: 'AGT-1002', name: 'Priya Nair' },
  { id: 'AGT-1003', name: 'Suresh Menon' },
  { id: 'AGT-1004', name: 'Anita Desai' },
];

// Rules demonstrating: an RTO-based rule, a vehicle-age-based rule, and a
// compound AND/OR rule — each with a distinct insurer/scope so the
// out-of-the-box demo shows varied precedence outcomes.
export const seedRules = [
  {
    id: 'rule_rto_ahmedabad_2w',
    name: 'Ahmedabad RTO — Two-Wheeler boost',
    insurerId: 'icici_lombard',
    scopeType: 'rto',
    priority: 10,
    active: true,
    conditionTree: {
      logic: 'AND',
      conditions: [
        { field: 'rto', operator: 'in', value: ['GJ-01'] },
        { field: 'vehicleClass', operator: 'equals', value: 'two_wheeler' },
      ],
    },
    outcome: { type: 'percentage', value: 14 },
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
  },
  {
    id: 'rule_new_vehicle_age',
    name: 'New vehicles (0-2 yrs) — Private Car premium',
    insurerId: 'hdfc_ergo',
    scopeType: 'vehicleParam',
    priority: 20,
    active: true,
    conditionTree: {
      logic: 'AND',
      conditions: [
        { field: 'vehicleAge', operator: 'between', value: [0, 2] },
        { field: 'vehicleClass', operator: 'equals', value: 'private_car' },
      ],
    },
    outcome: { type: 'percentage', value: 13 },
    effectiveFrom: null,
    effectiveTo: null,
  },
  {
    id: 'rule_compound_diesel_or_2w',
    name: 'Diesel Rajkot cars OR any Two-Wheeler',
    insurerId: 'bajaj_allianz',
    scopeType: 'vehicleParam',
    priority: 15,
    active: true,
    conditionTree: {
      logic: 'OR',
      conditions: [
        {
          logic: 'AND',
          conditions: [
            { field: 'rto', operator: 'in', value: ['GJ-27'] },
            { field: 'fuelType', operator: 'equals', value: 'diesel' },
          ],
        },
        { field: 'vehicleClass', operator: 'equals', value: 'two_wheeler' },
      ],
    },
    outcome: { type: 'percentage', value: 12 },
    effectiveFrom: null,
    effectiveTo: null,
  },
  {
    id: 'rule_rto_mumbai_flat',
    name: 'Mumbai South RTO — flat bonus (Tata AIG)',
    insurerId: 'tata_aig',
    scopeType: 'rto',
    priority: 10,
    active: true,
    conditionTree: {
      logic: 'AND',
      conditions: [{ field: 'rto', operator: 'in', value: ['MH-01'] }],
    },
    outcome: { type: 'flat', value: 1500 },
    effectiveFrom: null,
    effectiveTo: null,
  },
  {
    id: 'rule_renewal_commercial',
    name: 'Commercial GCV renewals — Magma HDI',
    insurerId: 'magma_hdi',
    scopeType: 'vehicleParam',
    priority: 25,
    active: true,
    conditionTree: {
      logic: 'AND',
      conditions: [
        { field: 'vehicleClass', operator: 'equals', value: 'commercial_gcv' },
        { field: 'caseType', operator: 'equals', value: 'renewal' },
      ],
    },
    outcome: { type: 'percentage', value: 11.5 },
    effectiveFrom: null,
    effectiveTo: null,
  },
  {
    id: 'rule_saod_reduced_commission',
    name: 'SAOD (Standalone Own Damage) policies — reduced commission',
    insurerId: 'ALL',
    scopeType: 'vehicleParam',
    priority: 5,
    active: true,
    conditionTree: {
      logic: 'AND',
      conditions: [{ field: 'policyType', operator: 'equals', value: 'saod' }],
    },
    outcome: { type: 'percentage', value: 6 },
    effectiveFrom: null,
    effectiveTo: null,
  },
  {
    id: 'rule_high_seating_pcv_bonus',
    name: 'High seating capacity (7+) PCV — Go Digit bonus',
    insurerId: 'go_digit',
    scopeType: 'vehicleParam',
    priority: 20,
    active: true,
    conditionTree: {
      logic: 'AND',
      conditions: [
        { field: 'vehicleClass', operator: 'equals', value: 'commercial_pcv' },
        { field: 'seatingCapacity', operator: 'gt', value: 6 },
      ],
    },
    outcome: { type: 'percentage', value: 10.5 },
    effectiveFrom: null,
    effectiveTo: null,
  },
  {
    id: 'rule_breakin_reduced_commission',
    name: 'Break-In cases — reduced commission across insurers',
    insurerId: 'ALL',
    scopeType: 'vehicleParam',
    priority: 6,
    active: true,
    conditionTree: {
      logic: 'AND',
      conditions: [{ field: 'caseType', operator: 'equals', value: 'break_in' }],
    },
    outcome: { type: 'percentage', value: 5 },
    effectiveFrom: null,
    effectiveTo: null,
  },
];

// Issued policy certificates — modeled on a real motor insurance "Certificate
// cum Policy Schedule" (policy number, insured details, vehicle details, IDV,
// premium schedule, dates). Admin uploads these one at a time; agents/users
// browse the grid to see exactly what a real policy document contains.
export const seedPolicies = [
  {
    id: 'policy_cert_001',
    insurerId: 'reliance_general',
    policyNumber: '231702312310000060',
    certificateNumber: '2317/PVT CAR/1234567/00/000',
    category: 'private_car',
    policyType: 'package',

    insuredName: 'Arjun Mehta',
    insuredAddress: 'B-12, Sundervan Society, Ahmedabad, Gujarat - 380015',
    insuredMobile: '98xxxxxx05',
    insuredEmail: 'arjun.m@example.com',

    vehicleMake: 'mahindra_cars',
    vehicleModel: 'xuv700',
    vehicleVariant: 'AX7',
    registrationNumber: 'GJ01AX7070',
    engineNumber: 'K15CN4587213',
    chassisNumber: 'MA1UV2GY1N2345678',
    cubicCapacity: 2198,
    seatingCapacity: 7,
    yearOfManufacture: 2022,
    registrationDate: '2022-03-18',
    rto: 'GJ-01',
    fuelType: 'diesel',

    idv: 1645000,
    idvBreakup: {
      vehicle: 1595000,
      accessories: 30000,
      electricalFittings: 12000,
      nonElectricalFittings: 8000,
    },

    premium: {
      odPremium: 47820.15,
      tpPremium: 7897,
      addonPremium: 46890,
      netPremium: 102607.15,
      gstPercent: 18,
      gstAmount: 18469.29,
      finalPremium: 121080,
      totalDiscountPercent: 23.5,
    },

    ncbPercent: 0,
    previousInsurer: 'New Policy',
    hypothecationBank: 'HDFC Bank Ltd, Ahmedabad Branch',

    policyIssueDate: '2026-03-20',
    periodFrom: '2026-03-20',
    periodTo: '2027-03-19',

    claimSettlementRatio: 98.6,
    cashlessGarages: 8500,
    active: true,
  },
  {
    id: 'policy_cert_002',
    insurerId: 'icici_lombard',
    policyNumber: '301500312310004521',
    certificateNumber: '3015/PVT CAR/0045210/00/000',
    category: 'private_car',
    policyType: 'package',

    insuredName: 'Rohan Kapoor',
    insuredAddress: '14, Green Park Colony, Pune, Maharashtra - 411038',
    insuredMobile: '98xxxxxx01',
    insuredEmail: 'rohan.k@example.com',

    vehicleMake: 'maruti_suzuki',
    vehicleModel: 'swift',
    vehicleVariant: 'VXI',
    registrationNumber: 'MH12AB1234',
    engineNumber: 'K12MN3312987',
    chassisNumber: 'MA3ERLF1S00456789',
    cubicCapacity: 1197,
    seatingCapacity: 5,
    yearOfManufacture: 2022,
    registrationDate: '2022-06-15',
    rto: 'MH-12',
    fuelType: 'petrol',

    idv: 507500,
    idvBreakup: {
      vehicle: 492000,
      accessories: 8000,
      electricalFittings: 5000,
      nonElectricalFittings: 2500,
    },

    premium: {
      odPremium: 11286.8,
      tpPremium: 3416,
      addonPremium: 14460,
      netPremium: 29162.8,
      gstPercent: 18,
      gstAmount: 5249.3,
      finalPremium: 34410,
      totalDiscountPercent: 30.5,
    },

    ncbPercent: 25,
    previousInsurer: 'StarPlus Insurance',
    hypothecationBank: '',

    policyIssueDate: '2026-06-10',
    periodFrom: '2026-06-15',
    periodTo: '2027-06-14',

    claimSettlementRatio: 98.2,
    cashlessGarages: 4200,
    active: true,
  },
  {
    id: 'policy_cert_003',
    insurerId: 'hdfc_ergo',
    policyNumber: '204103312310007788',
    certificateNumber: '2041/PVT CAR/0077880/00/000',
    category: 'private_car',
    policyType: 'saod',

    insuredName: 'Priya Nair',
    insuredAddress: '22, Race Course Road, Indore, Madhya Pradesh - 452001',
    insuredMobile: '98xxxxxx04',
    insuredEmail: 'priya.n@example.com',

    vehicleMake: 'honda_cars',
    vehicleModel: 'city',
    vehicleVariant: 'V CVT',
    registrationNumber: 'MP09CD5678',
    engineNumber: 'L15Z1H778812',
    chassisNumber: 'MRHGM8670NP012345',
    cubicCapacity: 1498,
    seatingCapacity: 5,
    yearOfManufacture: 2023,
    registrationDate: '2023-08-05',
    rto: 'MP-09',
    fuelType: 'petrol',

    idv: 1292000,
    idvBreakup: {
      vehicle: 1265000,
      accessories: 15000,
      electricalFittings: 8000,
      nonElectricalFittings: 4000,
    },

    premium: {
      odPremium: 24599.68,
      tpPremium: 3416,
      addonPremium: 36830,
      netPremium: 64845.68,
      gstPercent: 18,
      gstAmount: 11672.22,
      finalPremium: 76520,
      totalDiscountPercent: 40.5,
    },

    ncbPercent: 35,
    previousInsurer: 'TrustGuard Insurance',
    hypothecationBank: 'ICICI Bank Ltd, Indore Branch',

    policyIssueDate: '2026-07-28',
    periodFrom: '2026-08-05',
    periodTo: '2027-08-04',

    claimSettlementRatio: 99.1,
    cashlessGarages: 7200,
    active: true,
  },
  {
    id: 'policy_cert_004',
    insurerId: 'go_digit',
    policyNumber: '506207312310001199',
    certificateNumber: '5062/TWO WHLR/0011990/00/000',
    category: 'two_wheeler',
    policyType: 'liability',

    insuredName: 'Kavita Joshi',
    insuredAddress: '7, Malviya Nagar, Jaipur, Rajasthan - 302017',
    insuredMobile: '98xxxxxx08',
    insuredEmail: 'kavita.j@example.com',

    vehicleMake: 'bajaj_auto',
    vehicleModel: 'pulsar',
    vehicleVariant: 'NS200 Std',
    registrationNumber: 'RJ14EF9012',
    engineNumber: 'DR02EAJ00456',
    chassisNumber: 'MD2A11EY0NWA12345',
    cubicCapacity: 199,
    seatingCapacity: 2,
    yearOfManufacture: 2022,
    registrationDate: '2022-02-28',
    rto: 'RJ-14',
    fuelType: 'petrol',

    idv: 0,
    idvBreakup: null,

    premium: {
      odPremium: 0,
      tpPremium: 1366,
      addonPremium: 0,
      netPremium: 1366,
      gstPercent: 18,
      gstAmount: 245.88,
      finalPremium: 1610,
      totalDiscountPercent: 26.5,
    },

    ncbPercent: 20,
    previousInsurer: 'SecureShield General',
    hypothecationBank: '',

    policyIssueDate: '2026-02-20',
    periodFrom: '2026-02-28',
    periodTo: '2027-02-27',

    claimSettlementRatio: 97.3,
    cashlessGarages: 3700,
    active: true,
  },
  {
    id: 'policy_cert_005',
    insurerId: 'tata_aig',
    policyNumber: '108509312310003345',
    certificateNumber: '1085/COMM GCV/0033450/00/000',
    category: 'commercial_gcv',
    policyType: 'package',

    insuredName: 'Suresh Menon Transports',
    insuredAddress: 'Plot 45, Industrial Area, Chennai, Tamil Nadu - 600058',
    insuredMobile: '98xxxxxx09',
    insuredEmail: 'rajesh.p@example.com',

    vehicleMake: 'tata_commercial',
    vehicleModel: 'ace',
    vehicleVariant: 'Gold',
    registrationNumber: 'TN09GH3456',
    engineNumber: 'TATA275DI556677',
    chassisNumber: 'MAT445023N1P56789',
    cubicCapacity: 2393,
    seatingCapacity: 7,
    yearOfManufacture: 2020,
    registrationDate: '2020-09-25',
    rto: 'TN-09',
    fuelType: 'diesel',

    idv: 1050000,
    idvBreakup: {
      vehicle: 1010000,
      accessories: 20000,
      electricalFittings: 12000,
      nonElectricalFittings: 8000,
    },

    premium: {
      odPremium: 13965,
      tpPremium: 7897,
      addonPremium: 29930,
      netPremium: 51792,
      gstPercent: 18,
      gstAmount: 9322.56,
      finalPremium: 61110,
      totalDiscountPercent: 65,
    },

    ncbPercent: 50,
    previousInsurer: 'StarPlus Insurance',
    hypothecationBank: 'State Bank of India, Chennai Branch',

    policyIssueDate: '2026-09-15',
    periodFrom: '2026-09-25',
    periodTo: '2027-09-24',

    claimSettlementRatio: 94.8,
    cashlessGarages: 2600,
    active: true,
  },
];

// Agent-specific overrides — highest precedence tier in the engine.
export const seedAgentOverrides = [
  {
    id: 'override_ravi_icici',
    agentId: 'AGT-1001',
    name: 'Ravi Shah — ICICI Lombard loyalty override',
    insurerId: 'icici_lombard',
    conditionTree: null, // applies regardless of other params, for this agent+insurer
    outcome: { type: 'percentage', value: 16 },
    effectiveFrom: null,
    effectiveTo: null,
  },
];
