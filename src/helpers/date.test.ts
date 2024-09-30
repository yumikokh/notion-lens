import { describe, it, expect } from "vitest";
import { validDateRange, startMonth, endMonth, formatDate } from "./date";

describe("dateUtils", () => {
  describe(validDateRange, () => {
    it("returns correct date range when both dates are provided", () => {
      const from = new Date("2024-09-01");
      const to = new Date("2024-09-30");

      const result = validDateRange(from, to);

      expect(result).toEqual({
        from: new Date("2024-09-01 0:00:00").toISOString(),
        to: new Date("2024-09-30 23:59:59.999").toISOString(),
      });
    });

    it("returns start of month when only start date is provided", () => {
      const result = validDateRange(new Date("2023-01-15"));
      expect(result).toEqual({
        from: new Date("2023-01-15 0:00:00").toISOString(),
        to: new Date("2023-01-31 23:59:59.999").toISOString(),
      });
    });

    it("returns start and end of month when no dates are provided", () => {
      const result = validDateRange();
      const today = new Date();
      expect(result).toEqual(
        expect.objectContaining({
          from: new Date(`${today.getFullYear()}-09-01 0:00:00`).toISOString(),
        })
      );
    });

    it("returns start and end of month when no dates are provided", () => {
      const result = validDateRange(new Date("3/15"));
      const today = new Date();
      expect(result).toEqual({
        from: new Date(`${today.getFullYear()}-03-15 0:00:00`).toISOString(),
        to: new Date(`${today.getFullYear()}-03-31 23:59:59.999`).toISOString(),
      });
    });

    it("returns start and end of month when only end date is provided", () => {
      const result = validDateRange(undefined, new Date("2023-01-31"));
      expect(result).toEqual({
        from: new Date("2023-01-01 0:00:00").toISOString(),
        to: new Date("2023-01-31 23:59:59.999").toISOString(),
      });
    });

    it("throws error for invalid date range", () => {
      const fn = () =>
        validDateRange(new Date("2023-01-31"), new Date("2023-01-30"));
      expect(fn).toThrow("Invalid date range");
    });
  });

  describe(startMonth, () => {
    it("startMonth returns first day of month", () => {
      const date = new Date("2023-05-15");
      const result = startMonth(date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(4); // May is 4 in JavaScript months
      expect(result.getDate()).toBe(1);
    });
  });

  describe(endMonth, () => {
    it("endMonth returns last day of month", () => {
      const date = new Date("2023-05-15");
      const result = endMonth(date);
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(4); // May is 4 in JavaScript months
      expect(result.getDate()).toBe(31);
    });
  });

  describe(formatDate, () => {
    it("formatDate formats date correctly", () => {
      const date = new Date("2023-05-15");
      const result = formatDate(date, "yyyy/mm/dd");
      expect(result).toBe("2023/05/15");
    });
  });
});
