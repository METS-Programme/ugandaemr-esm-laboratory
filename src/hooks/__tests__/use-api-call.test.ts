/**
 * Tests for useApiCall hook
 * Tests API call management, loading states, and error handling
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useApiCall, useGetApi, usePostApi } from "../use-api-call";
import { openmrsFetch } from "@openmrs/esm-framework";
import { showNotification } from "@openmrs/esm-framework";

// Mock the OpenMRS dependencies
jest.mock("@openmrs/esm-framework", () => ({
  openmrsFetch: jest.fn(),
  restBaseUrl: "/ws/rest/v1",
  showNotification: jest.fn(),
}));

describe("useApiCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("basic API call execution", () => {
    it("should handle successful API calls", async () => {
      const mockData = { result: "success" };
      (openmrsFetch as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockData,
        status: 200,
      });

      const { result } = renderHook(() => useApiCall<{ result: string }>());

      let apiResult;
      await act(async () => {
        apiResult = await result.current.execute(() =>
          openmrsFetch("/test", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
        );
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle API call failures", async () => {
      const mockError = new Error("API Error");
      (openmrsFetch as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useApiCall());

      let apiResult;
      await act(async () => {
        apiResult = await result.current.execute(() =>
          openmrsFetch("/test", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
        );
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).not.toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it("should set loading state during API call", async () => {
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (openmrsFetch as jest.Mock).mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useApiCall());

      act(() => {
        result.current.execute(() =>
          openmrsFetch("/test", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
        );
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({ ok: true, data: {}, status: 200 });
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("notifications", () => {
    it("should show success notification when configured", async () => {
      const mockData = { result: "success" };
      (openmrsFetch as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockData,
        status: 200,
      });

      const { result } = renderHook(() =>
        useApiCall({
          showNotifications: true,
          successMessage: "Data loaded successfully",
        })
      );

      await act(async () => {
        await result.current.execute(() =>
          openmrsFetch("/test", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
        );
      });

      expect(showNotification).toHaveBeenCalledWith({
        title: "Success",
        kind: "success",
        critical: false,
        description: "Data loaded successfully",
      });
    });

    it("should show error notification on failure", async () => {
      const mockError = new Error("API Error");
      (openmrsFetch as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useApiCall({
          showNotifications: true,
          errorContext: "loadData",
        })
      );

      await act(async () => {
        await result.current.execute(() =>
          openmrsFetch("/test", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
        );
      });

      expect(showNotification).toHaveBeenCalledWith({
        title: "loadData Error",
        kind: "error",
        critical: true,
        description: "API Error",
      });
    });
  });

  describe("reset functionality", () => {
    it("should reset state when calling reset", async () => {
      const mockData = { result: "success" };
      (openmrsFetch as jest.Mock).mockResolvedValue({
        ok: true,
        data: mockData,
        status: 200,
      });

      const { result } = renderHook(() => useApiCall());

      await act(async () => {
        await result.current.execute(() =>
          openmrsFetch("/test", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })
        );
      });

      expect(result.current.data).toEqual(mockData);

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});

describe("useGetApi", () => {
  it("should make GET requests", async () => {
    const mockData = { result: "success" };
    (openmrsFetch as jest.Mock).mockResolvedValue({
      ok: true,
      data: mockData,
      status: 200,
    });

    const { result } = renderHook(() => useGetApi("/test-endpoint"));

    await act(async () => {
      await result.current.fetchData();
    });

    expect(openmrsFetch).toHaveBeenCalledWith("/test-endpoint", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    expect(result.current.data).toEqual(mockData);
  });
});

describe("usePostApi", () => {
  it("should make POST requests with data", async () => {
    const mockPayload = { name: "Test" };
    const mockResponse = { success: true };
    (openmrsFetch as jest.Mock).mockResolvedValue({
      ok: true,
      data: mockResponse,
      status: 201,
    });

    const { result } = renderHook(() => usePostApi("/create"));

    await act(async () => {
      await result.current.postData(mockPayload);
    });

    expect(openmrsFetch).toHaveBeenCalledWith("/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: mockPayload,
    });
    expect(result.current.data).toEqual(mockResponse);
  });
});
