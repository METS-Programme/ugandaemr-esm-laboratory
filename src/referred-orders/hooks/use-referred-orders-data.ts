/**
 * Custom hook for managing referred orders data and pagination
 * Encapsulates data fetching, filtering, and pagination logic
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePagination } from "@openmrs/esm-framework";
import { useGetNewReferredOrders } from "../../work-list/work-list.resource";
import { useOrderDate } from "../../utils/functions";

export type SyncView = "NOT_SYNCED" | "SYNCED";

export interface ReferredOrdersDataState {
  syncView: SyncView;
  setSyncView: React.Dispatch<React.SetStateAction<SyncView>>;
  currentOrdersDate: string;
  isLoading: boolean;
  paginatedReferredOrderEntries: Array<any>;
  currentPage: number;
  goTo: (page: number) => void;
  currentPageSize: number;
  setPageSize: (size: number) => void;
  toggleSyncView: () => void;
}

/**
 * Hook for managing referred orders data and pagination
 * @returns Data state and pagination handlers
 */
export function useReferredOrdersData(): ReferredOrdersDataState {
  const { t } = useTranslation();
  const { currentOrdersDate } = useOrderDate();

  const [syncView, setSyncView] = useState<SyncView>("NOT_SYNCED");
  const [currentPageSize, setPageSize] = useState(10);

  // Fetch referred orders based on current sync view
  const { data: referredOrderList, isLoading } = useGetNewReferredOrders(
    syncView === "NOT_SYNCED" ? "IN_PROGRESS" : "RECEIVED",
    currentOrdersDate
  );

  // Setup pagination
  const {
    goTo,
    results: paginatedReferredOrderEntries,
    currentPage,
  } = usePagination(referredOrderList || [], currentPageSize);

  // Toggle between synced and not-synced views
  const toggleSyncView = () => {
    setSyncView((prev) => (prev === "NOT_SYNCED" ? "SYNCED" : "NOT_SYNCED"));
  };

  return {
    syncView,
    setSyncView,
    currentOrdersDate,
    isLoading,
    paginatedReferredOrderEntries,
    currentPage,
    goTo,
    currentPageSize,
    setPageSize,
    toggleSyncView,
  };
}
