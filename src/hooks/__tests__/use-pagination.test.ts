/**
 * Tests for usePagination hook
 * Tests pagination logic, navigation, and data management
 */

import { renderHook, act } from "@testing-library/react";
import { usePagination, useArrayPagination } from "../use-pagination";

describe("usePagination", () => {
  describe("basic pagination", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => usePagination());

      expect(result.current.currentPage).toBe(1);
      expect(result.current.currentPageSize).toBe(20);
      expect(result.current.totalPages).toBe(0);
      expect(result.current.hasNextPage).toBe(false);
      expect(result.current.hasPreviousPage).toBe(false);
    });

    it("should calculate total pages correctly", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          initialPageSize: 10,
        })
      );

      expect(result.current.totalPages).toBe(10);
      expect(result.current.startIndex).toBe(0);
      expect(result.current.endIndex).toBe(10);
    });

    it("should handle page navigation", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 50,
          initialPageSize: 10,
        })
      );

      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasPreviousPage).toBe(false);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.hasPreviousPage).toBe(true);
      expect(result.current.hasNextPage).toBe(true);
    });

    it("should not navigate beyond page boundaries", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 20,
          initialPageSize: 10,
        })
      );

      // Try to go back from first page
      act(() => {
        result.current.previousPage();
      });

      expect(result.current.currentPage).toBe(1);

      // Go to last page
      act(() => {
        result.current.goToPage(2);
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.hasNextPage).toBe(false);

      // Try to go beyond last page
      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPage).toBe(2);
    });
  });

  describe("page size management", () => {
    it("should change page size and reset to first page", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          initialPageSize: 10,
        })
      );

      act(() => {
        result.current.goToPage(5);
        result.current.setPageSize(20);
      });

      expect(result.current.currentPageSize).toBe(20);
      expect(result.current.currentPage).toBe(1); // Reset to first page
      expect(result.current.totalPages).toBe(5); // 100 items / 20 per page
    });

    it("should support custom page sizes", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          initialPageSize: 10,
          availablePageSizes: [5, 10, 25, 50],
        })
      );

      expect(result.current.availablePageSizes).toEqual([5, 10, 25, 50]);
    });
  });

  describe("getPaginatedData", () => {
    it("should return correct data for current page", () => {
      const testData = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
      }));

      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          initialPageSize: 10,
        })
      );

      const page1Data = result.current.getPaginatedData(testData);
      expect(page1Data).toHaveLength(10);
      expect(page1Data[0].id).toBe(1);
      expect(page1Data[9].id).toBe(10);

      act(() => {
        result.current.nextPage();
      });

      const page2Data = result.current.getPaginatedData(testData);
      expect(page2Data).toHaveLength(10);
      expect(page2Data[0].id).toBe(11);
      expect(page2Data[9].id).toBe(20);
    });

    it("should handle empty data arrays", () => {
      const { result } = renderHook(() => usePagination());

      const paginatedData = result.current.getPaginatedData([]);
      expect(paginatedData).toHaveLength(0);
    });
  });

  describe("reset functionality", () => {
    it("should reset pagination to initial state", () => {
      const { result } = renderHook(() =>
        usePagination({
          totalItems: 100,
          initialPageSize: 20,
        })
      );

      act(() => {
        result.current.setPageSize(30);
        result.current.goToPage(3);
      });

      expect(result.current.currentPage).toBe(3);
      expect(result.current.currentPageSize).toBe(30);

      act(() => {
        result.current.resetPagination();
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.currentPageSize).toBe(20);
    });
  });
});

describe("useArrayPagination", () => {
  it("should automatically calculate total items from array", () => {
    const testData = [{ id: 1 }, { id: 2 }, { id: 3 }];

    const { result } = renderHook(() =>
      useArrayPagination(testData, {
        initialPageSize: 2,
      })
    );

    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalPages).toBe(2);
  });

  it("should provide paginated data directly", () => {
    const testData = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    const { result } = renderHook(() =>
      useArrayPagination(testData, {
        initialPageSize: 10,
      })
    );

    expect(result.current.paginatedData).toHaveLength(10);
    expect(result.current.paginatedData[0].id).toBe(1);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.paginatedData).toHaveLength(10);
    expect(result.current.paginatedData[0].id).toBe(11);
  });

  it("should handle empty arrays", () => {
    const { result } = renderHook(() => useArrayPagination([]));

    expect(result.current.totalItems).toBe(0);
    expect(result.current.paginatedData).toHaveLength(0);
    expect(result.current.totalPages).toBe(0);
  });

  it("should update paginated data when source array changes", () => {
    const testData1 = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));
    const testData2 = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));

    const { result, rerender } = renderHook(
      ({ data }) => useArrayPagination(data, { initialPageSize: 10 }),
      { initialProps: { data: testData1 } }
    );

    expect(result.current.totalItems).toBe(20);
    expect(result.current.totalPages).toBe(2);

    rerender({ data: testData2 });

    expect(result.current.totalItems).toBe(30);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.currentPage).toBe(1); // Reset to first page
  });
});
