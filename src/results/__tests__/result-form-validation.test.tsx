/**
 * Tests for result validation logic
 * Tests the validation functions for individual tests and panels
 */

import { validateResults } from "../result-form-validation.utils";

// Mock validation utilities that we'll create
describe("Result Validation Tests", () => {
  describe("Panel validation", () => {
    it("should require at least one panel member result", () => {
      const panelConcept = {
        uuid: "panel-uuid",
        display: "Test Panel",
        datatype: { display: "Text", uuid: "datatype-uuid" },
        set: true,
        setMembers: [
          {
            uuid: "member-1",
            display: "Test 1",
            datatype: { display: "Text", uuid: "datatype-text" },
          },
          {
            uuid: "member-2",
            display: "Test 2",
            datatype: { display: "Text", uuid: "datatype-text" },
          },
        ],
      } as any;

      const formValues = {
        "member-1": "", // Empty
        "member-2": "", // Empty
      };

      const result = validateResults(panelConcept, formValues);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Panel must have at least one result");
    });

    it("should accept panel with at least one filled result", () => {
      const panelConcept = {
        uuid: "panel-uuid",
        display: "Test Panel",
        datatype: { display: "Text", uuid: "datatype-uuid" },
        set: true,
        setMembers: [
          {
            uuid: "member-1",
            display: "Test 1",
            datatype: { display: "Text", uuid: "datatype-text" },
          },
          {
            uuid: "member-2",
            display: "Test 2",
            datatype: { display: "Text", uuid: "datatype-text" },
          },
        ],
      } as any;

      const formValues = {
        "member-1": "Result 1",
        "member-2": "", // Empty
      };

      const result = validateResults(panelConcept, formValues);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate numeric ranges for panel members", () => {
      const panelConcept = {
        uuid: "panel-uuid",
        display: "CBC Panel",
        datatype: { display: "Numeric", uuid: "datatype-numeric" },
        set: true,
        setMembers: [
          {
            uuid: "member-1",
            display: "Hemoglobin",
            datatype: { display: "Numeric", uuid: "datatype-numeric" },
            hiAbsolute: 18,
            lowAbsolute: 8,
          },
        ],
      } as any;

      const formValues = {
        "member-1": "25", // Too high
      };

      const result = validateResults(panelConcept, formValues);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("critically high"))).toBe(true);
    });

    it("should reject non-numeric values for numeric tests", () => {
      const panelConcept = {
        uuid: "panel-uuid",
        display: "CBC Panel",
        datatype: { display: "Numeric", uuid: "datatype-numeric" },
        set: true,
        setMembers: [
          {
            uuid: "member-1",
            display: "Hemoglobin",
            datatype: { display: "Numeric", uuid: "datatype-numeric" },
          },
        ],
      } as any;

      const formValues = {
        "member-1": "not a number",
      };

      const result = validateResults(panelConcept, formValues);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("valid number"))).toBe(true);
    });
  });

  describe("Individual test validation", () => {
    it("should require value for individual test", () => {
      const singleConcept = {
        set: false,
        setMembers: [],
        uuid: "test-uuid",
        display: "Malaria Test",
        datatype: { display: "Coded" },
      };

      const formValues = {
        "test-uuid": "", // Empty
      };

      const result = validateResults(singleConcept, formValues);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Test must have a value to save");
    });

    it("should accept valid value for individual test", () => {
      const singleConcept = {
        set: false,
        setMembers: [],
        uuid: "test-uuid",
        display: "Malaria Test",
        datatype: { display: "Coded" },
      };

      const formValues = {
        "test-uuid": { uuid: "answer-uuid" },
      };

      const result = validateResults(singleConcept, formValues);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate numeric range for individual test", () => {
      const singleConcept = {
        set: false,
        setMembers: [],
        uuid: "test-uuid",
        display: "Blood Pressure",
        datatype: { display: "Numeric" },
        hiAbsolute: 200,
        lowAbsolute: 60,
      };

      const formValues = {
        "test-uuid": "50", // Too low
      };

      const result = validateResults(singleConcept, formValues);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("critically low"))).toBe(true);
    });

    it("should accept value within valid range", () => {
      const singleConcept = {
        set: false,
        setMembers: [],
        uuid: "test-uuid",
        display: "Blood Pressure",
        datatype: { display: "Numeric" },
        hiAbsolute: 200,
        lowAbsolute: 60,
      };

      const formValues = {
        "test-uuid": "120", // Within range
      };

      const result = validateResults(singleConcept, formValues);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Coded value handling", () => {
    it("should reject empty object for coded values", () => {
      const singleConcept = {
        uuid: "test-uuid",
        display: "Malaria Test",
        datatype: { display: "Coded", uuid: "coded-uuid" },
        set: false,
        setMembers: [],
      };

      const formValues = {
        "test-uuid": undefined as any, // Empty object equivalent
      };

      const result = validateResults(singleConcept, formValues);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Test must have a value to save");
    });

    it("should reject object with empty uuid for coded values", () => {
      const singleConcept = {
        set: false,
        setMembers: [],
        uuid: "test-uuid",
        display: "Malaria Test",
        datatype: { display: "Coded" },
      };

      const formValues = {
        "test-uuid": { uuid: "" },
      };

      const result = validateResults(singleConcept, formValues);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Test must have a value to save");
    });

    it("should accept valid coded value object", () => {
      const singleConcept = {
        set: false,
        setMembers: [],
        uuid: "test-uuid",
        display: "Malaria Test",
        datatype: { display: "Coded" },
      };

      const formValues = {
        "test-uuid": { uuid: "answer-uuid" },
      };

      const result = validateResults(singleConcept, formValues);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Edge cases", () => {
    it("should handle null values", () => {
      const singleConcept = {
        set: false,
        setMembers: [],
        uuid: "test-uuid",
        display: "Test",
        datatype: { display: "Text" },
      };

      const formValues = {
        "test-uuid": null,
      };

      const result = validateResults(singleConcept, formValues);
      expect(result.isValid).toBe(false);
    });

    it("should handle undefined values", () => {
      const singleConcept = {
        set: false,
        setMembers: [],
        uuid: "test-uuid",
        display: "Test",
        datatype: { display: "Text" },
      };

      const formValues = {
        "test-uuid": undefined,
      };

      const result = validateResults(singleConcept, formValues);
      expect(result.isValid).toBe(false);
    });

    it("should handle missing concept limits gracefully", () => {
      const singleConcept = {
        set: false,
        setMembers: [],
        uuid: "test-uuid",
        display: "Test",
        datatype: { display: "Numeric" },
        // No hiAbsolute or lowAbsolute defined
      };

      const formValues = {
        "test-uuid": "1000", // Would normally be out of range
      };

      const result = validateResults(singleConcept, formValues);
      expect(result.isValid).toBe(true); // No limits to check against
      expect(result.errors).toHaveLength(0);
    });
  });
});
