// Config-driven parameter registry.
//
// Every field the rule engine can evaluate — and every field the agent form
// collects — is declared once here. Adding a new field (e.g. "add-on cover")
// means adding one entry to PARAMETERS; the condition builder, the agent
// form, and the plain-English rule summary all pick it up automatically.

export const FIELD_TYPES = {
  SELECT: 'select', // single choice from options
  MULTI_SELECT: 'multi_select', // list-based field (supports in/not in)
  NUMBER: 'number', // supports between/gt/lt/equals
  TEXT: 'text',
};

export const OPERATORS = {
  equals: { label: 'equals', symbol: '=' },
  not_equals: { label: 'not equals', symbol: '≠' },
  in: { label: 'is any of', symbol: 'in' },
  not_in: { label: 'is none of', symbol: 'not in' },
  between: { label: 'is between', symbol: 'between' },
  gt: { label: 'greater than', symbol: '>' },
  lt: { label: 'less than', symbol: '<' },
};

// Which operators make sense for each field type.
export const OPERATORS_BY_TYPE = {
  [FIELD_TYPES.SELECT]: ['equals', 'not_equals', 'in', 'not_in'],
  [FIELD_TYPES.MULTI_SELECT]: ['in', 'not_in', 'equals', 'not_equals'],
  [FIELD_TYPES.NUMBER]: ['between', 'gt', 'lt', 'equals', 'not_equals'],
  [FIELD_TYPES.TEXT]: ['equals', 'not_equals', 'in', 'not_in'],
};

export const RTO_OPTIONS = [
  { value: 'GJ-01', label: 'GJ-01 — Ahmedabad' },
  { value: 'GJ-05', label: 'GJ-05 — Surat' },
  { value: 'GJ-18', label: 'GJ-18 — Gandhinagar' },
  { value: 'GJ-27', label: 'GJ-27 — Rajkot' },
  { value: 'MH-01', label: 'MH-01 — Mumbai South' },
  { value: 'MH-12', label: 'MH-12 — Pune' },
  { value: 'MH-14', label: 'MH-14 — Pimpri-Chinchwad' },
  { value: 'MH-20', label: 'MH-20 — Aurangabad (Sambhajinagar)' },
  { value: 'DL-01', label: 'DL-01 — Delhi Central' },
  { value: 'DL-08', label: 'DL-08 — Delhi West' },
  { value: 'KA-05', label: 'KA-05 — Bengaluru' },
  { value: 'MP-09', label: 'MP-09 — Indore' },
  { value: 'TN-09', label: 'TN-09 — Chennai' },
  { value: 'UP-32', label: 'UP-32 — Lucknow' },
  { value: 'RJ-14', label: 'RJ-14 — Jaipur' },
  { value: 'TS-08', label: 'TS-08 — Hyderabad' },
  { value: 'WB-06', label: 'WB-06 — Kolkata' },
];

export const VEHICLE_CLASSES = [
  {
    value: 'private_car',
    label: 'Private Car',
    subclasses: [
      { value: 'hatchback', label: 'Hatchback' },
      { value: 'sedan', label: 'Sedan' },
      { value: 'suv', label: 'SUV' },
    ],
  },
  {
    value: 'two_wheeler',
    label: 'Two-Wheeler',
    subclasses: [
      { value: 'scooter', label: 'Scooter' },
      { value: 'motorcycle', label: 'Motorcycle' },
      { value: 'electric_2w', label: 'Electric 2W' },
    ],
  },
  {
    value: 'commercial_gcv',
    label: 'Commercial — GCV (Goods Carrying)',
    subclasses: [
      { value: 'mini_truck', label: 'Mini Truck' },
      { value: 'heavy_truck', label: 'Heavy Truck' },
    ],
  },
  {
    value: 'commercial_pcv',
    label: 'Commercial — PCV (Passenger Carrying)',
    subclasses: [
      { value: 'auto_rickshaw', label: 'Auto Rickshaw' },
      { value: 'taxi', label: 'Taxi' },
      { value: 'bus', label: 'Bus' },
    ],
  },
];

