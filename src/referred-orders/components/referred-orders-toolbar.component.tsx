/**
 * Referred Orders Table Toolbar Component
 * Handles search, view toggling, and bulk operations
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
  Toggle,
  Layer,
} from "@carbon/react";
import { Search, Renew as Sync } from "@carbon/react/icons";
import styles from "../referred-orders.scss";

export interface ReferredOrdersToolbarProps {
  syncView: "NOT_SYNCED" | "SYNCED";
  onToggleView: () => void;
  onSyncAllTestOrders: () => Promise<void>;
  onSyncAllTestOrderResults: () => Promise<void>;
  isSyncingTestOrders: boolean;
  isSyncingTestResults: boolean;
  disabled?: boolean;
}

/**
 * Toolbar component for referred orders table
 * Provides search, view toggle, and bulk sync operations
 */
export const ReferredOrdersToolbar: React.FC<ReferredOrdersToolbarProps> = ({
  syncView,
  onToggleView,
  onSyncAllTestOrders,
  onSyncAllTestOrderResults,
  isSyncingTestOrders,
  isSyncingTestResults,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <TableToolbar>
      <TableToolbarContent>
        <TableToolbarSearch
          persistent
          placeholder={t("searchOrders", "Search orders...")}
          className={styles.searchInput}
        />

        <Layer>
          <Toggle
            labelA={t("synced", "Synced")}
            labelB={t("notSynced", "Not synced")}
            toggled={syncView === "SYNCED"}
            onToggle={onToggleView}
            disabled={disabled}
          />
        </Layer>

        <Button
          kind="primary"
          size="small"
          onClick={onSyncAllTestOrders}
          disabled={disabled || isSyncingTestOrders}
          renderIcon={Sync}
        >
          {isSyncingTestOrders
            ? t("syncingOrders", "Syncing orders...")
            : t("syncAllOrders", "Sync all orders")}
        </Button>

        <Button
          kind="secondary"
          size="small"
          onClick={onSyncAllTestOrderResults}
          disabled={disabled || isSyncingTestResults}
          renderIcon={Sync}
        >
          {isSyncingTestResults
            ? t("syncingResults", "Syncing results...")
            : t("syncAllResults", "Sync all results")}
        </Button>
      </TableToolbarContent>
    </TableToolbar>
  );
};
