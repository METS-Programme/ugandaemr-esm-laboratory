/**
 * Tests for transaction management in result saving
 * Tests the rollback behavior when observation save fails
 */

import { UpdateOrderResult } from "../result-form.resource";
import { validateObservationPayload } from "../result-form-validation.utils";
import { openmrsFetch } from "@openmrs/esm-framework";

// Mock the openmrsFetch function
jest.mock("@openmrs/esm-framework", () => ({
  openmrsFetch: jest.fn(),
  restBaseUrl: "/ws/rest/v1",
}));

describe("Transaction Management Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateObservationPayload", () => {
    it("should accept valid observation payload", async () => {
      const validPayload = {
        obs: [
          {
            concept: { uuid: "concept-uuid" },
            value: "test-value",
            status: "FINAL" as const,
            order: { uuid: "order-uuid" },
          },
        ],
      };

      const result = await validateObservationPayload(validPayload);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject payload without obs array", async () => {
      const invalidPayload = { data: "something" };

      const result = await validateObservationPayload(invalidPayload);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid observation payload structure");
    });

    it("should reject empty obs array", async () => {
      const emptyPayload = { obs: [] };

      const result = await validateObservationPayload(emptyPayload);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("No observations to save");
    });

    it("should reject observation without concept UUID", async () => {
      const invalidPayload = {
        obs: [
          {
            value: "test-value",
            status: "FINAL" as const,
          },
        ],
      };

      const result = await validateObservationPayload(invalidPayload);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Observation missing concept UUID");
    });

    it("should reject observation without status", async () => {
      const invalidPayload = {
        obs: [
          {
            concept: { uuid: "concept-uuid" },
            value: "test-value",
          },
        ],
      };

      const result = await validateObservationPayload(invalidPayload);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Observation missing status");
    });
  });

  describe("rollbackDiscontinuedOrder", () => {
    it("should rollback a discontinued order successfully", async () => {
      const discontinuedOrder = {
        uuid: "order-uuid",
        stopped: true,
        dateStopped: "2025-04-25",
      };

      (openmrsFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => discontinuedOrder,
      });

      (openmrsFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      // Test rollback through the main transaction function
      const mockObsPayload = {
        obs: [{
          concept: { uuid: "concept-uuid" },
          value: "test-value",
          status: "FINAL" as const,
          order: { uuid: "order-uuid" },
        }]
      };

      const mockOrderPayload = {
        previousOrder: "order-uuid",
        type: "testorder",
        action: "DISCONTINUE" as const,
        careSetting: "care-setting-uuid",
        encounter: "encounter-uuid",
        patient: "patient-uuid",
        concept: "concept-uuid",
        orderer: "orderer-uuid",
      };

      (openmrsFetch as jest.Mock)
        .mockResolvedValueOnce({ status: 201 }) // Order update
        .mockRejectedValueOnce(new Error("Network error")) // Observation save fails
        .mockResolvedValueOnce({ ok: true, json: async () => discontinuedOrder }) // Get order for rollback
        .mockResolvedValueOnce({ ok: true }); // Rollback deletion

      const result = await UpdateOrderResult("encounter-uuid", mockObsPayload, mockOrderPayload);

      expect(result.success).toBe(false);
      expect(result.orderUpdated).toBe(true);
      expect(result.observationSaved).toBe(false);
      expect(result.error).toContain("Order has been rolled back");
    });

    it("should handle non-discontinued orders gracefully", async () => {
      const activeOrder = {
        uuid: "order-uuid",
        stopped: false,
        dateStopped: null,
      };

      (openmrsFetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => activeOrder,
      });

      // Non-discontinued order doesn't need rollback
      expect(openmrsFetch).not.toHaveBeenCalledWith(
        "/ws/rest/v1/order/order-uuid",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    it("should handle rollback errors", async () => {
      const mockObsPayload = {
        obs: [{
          concept: { uuid: "concept-uuid" },
          value: "test-value",
          status: "FINAL" as const,
          order: { uuid: "order-uuid" },
        }]
      };

      const mockOrderPayload = {
        previousOrder: "order-uuid",
        type: "testorder",
        action: "DISCONTINUE" as const,
        careSetting: "care-setting-uuid",
        encounter: "encounter-uuid",
        patient: "patient-uuid",
        concept: "concept-uuid",
        orderer: "orderer-uuid",
      };

      (openmrsFetch as jest.Mock)
        .mockResolvedValueOnce({ status: 201 }) // Order update
        .mockRejectedValueOnce(new Error("Network error")) // Observation save fails
        .mockRejectedValueOnce(new Error("Network error")); // Rollback also fails

      const result = await UpdateOrderResult("encounter-uuid", mockObsPayload, mockOrderPayload);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Order rollback failed");
    });
  });

  describe("UpdateOrderResult transaction behavior", () => {
    const mockEncounterUuid = "encounter-uuid";
    const mockObsPayload = {
      obs: [
        {
          concept: { uuid: "concept-uuid" },
          value: "test-value",
          status: "FINAL" as const,
          order: { uuid: "order-uuid" },
        },
      ],
    };
    const mockOrderPayload = {
      previousOrder: "previous-order-uuid",
      type: "testorder",
      action: "DISCONTINUE" as const,
      careSetting: "care-setting-uuid",
      encounter: "encounter-uuid",
      patient: "patient-uuid",
      concept: "concept-uuid",
      orderer: "orderer-uuid",
    };

    it("should successfully save both order and observations", async () => {
      (openmrsFetch as jest.Mock)
        .mockResolvedValueOnce({ status: 201 }) // Order update success
        .mockResolvedValueOnce({ ok: true }); // Observation save success

      const result = await UpdateOrderResult(
        mockEncounterUuid,
        mockObsPayload,
        mockOrderPayload
      );

      expect(result.success).toBe(true);
      expect(result.orderUpdated).toBe(true);
      expect(result.observationSaved).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should fail validation with empty obs array", async () => {
      const emptyPayload = { obs: [] };

      const result = await UpdateOrderResult(
        mockEncounterUuid,
        emptyPayload,
        mockOrderPayload
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("No observations to save");
      expect(result.orderUpdated).toBe(false);
      expect(result.observationSaved).toBe(false);
    });

    it("should rollback when observation save fails after order update", async () => {
      const discontinuedOrder = {
        uuid: "previous-order-uuid",
        stopped: true,
        dateStopped: "2025-04-25",
      };

      (openmrsFetch as jest.Mock)
        .mockResolvedValueOnce({ status: 201 }) // Order update success
        .mockRejectedValueOnce(new Error("Network error")) // Observation save failure
        .mockResolvedValueOnce({
          // Rollback order fetch
          ok: true,
          json: async () => discontinuedOrder,
        })
        .mockResolvedValueOnce({ ok: true }); // Rollback deletion

      const result = await UpdateOrderResult(
        mockEncounterUuid,
        mockObsPayload,
        mockOrderPayload
      );

      expect(result.success).toBe(false);
      expect(result.orderUpdated).toBe(true);
      expect(result.observationSaved).toBe(false);
      expect(result.error).toContain("Observation save failed");
      expect(result.error).toContain("Order has been rolled back");
    });

    it("should not update order when validation fails", async () => {
      const invalidPayload = {
        obs: [
          {
            concept: { uuid: "concept-uuid" },
            value: "test-value",
            // Missing status
          },
        ],
      } as any;

      const result = await UpdateOrderResult(
        mockEncounterUuid,
        invalidPayload,
        mockOrderPayload
      );

      expect(result.success).toBe(false);
      expect(result.orderUpdated).toBe(false);
      expect(result.observationSaved).toBe(false);
      expect(openmrsFetch).not.toHaveBeenCalled(); // Should not call any API
    });

    it("should handle order update failure without rollback", async () => {
      (openmrsFetch as jest.Mock).mockResolvedValueOnce({
        status: 400,
        data: { error: { message: "Order validation failed" } },
      });

      const result = await UpdateOrderResult(
        mockEncounterUuid,
        mockObsPayload,
        mockOrderPayload
      );

      expect(result.success).toBe(false);
      expect(result.orderUpdated).toBe(false);
      expect(result.observationSaved).toBe(false);
      expect(result.error).toContain("Order update failed");
    });

    it("should handle observation save failure with error status", async () => {
      const discontinuedOrder = {
        uuid: "previous-order-uuid",
        stopped: true,
        dateStopped: "2025-04-25",
      };

      (openmrsFetch as jest.Mock)
        .mockResolvedValueOnce({ status: 201 }) // Order update success
        .mockResolvedValueOnce({
          // Observation save with error status
          ok: false,
          data: { error: { message: "Concept not found" } },
        })
        .mockResolvedValueOnce({
          // Rollback order fetch
          ok: true,
          json: async () => discontinuedOrder,
        })
        .mockResolvedValueOnce({ ok: true }); // Rollback deletion

      const result = await UpdateOrderResult(
        mockEncounterUuid,
        mockObsPayload,
        mockOrderPayload
      );

      expect(result.success).toBe(false);
      expect(result.orderUpdated).toBe(true);
      expect(result.observationSaved).toBe(false);
      expect(result.error).toContain("Observation save failed");
      expect(result.error).toContain("Concept not found");
      expect(result.error).toContain("Order has been rolled back");
    });
  });
});
