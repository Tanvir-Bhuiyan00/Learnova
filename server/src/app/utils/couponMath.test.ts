import { describe, expect, it } from "vitest";
import {
  calculateCartTotals,
  calculateItemDiscount,
} from "./couponMath";

describe("calculateCartTotals", () => {
  const courses = [{ price: 100, discountPrice: null }];

  it("computes plain subtotal with no coupon", () => {
    expect(calculateCartTotals(courses, null)).toEqual({
      subtotal: 100,
      discount: 0,
      total: 100,
    });
  });

  it("applies percentage discount", () => {
    expect(
      calculateCartTotals(courses, { discountType: "PERCENTAGE", discountValue: 20 }),
    ).toEqual({ subtotal: 100, discount: 20, total: 80 });
  });

  it("applies fixed discount", () => {
    expect(
      calculateCartTotals(courses, { discountType: "FIXED", discountValue: 15 }),
    ).toEqual({ subtotal: 100, discount: 15, total: 85 });
  });

  it("caps discount at subtotal (never negative total)", () => {
    expect(
      calculateCartTotals(
        [{ price: 50, discountPrice: null }],
        { discountType: "FIXED", discountValue: 500 },
      ),
    ).toEqual({ subtotal: 50, discount: 50, total: 0 });
  });

  it("uses discountPrice when present", () => {
    expect(
      calculateCartTotals(
        [{ price: 200, discountPrice: 150 }],
        { discountType: "PERCENTAGE", discountValue: 10 },
      ),
    ).toEqual({ subtotal: 150, discount: 15, total: 135 });
  });

  it("rounds discounts to 2 decimals", () => {
    const result = calculateCartTotals(
      [{ price: 333, discountPrice: null }],
      { discountType: "PERCENTAGE", discountValue: 33 },
    );
    expect(result.discount).toBe(109.89);
    expect(result.total).toBeCloseTo(223.11, 2);
  });
});

describe("calculateItemDiscount", () => {
  it("returns 0 when subtotal or discount is 0", () => {
    expect(calculateItemDiscount(100, 0, 20)).toBe(0);
    expect(calculateItemDiscount(100, 500, 0)).toBe(0);
  });

  it("apportions discount proportionally to item price", () => {
    // item is 1/4 of the 400 subtotal, 20% coupon => 80 total discount => 20 for the item
    expect(calculateItemDiscount(100, 400, 80)).toBe(20);
  });
});