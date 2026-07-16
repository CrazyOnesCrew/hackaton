import { describe, it, expect } from "vitest";
import { formatCurrency, formatNumber } from "./format";

describe("formatCurrency", () => {
  it("formats integers with es-ES separators and € suffix", () => {
    expect(formatCurrency(157342)).toBe("157.342 €");
  });
  it("supports two decimals when requested", () => {
    expect(formatCurrency(999, { decimals: 2 })).toBe("999,00 €");
  });
});

describe("formatNumber", () => {
  it("adds es-ES thousands separators", () => {
    expect(formatNumber(10892)).toBe("10.892");
  });
});
