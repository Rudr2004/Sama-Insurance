import { describe, it, expect } from 'vitest';
import { matchQuoteGrid, sortQuotesByFinalPremium, computeCommissionAmount } from './matchQuoteGrid.js';
import { seedQuoteGrid } from '../data/quoteGridSeed.js';

describe('matchQuoteGrid', () => {
  it('returns one row per insurer for a known vehicle profile (Swift)', () => {
    const results = matchQuoteGrid(
      { vehicleClass: 'private_car', vehicleMake: 'maruti_suzuki', vehicleModel: 'swift', fuelType: 'petrol', rto: 'MH-12' },
      seedQuoteGrid
    );
    expect(results.length).toBe(6);
    const insurerIds = new Set(results.map((r) => r.insurerId));
    expect(insurerIds.size).toBe(6);
  });

  it('returns no rows for a vehicle profile that does not exist in the grid', () => {
    const results = matchQuoteGrid(
      { vehicleClass: 'private_car', vehicleMake: 'maruti_suzuki', vehicleModel: 'swift', fuelType: 'diesel', rto: 'DL-01' },
      seedQuoteGrid
    );
    expect(results.length).toBe(0);
  });

  it('excludes unpublished rows', () => {
    const grid = [
      { id: 'a', vehicleClass: 'private_car', vehicleMake: 'x', vehicleModel: 'y', fuelType: 'petrol', rto: 'GJ-01', published: false, finalPremium: 1000, commission: { type: 'percentage', value: 10 } },
    ];
    const results = matchQuoteGrid(
      { vehicleClass: 'private_car', vehicleMake: 'x', vehicleModel: 'y', fuelType: 'petrol', rto: 'GJ-01' },
      grid
    );
    expect(results.length).toBe(0);
  });

  it('sorts quotes by final premium ascending', () => {
    const quotes = [
      { id: 'a', finalPremium: 500 },
      { id: 'b', finalPremium: 100 },
      { id: 'c', finalPremium: 300 },
    ];
    const sorted = sortQuotesByFinalPremium(quotes);
    expect(sorted.map((q) => q.id)).toEqual(['b', 'c', 'a']);
  });

  it('computes commission amount for a percentage-type row', () => {
    const row = { finalPremium: 10000, commission: { type: 'percentage', value: 10 } };
    expect(computeCommissionAmount(row)).toBe(1000);
  });

  it('computes commission amount for a flat-type row', () => {
    const row = { finalPremium: 10000, commission: { type: 'flat', value: 750 } };
    expect(computeCommissionAmount(row)).toBe(750);
  });
});
