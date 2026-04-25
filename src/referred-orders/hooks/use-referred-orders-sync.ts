/**
 * Custom hook for managing referred orders sync operations
 * Encapsulates all sync-related state and operations
 */

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { showSnackbar } from "@openmrs/esm-framework";
import { extractErrorMessagesFromResponse, handleMutate } from "../../utils/functions";
import { restBaseUrl } from "@openmrs/esm-framework";
import {
  syncAllTestOrders,
  getAllTestOrderResults,
  syncSelectedTestOrderResults,
  syncSelectedTestOrders,
} from "../referred-orders.resource";

export interface SyncOperationsState {
  isSyncingAllTestOrders: boolean;
  isSyncingAllTestOrderResults: boolean;
  isSyncingSelectedTestOrders: boolean;
  isSyncingSelectedTestOrderResults: boolean;
}

export interface SyncOperationsHandlers {
  handleSyncAllTestOrders: () => Promise<void>;
  handleSyncAllTestOrderResults: () => Promise<void>;
  handleSyncSelectedTestOrders: (selectedRows: Array<{ id: string }>) => Promise<void>;
  handleSyncSelectedTestOrderResults: (selectedRows: Array<{ id: string }>) => Promise<void>;
}

/**
 * Hook for managing referred orders sync operations
 * @returns Sync state and operation handlers
 */
export function useReferredOrdersSync(): SyncOperationsState & SyncOperationsHandlers {
  const { t } = useTranslation();

  const [isSyncingAllTestOrders, setIsSyncingAllTestOrders] = useState(false);
  const [isSyncingAllTestOrderResults, setIsSyncingAllTestOrderResults] = useState(false);
  const [isSyncingSelectedTestOrders, setIsSyncingSelectedTestOrders] = useState(false);
  const [isSyncingSelectedTestOrderResults, setIsSyncingSelectedTestOrderResults] = useState(false);

  const handleSyncAllTestOrders = useCallback(async () => {
    setIsSyncingAllTestOrders(true);
    try {
      const res = await syncAllTestOrders();
      if (![200, 201].includes(res.status)) {
        const message = res?.data?.responseList?.[0]?.responseMessage || t("syncFailed", "Failed to sync test orders.");
        throw new Error(message);
      }

      showSnackbar({
        title: t("syncSuccess", "Sync successful"),
        subtitle: t("syncSuccess", "Test orders synced successfully."),
        kind: "success",
      });
      handleMutate(`${restBaseUrl}/referredorders`);
    } catch (error) {
      const errorMessages = extractErrorMessagesFromResponse(error);
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle: errorMessages.join(", ") || t("syncFailed", "An unexpected error occurred."),
        kind: "error",
      });
      handleMutate(`${restBaseUrl}/referredorders`);
    } finally {
      setIsSyncingAllTestOrders(false);
    }
  }, [t]);

  const handleSyncAllTestOrderResults = useCallback(async () => {
    setIsSyncingAllTestOrderResults(true);
    try {
      const res = await getAllTestOrderResults();
      if (![200, 201].includes(res.status)) {
        const message = res?.data?.responseList?.[0]?.responseMessage || t("syncFailed", "Failed to sync test results.");
        throw new Error(message);
      }

      showSnackbar({
        title: t("syncSuccess", "Sync successful"),
        subtitle: t("syncSuccess", "Test results synced successfully."),
        kind: "success",
      });
      handleMutate(`${restBaseUrl}/referredorders`);
    } catch (error) {
      const errorMessages = extractErrorMessagesFromResponse(error);
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle: errorMessages.join(", ") || t("syncFailed", "An unexpected error occurred."),
        kind: "error",
      });
      handleMutate(`${restBaseUrl}/referredorders`);
    } finally {
      setIsSyncingAllTestOrderResults(false);
    }
  }, [t]);

  const handleSyncSelectedTestOrders = useCallback(async (selectedRows: Array<{ id: string }>) => {
    if (selectedRows.length === 0) {
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle: t("syncStatus", "No rows selected to sync."),
        kind: "error",
      });
      return;
    }

    const idsToSync = selectedRows.map((row) => row.id);
    setIsSyncingSelectedTestOrders(true);
    try {
      const res = await syncSelectedTestOrders(idsToSync);
      if (![200, 201].includes(res.status)) {
        const message = res?.data?.responseList?.[0]?.responseMessage || t("syncFailed", "Failed to sync test orders.");
        throw new Error(message);
      }

      showSnackbar({
        title: t("syncSuccess", "Sync successful"),
        subtitle: t("syncSuccess", "Test orders synced successfully."),
        kind: "success",
      });
      handleMutate(`${restBaseUrl}/referredorders`);
    } catch (error) {
      const errorMessages = extractErrorMessagesFromResponse(error);
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle: errorMessages.join(", ") || t("syncFailed", "An unexpected error occurred."),
        kind: "error",
      });
      handleMutate(`${restBaseUrl}/referredorders`);
    } finally {
      setIsSyncingSelectedTestOrders(false);
    }
  }, [t]);

  const handleSyncSelectedTestOrderResults = useCallback(async (selectedRows: Array<{ id: string }>) => {
    if (selectedRows.length === 0) {
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle: t("syncStatus", "No rows selected to sync."),
        kind: "error",
      });
      return;
    }

    const idsToSync = selectedRows.map((row) => row.id);
    setIsSyncingSelectedTestOrderResults(true);
    try {
      const res = await syncSelectedTestOrderResults(idsToSync);
      if (![200, 201].includes(res.status)) {
        const message = res?.data?.responseList?.[0]?.responseMessage || t("syncFailed", "Failed to sync test results.");
        throw new Error(message);
      }

      showSnackbar({
        title: t("syncSuccess", "Sync successful"),
        subtitle: t("syncSuccess", "Test results synced successfully."),
        kind: "success",
      });
      handleMutate(`${restBaseUrl}/referredorders`);
    } catch (error) {
      const errorMessages = extractErrorMessagesFromResponse(error);
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle: errorMessages.join(", ") || t("syncFailed", "An unexpected error occurred."),
        kind: "error",
      });
      handleMutate(`${restBaseUrl}/referredorders`);
    } finally {
      setIsSyncingSelectedTestOrderResults(false);
    }
  }, [t]);

  return {
    isSyncingAllTestOrders,
    isSyncingAllTestOrderResults,
    isSyncingSelectedTestOrders,
    isSyncingSelectedTestOrderResults,
    handleSyncAllTestOrders,
    handleSyncAllTestOrderResults,
    handleSyncSelectedTestOrders,
    handleSyncSelectedTestOrderResults,
  };
}