// Vehicle manufacturers ("Motor Company") with their models, per vehicle
// class — drives the Make -> Model cascading dropdowns on the entry form.
export const VEHICLE_MAKES = [
  {
    value: 'maruti_suzuki',
    label: 'Maruti Suzuki',
    vehicleClass: 'private_car',
    models: [
      { value: 'swift', label: 'Swift' },
      { value: 'baleno', label: 'Baleno' },
      { value: 'wagonr', label: 'WagonR' },
      { value: 'brezza', label: 'Brezza' },
      { value: 'ertiga', label: 'Ertiga' },
    ],
  },
  {
    value: 'hyundai',
    label: 'Hyundai',
    vehicleClass: 'private_car',
    models: [
      { value: 'i20', label: 'i20' },
      { value: 'creta', label: 'Creta' },
      { value: 'venue', label: 'Venue' },
      { value: 'verna', label: 'Verna' },
    ],
  },
  {
    value: 'tata_motors',
    label: 'Tata Motors',
    vehicleClass: 'private_car',
    models: [
      { value: 'nexon', label: 'Nexon' },
      { value: 'punch', label: 'Punch' },
      { value: 'tiago', label: 'Tiago' },
      { value: 'harrier', label: 'Harrier' },
    ],
  },
  {
    value: 'honda_cars',
    label: 'Honda Cars',
    vehicleClass: 'private_car',
    models: [
      { value: 'city', label: 'City' },
      { value: 'amaze', label: 'Amaze' },
      { value: 'elevate', label: 'Elevate' },
    ],
  },
  {
    value: 'mahindra_cars',
    label: 'Mahindra',
    vehicleClass: 'private_car',
    models: [
      { value: 'xuv700', label: 'XUV700' },
      { value: 'scorpio_n', label: 'Scorpio-N' },
      { value: 'thar', label: 'Thar' },
      { value: 'xuv300', label: 'XUV300' },
    ],
  },
  {
    value: 'toyota',
    label: 'Toyota',
    vehicleClass: 'private_car',
    models: [
      { value: 'innova_crysta', label: 'Innova Crysta' },
      { value: 'fortuner', label: 'Fortuner' },
      { value: 'glanza', label: 'Glanza' },
      { value: 'urban_cruiser_hyryder', label: 'Urban Cruiser Hyryder' },
    ],
  },
  {
    value: 'kia',
    label: 'Kia',
    vehicleClass: 'private_car',
    models: [
      { value: 'seltos', label: 'Seltos' },
      { value: 'sonet', label: 'Sonet' },
      { value: 'carens', label: 'Carens' },
    ],
  },
  {
    value: 'royal_enfield',
    label: 'Royal Enfield',
    vehicleClass: 'two_wheeler',
    models: [
      { value: 'classic_350', label: 'Classic 350' },
      { value: 'hunter_350', label: 'Hunter 350' },
      { value: 'meteor_350', label: 'Meteor 350' },
    ],
  },
  {
    value: 'hero_motocorp',
    label: 'Hero MotoCorp',
    vehicleClass: 'two_wheeler',
    models: [
      { value: 'splendor', label: 'Splendor' },
      { value: 'hf_deluxe', label: 'HF Deluxe' },
      { value: 'passion', label: 'Passion' },
      { value: 'xtreme', label: 'Xtreme' },
    ],
  },
  {
    value: 'honda_motorcycle',
    label: 'Honda Motorcycle & Scooter',
    vehicleClass: 'two_wheeler',
    models: [
      { value: 'activa', label: 'Activa' },
      { value: 'shine', label: 'Shine' },
      { value: 'unicorn', label: 'Unicorn' },
    ],
  },
  {
    value: 'bajaj_auto',
    label: 'Bajaj Auto',
    vehicleClass: 'two_wheeler',
    models: [
      { value: 'pulsar', label: 'Pulsar' },
      { value: 'platina', label: 'Platina' },
      { value: 'avenger', label: 'Avenger' },
    ],
  },
  {
    value: 'tvs_motor',
    label: 'TVS Motor',
    vehicleClass: 'two_wheeler',
    models: [
      { value: 'jupiter', label: 'Jupiter' },
      { value: 'apache', label: 'Apache' },
      { value: 'ntorq', label: 'NTORQ' },
    ],
  },
  {
    value: 'ashok_leyland',
    label: 'Ashok Leyland',
    vehicleClass: 'commercial_gcv',
    models: [
      { value: 'dost', label: 'Dost' },
      { value: 'bada_dost', label: 'Bada Dost' },
      { value: 'partner', label: 'Partner' },
    ],
  },
  {
    value: 'tata_commercial',
    label: 'Tata Motors Commercial',
    vehicleClass: 'commercial_gcv',
    models: [
      { value: 'ace', label: 'Ace' },
      { value: '407', label: '407 Gold' },
      { value: 'signa', label: 'Signa' },
    ],
  },
  {
    value: 'mahindra_commercial',
    label: 'Mahindra',
    vehicleClass: 'commercial_pcv',
    models: [
      { value: 'bolero_pickup', label: 'Bolero Pickup' },
      { value: 'supro', label: 'Supro' },
    ],
  },
];

export function getMakesForClass(vehicleClass) {
  if (!vehicleClass) return VEHICLE_MAKES;
  return VEHICLE_MAKES.filter((m) => m.vehicleClass === vehicleClass);
}

export function getModelsForMake(makeValue) {
  const make = VEHICLE_MAKES.find((m) => m.value === makeValue);
  return make ? make.models : [];
}

// "Case Type" — the business/underwriting case for the policy being quoted.
export const CASE_TYPES = [
  { value: 'new', label: 'New' },
  { value: 'renewal', label: 'Renewal' },
  { value: 'break_in', label: 'Break-In' },
  { value: 'rollover', label: 'Rollover' },
];

export const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
];

