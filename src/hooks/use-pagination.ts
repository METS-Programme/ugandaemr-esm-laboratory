/**
 * Custom hook for pagination management
 * Provides consistent pagination logic across tables and lists
 */

import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface PaginationOptions {
  initialPageSize?: number;
  availablePageSizes?: number[];
  totalItems?: number;
}

export interface PaginationState {
  currentPage: number;
  currentPageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  resetPagination: () => void;
}

/**
 * Hook for managing pagination state and actions
 * @param options - Pagination configuration options
 * @returns Pagination state and action handlers
 */
export function usePagination(options: PaginationOptions = {}) {
  const {
    initialPageSize = 20,
    availablePageSizes = [10, 20, 30, 40, 50],
    totalItems = 0,
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(initialPageSize);

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / currentPageSize);

  // Calculate current page boundaries
  const startIndex = (currentPage - 1) * currentPageSize;
  const endIndex = Math.min(startIndex + currentPageSize, totalItems);

  // Navigation state
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Go to specific page
  const goToPage = useCallback(
    (page: number) => {
      const targetPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(targetPage);
    },
    [totalPages]
  );

  // Go to next page
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  // Go to previous page
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  // Change page size
  const setPageSize = useCallback((size: number) => {
    setCurrentPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  // Reset pagination to initial state
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setCurrentPageSize(initialPageSize);
  }, [initialPageSize]);

  // Get paginated data from array
  const getPaginatedData = useCallback(
    <T,>(data: T[]): T[] => {
      if (!data || data.length === 0) return [];
      return data.slice(startIndex, endIndex);
    },
    [startIndex, endIndex]
  );

  // Pagination state object
  const paginationState: PaginationState = useMemo(
    () => ({
      currentPage,
      currentPageSize,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage,
      hasPreviousPage,
    }),
    [currentPage, currentPageSize, endIndex, hasNextPage, hasPreviousPage, startIndex, totalPages]
  );

  // Pagination actions object
  const paginationActions: PaginationActions = useMemo(
    () => ({
      goToPage,
      nextPage,
      previousPage,
      setPageSize,
      resetPagination,
    }),
    [goToPage, hasNextPage, hasPreviousPage, nextPage, previousPage, resetPagination, setPageSize]
  );

  return {
    ...paginationState,
    ...paginationActions,
    availablePageSizes,
    getPaginatedData,
  };
}

/**
 * Hook for paginating array data
 * Automatically handles total items based on array length
 */
export function useArrayPagination<T>(
  data: T[] = [],
  options: Omit<PaginationOptions, 'totalItems'> = {}
) {
  const totalItems = data.length;
  const pagination = usePagination({ ...options, totalItems });

  // Get current page data
  const paginatedData = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.currentPageSize;
    const end = Math.min(start + pagination.currentPageSize, totalItems);
    return data.slice(start, end);
  }, [data, pagination.currentPage, pagination.currentPageSize, totalItems]);

  return {
    ...pagination,
    paginatedData,
    totalItems,
  };
}
