import { describe, it, expect } from 'vitest';
import { evaluateCommission } from './evaluateCommission.js';
import { seedInsurers, seedRules, seedAgentOverrides } from '../data/seed.js';

function run(input) {
  return evaluateCommission(input, seedInsurers, seedRules, seedAgentOverrides, '2026-06-01');
}

describe('evaluateCommission', () => {
  it('falls back to insurer base commission when nothing matches', () => {
    const results = run({
      rto: 'DL-01',
      vehicleClass: 'private_car',
      fuelType: 'petrol',
      vehicleAge: 10,
      policyType: 'renewal',
      agentId: 'AGT-9999',
    });
    const magma = results.find((r) => r.insurerId === 'magma_hdi');
    expect(magma.precedenceTier).toBe('insurerDefault');
    expect(magma.outcome.value).toBe(9.5);
  });

  it('applies RTO-specific rule for Ahmedabad two-wheeler on ICICI', () => {
    const results = run({
      rto: 'GJ-01',
      vehicleClass: 'two_wheeler',
      fuelType: 'petrol',
      vehicleAge: 3,
      policyType: 'new',
      agentId: 'AGT-9999',
    });
    const icici = results.find((r) => r.insurerId === 'icici_lombard');
    expect(icici.precedenceTier).toBe('rto');
    expect(icici.outcome.value).toBe(14);
  });

  it('agent-specific override beats RTO rule for the same agent+insurer', () => {
    const results = run({
      rto: 'GJ-01',
      vehicleClass: 'two_wheeler',
      fuelType: 'petrol',
      vehicleAge: 3,
      policyType: 'new',
      agentId: 'AGT-1001', // has an override on icici_lombard
    });
    const icici = results.find((r) => r.insurerId === 'icici_lombard');
    expect(icici.precedenceTier).toBe('agentOverride');
    expect(icici.outcome.value).toBe(16);
  });

  it('evaluates a compound OR/AND rule correctly (diesel Rajkot branch)', () => {
    const results = run({
      rto: 'GJ-27',
      vehicleClass: 'private_car',
      fuelType: 'diesel',
      vehicleAge: 4,
      policyType: 'new',
      agentId: 'AGT-9999',
    });
    const bajaj = results.find((r) => r.insurerId === 'bajaj_allianz');
    expect(bajaj.precedenceTier).toBe('vehicleParam');
    expect(bajaj.outcome.value).toBe(12);
  });

  it('evaluates a compound OR/AND rule correctly (two-wheeler branch, different RTO/fuel)', () => {
    const results = run({
      rto: 'MH-12',
      vehicleClass: 'two_wheeler',
      fuelType: 'electric',
      vehicleAge: 1,
      policyType: 'new',
      agentId: 'AGT-9999',
    });
    const bajaj = results.find((r) => r.insurerId === 'bajaj_allianz');
    expect(bajaj.precedenceTier).toBe('vehicleParam');
    expect(bajaj.outcome.value).toBe(12);
  });

  it('does not match the compound rule when neither branch is satisfied', () => {
    const results = run({
      rto: 'MH-12',
      vehicleClass: 'private_car',
      fuelType: 'petrol',
      vehicleAge: 5,
      policyType: 'new',
      agentId: 'AGT-9999',
    });
    const bajaj = results.find((r) => r.insurerId === 'bajaj_allianz');
    expect(bajaj.precedenceTier).toBe('insurerDefault');
  });

  it('applies flat-amount outcome for Mumbai South RTO rule', () => {
    const results = run({
      rto: 'MH-01',
      vehicleClass: 'private_car',
      fuelType: 'petrol',
      vehicleAge: 5,
      policyType: 'new',
      agentId: 'AGT-9999',
    });
    const tataAig = results.find((r) => r.insurerId === 'tata_aig');
    expect(tataAig.precedenceTier).toBe('rto');
    expect(tataAig.outcome).toEqual({ type: 'flat', value: 1500 });
  });

  it('respects vehicle age "between" operator boundaries', () => {
    const withinRange = run({
      rto: 'DL-01',
      vehicleClass: 'private_car',
      fuelType: 'petrol',
      vehicleAge: 2,
      policyType: 'new',
      agentId: 'AGT-9999',
    });
    const outOfRange = run({
      rto: 'DL-01',
      vehicleClass: 'private_car',
      fuelType: 'petrol',
      vehicleAge: 3,
      policyType: 'new',
      agentId: 'AGT-9999',
    });
    const hdfcWithin = withinRange.find((r) => r.insurerId === 'hdfc_ergo');
    const hdfcOutOfRange = outOfRange.find((r) => r.insurerId === 'hdfc_ergo');
    expect(hdfcWithin.precedenceTier).toBe('vehicleParam');
    expect(hdfcWithin.outcome.value).toBe(13);
    expect(hdfcOutOfRange.precedenceTier).toBe('insurerDefault');
  });

  it('RTO tier outranks vehicleParam tier at equal priority', () => {
    // Construct a scenario where both an rto-scope and vehicleParam-scope
    // rule for the same insurer match; rto must win per precedence order.
    const rules = [
      {
        id: 'r1',
        name: 'RTO rule',
        insurerId: 'icici_lombard',
        scopeType: 'rto',
        priority: 50,
        active: true,
        conditionTree: { logic: 'AND', conditions: [{ field: 'rto', operator: 'in', value: ['GJ-05'] }] },
        outcome: { type: 'percentage', value: 20 },
      },
      {
        id: 'r2',
        name: 'Vehicle param rule',
        insurerId: 'icici_lombard',
        scopeType: 'vehicleParam',
        priority: 1, // even higher "priority" (lower number) must still lose to RTO tier
        active: true,
        conditionTree: { logic: 'AND', conditions: [{ field: 'fuelType', operator: 'equals', value: 'petrol' }] },
        outcome: { type: 'percentage', value: 99 },
      },
    ];
    const results = evaluateCommission(
      { rto: 'GJ-05', fuelType: 'petrol', vehicleClass: 'private_car', vehicleAge: 5, policyType: 'new', agentId: 'AGT-9999' },
      seedInsurers,
      rules,
      [],
      '2026-06-01'
    );
    const icici = results.find((r) => r.insurerId === 'icici_lombard');
    expect(icici.precedenceTier).toBe('rto');
    expect(icici.outcome.value).toBe(20);
  });

  it('ignores rules outside their effective date window', () => {
    const rules = [
      {
        id: 'expired_rule',
        name: 'Expired promo',
        insurerId: 'icici_lombard',
        scopeType: 'vehicleParam',
        priority: 5,
        active: true,
        conditionTree: { logic: 'AND', conditions: [] },
        outcome: { type: 'percentage', value: 50 },
        effectiveFrom: '2025-01-01',
        effectiveTo: '2025-12-31',
      },
    ];
    const results = evaluateCommission(
      { rto: 'GJ-05', fuelType: 'petrol', vehicleClass: 'private_car', vehicleAge: 5, policyType: 'new', agentId: 'AGT-9999' },
      seedInsurers,
      rules,
      [],
      '2026-06-01'
    );
    const icici = results.find((r) => r.insurerId === 'icici_lombard');
    expect(icici.precedenceTier).toBe('insurerDefault');
  });

  it('a broker/agent override on RTO + Vehicle Company beats a plain RTO rule for that agent', () => {
    const rules = [
      {
        id: 'rto_make_rule',
        name: 'Quick rule: GJ-01 + Maruti Suzuki',
        insurerId: 'ALL',
        scopeType: 'rto',
        priority: 5,
        active: true,
        conditionTree: {
          logic: 'AND',
          conditions: [
            { field: 'rto', operator: 'in', value: ['GJ-01'] },
            { field: 'vehicleMake', operator: 'in', value: ['maruti_suzuki'] },
          ],
        },
        outcome: { type: 'percentage', value: 10 },
      },
    ];
    const overrides = [
      {
        id: 'broker_override',
        agentId: 'AGT-1002',
        name: 'Quick override: Priya Nair — GJ-01 + Maruti Suzuki',
        insurerId: 'ALL',
        conditionTree: {
          logic: 'AND',
          conditions: [
            { field: 'rto', operator: 'in', value: ['GJ-01'] },
            { field: 'vehicleMake', operator: 'in', value: ['maruti_suzuki'] },
          ],
        },
        outcome: { type: 'percentage', value: 18 },
      },
    ];
    const input = {
      rto: 'GJ-01',
      vehicleMake: 'maruti_suzuki',
      vehicleClass: 'private_car',
      fuelType: 'petrol',
      vehicleAge: 3,
      policyType: 'new',
      agentId: 'AGT-1002',
    };

    const resultsForBroker = evaluateCommission(input, seedInsurers, rules, overrides, '2026-06-01');
    const icici = resultsForBroker.find((r) => r.insurerId === 'icici_lombard');
    expect(icici.precedenceTier).toBe('agentOverride');
    expect(icici.outcome.value).toBe(18);

    const resultsForOtherAgent = evaluateCommission({ ...input, agentId: 'AGT-9999' }, seedInsurers, rules, overrides, '2026-06-01');
    const iciciOther = resultsForOtherAgent.find((r) => r.insurerId === 'icici_lombard');
    expect(iciciOther.precedenceTier).toBe('rto');
    expect(iciciOther.outcome.value).toBe(10);
  });

  it('an RTO + Vehicle Company rule with no broker match does not fire for a different vehicle company', () => {
    const rules = [
      {
        id: 'rto_make_rule',
        name: 'Quick rule: GJ-01 + Maruti Suzuki',
        insurerId: 'ALL',
        scopeType: 'rto',
        priority: 5,
        active: true,
        conditionTree: {
          logic: 'AND',
          conditions: [
            { field: 'rto', operator: 'in', value: ['GJ-01'] },
            { field: 'vehicleMake', operator: 'in', value: ['maruti_suzuki'] },
          ],
        },
        outcome: { type: 'percentage', value: 10 },
      },
    ];
    const results = evaluateCommission(
      { rto: 'GJ-01', vehicleMake: 'hyundai', vehicleClass: 'private_car', fuelType: 'petrol', vehicleAge: 3, policyType: 'new', agentId: 'AGT-9999' },
      seedInsurers,
      rules,
      [],
      '2026-06-01'
    );
    const icici = results.find((r) => r.insurerId === 'icici_lombard');
    expect(icici.precedenceTier).toBe('insurerDefault');
  });

  it('applies the reduced SAOD commission rule across all insurers', () => {
    const results = run({
      rto: 'DL-01',
      vehicleClass: 'private_car',
      fuelType: 'petrol',
      vehicleAge: 4,
      policyType: 'saod',
      caseType: 'new',
      seatingCapacity: 5,
      agentId: 'AGT-9999',
    });
    const hdfc = results.find((r) => r.insurerId === 'hdfc_ergo');
    expect(hdfc.precedenceTier).toBe('vehicleParam');
    expect(hdfc.outcome.value).toBe(6);
  });

  it('applies the high-seating PCV bonus for Go Digit when seating capacity > 6', () => {
    const results = run({
      rto: 'GJ-05',
      vehicleClass: 'commercial_pcv',
      fuelType: 'diesel',
      vehicleAge: 2,
      policyType: 'package',
      caseType: 'new',
      seatingCapacity: 12,
      agentId: 'AGT-9999',
    });
    const digit = results.find((r) => r.insurerId === 'go_digit');
    expect(digit.precedenceTier).toBe('vehicleParam');
    expect(digit.outcome.value).toBe(10.5);
  });

  it('does not apply the high-seating PCV bonus when seating capacity is 6 or below', () => {
    const results = run({
      rto: 'GJ-05',
      vehicleClass: 'commercial_pcv',
      fuelType: 'diesel',
      vehicleAge: 2,
      policyType: 'package',
      caseType: 'new',
      seatingCapacity: 4,
      agentId: 'AGT-9999',
    });
    const digit = results.find((r) => r.insurerId === 'go_digit');
    expect(digit.precedenceTier).toBe('insurerDefault');
  });

  it('applies the reduced Break-In case-type commission across all insurers', () => {
    const results = run({
      rto: 'MH-12',
      vehicleClass: 'private_car',
      fuelType: 'petrol',
      vehicleAge: 6,
      policyType: 'package',
      caseType: 'break_in',
      seatingCapacity: 5,
      agentId: 'AGT-9999',
    });
    const tataAig = results.find((r) => r.insurerId === 'tata_aig');
    expect(tataAig.precedenceTier).toBe('vehicleParam');
    expect(tataAig.outcome.value).toBe(5);
  });
});