// "Policy Type" — the cover structure being sold (comprehensive package vs
// own-damage-only vs liability-only), matching real motor insurance products.
export const POLICY_TYPES = [
  { value: 'package', label: 'Package' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'saod', label: 'SAOD (Standalone Own Damage)' },
  { value: 'liability', label: 'Liability Only' },
];

// Two-wheelers are overwhelmingly petrol in the Indian market — used to
// auto-default the Fuel Type field when Vehicle Class = Two-Wheeler.
export const DEFAULT_FUEL_BY_CLASS = {
  two_wheeler: 'petrol',
};

export const BOOLEAN_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

// The master field registry used by the condition builder + agent form.
// `core: true` fields render as dedicated inputs on the agent form; anything
// else falls under the extensible "additional parameters" section.
export const PARAMETERS = [
  {
    key: 'rto',
    label: 'RTO',
    type: FIELD_TYPES.MULTI_SELECT,
    options: RTO_OPTIONS,
    core: true,
  },
  {
    key: 'vehicleClass',
    label: 'Vehicle Class',
    type: FIELD_TYPES.SELECT,
    options: VEHICLE_CLASSES.map(({ value, label }) => ({ value, label })),
    core: true,
  },
  {
    key: 'vehicleSubclass',
    label: 'Vehicle Subclass',
    type: FIELD_TYPES.SELECT,
    options: VEHICLE_CLASSES.flatMap((c) => c.subclasses),
    core: true,
  },
  {
    key: 'vehicleMake',
    label: 'Motor Company (Make)',
    type: FIELD_TYPES.SELECT,
    options: VEHICLE_MAKES.map(({ value, label }) => ({ value, label })),
    core: true,
  },
  {
    key: 'vehicleModel',
    label: 'Vehicle Model',
    type: FIELD_TYPES.SELECT,
    options: VEHICLE_MAKES.flatMap((m) => m.models),
    core: true,
  },
  {
    key: 'fuelType',
    label: 'Fuel Type',
    type: FIELD_TYPES.SELECT,
    options: FUEL_TYPES,
    core: true,
  },
  {
    key: 'cubicCapacity',
    label: 'Cubic Capacity (cc)',
    type: FIELD_TYPES.NUMBER,
    core: true,
  },
  {
    key: 'seatingCapacity',
    label: 'Seating Capacity',
    type: FIELD_TYPES.NUMBER,
    core: true,
  },
  {
    key: 'vehicleAge',
    label: 'Vehicle Age (years)',
    type: FIELD_TYPES.NUMBER,
    core: true,
  },
  {
    key: 'policyType',
    label: 'Policy Type',
    type: FIELD_TYPES.SELECT,
    options: POLICY_TYPES,
    core: true,
  },
  {
    key: 'caseType',
    label: 'Case Type',
    type: FIELD_TYPES.SELECT,
    options: CASE_TYPES,
    core: true,
  },
  {
    key: 'agentId',
    label: 'Agent ID',
    type: FIELD_TYPES.MULTI_SELECT,
    options: [], // populated dynamically from the agent store where used
    core: false,
  },
  // Extensible "other parameter" example — new fields can be appended here
  // (or added by an admin at runtime) without touching the engine or UI.
  {
    key: 'idv',
    label: 'IDV (₹, Insured Declared Value)',
    type: FIELD_TYPES.NUMBER,
    core: false,
  },
  {
    key: 'ncb',
    label: 'NCB Slab (%)',
    type: FIELD_TYPES.SELECT,
    options: [
      { value: '0', label: '0%' },
      { value: '20', label: '20%' },
      { value: '25', label: '25%' },
      { value: '35', label: '35%' },
      { value: '45', label: '45%' },
      { value: '50', label: '50%' },
    ],
    core: false,
  },
  // Addon toggles — collected on the entry form and evaluable by the rules
  // engine like any other field (e.g. a rule could give higher commission
  // when Zero Dep Cover is selected).
  {
    key: 'zeroDepCover',
    label: 'Zero Dep Cover',
    type: FIELD_TYPES.SELECT,
    options: BOOLEAN_OPTIONS,
    core: false,
  },
  {
    key: 'paOwnerCover',
    label: 'PA Owner Cover',
    type: FIELD_TYPES.SELECT,
    options: BOOLEAN_OPTIONS,
    core: false,
  },
  {
    key: 'isCngLpg',
    label: 'Is CNG/LPG Fitted',
    type: FIELD_TYPES.SELECT,
    options: BOOLEAN_OPTIONS,
    core: false,
  },
];

export function getParameter(key) {
  return PARAMETERS.find((p) => p.key === key);
}

export function getOptionLabel(paramKey, value) {
  const param = getParameter(paramKey);
  if (!param || !param.options) return value;
  const opt = param.options.find((o) => String(o.value) === String(value));
  return opt ? opt.label : value;
}

export function getSubclassesForClass(classValue) {
  const cls = VEHICLE_CLASSES.find((c) => c.value === classValue);
  return cls ? cls.subclasses : [];
}
