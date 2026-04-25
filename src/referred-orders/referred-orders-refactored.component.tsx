/**
 * Refactored Referred Orders Component
 * Uses custom hooks and sub-components for better maintainability
 * Reduced from 539 lines to ~200 lines by extracting logic and UI
 */

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
  TableExpandHeader,
  TableExpandRow,
  InlineLoading,
} from "@carbon/react";
import { getStatusColor } from "../utils/functions";
import styles from "./referred-orders.scss";
import { useReferredOrdersSync } from "./hooks/use-referred-orders-sync";
import { useReferredOrdersData } from "./hooks/use-referred-orders-data";
import { ReferredOrdersToolbar } from "./components/referred-orders-toolbar.component";
import { ReferredOrderExpandedRow } from "./components/referred-orders-expanded-row.component";

/**
 * Main referred orders list component
 * Displays and manages referred laboratory orders
 */
const ReferredOrdersListRefactored: React.FC = () => {
  const { t } = useTranslation();

  // Use custom hook for data and pagination
  const {
    syncView,
    isLoading,
    paginatedReferredOrderEntries,
    currentPage,
    goTo,
    currentPageSize,
    setPageSize,
    toggleSyncView,
  } = useReferredOrdersData();

  // Use custom hook for sync operations
  const {
    isSyncingAllTestOrders,
    isSyncingAllTestOrderResults,
    isSyncingSelectedTestOrders,
    isSyncingSelectedTestOrderResults,
    handleSyncAllTestOrders,
    handleSyncAllTestOrderResults,
    handleSyncSelectedTestOrders,
    handleSyncSelectedTestOrderResults,
  } = useReferredOrdersSync();

  const [selectedRows, setSelectedRows] = useState<Array<string>>([]);

  // Define table headers
  const headers = useMemo(
    () => [
      { key: "patient", header: t("patient", "Patient") },
      { key: "referringFacility", header: t("referringFacility", "Referring Facility") },
      { key: "receivingFacility", header: t("receivingFacility", "Receiving Facility") },
      { key: "orderDate", header: t("orderDate", "Order Date") },
      { key: "status", header: t("status", "Status") },
      { key: "tests", header: t("tests", "Tests") },
    ],
    [t]
  );

  // Get table row data
  const getRowData = (row) => ({
    id: row.uuid,
    patient: row.patient?.display,
    referringFacility: row.referringFacility,
    receivingFacility: row.receivingFacility,
    orderDate: row.orderDate,
    status: row.status,
    tests: row.tests?.map((test) => test.display).join(", ") || "",
  });

  // Get all row IDs for selection
  const getRowIds = () => paginatedReferredOrderEntries.map((row) => row.uuid);

  // Handle row selection
  const handleRowSelection = (selectedRows: Array<string>) => {
    setSelectedRows(selectedRows);
  };

  // Handle sync for selected rows
  const handleSyncSelected = async () => {
    const selectedRowsData = paginatedReferredOrderEntries.filter((row) =>
      selectedRows.includes(row.uuid)
    );

    if (syncView === "NOT_SYNCED") {
      await handleSyncSelectedTestOrders(selectedRowsData);
    } else {
      await handleSyncSelectedTestOrderResults(selectedRowsData);
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className={styles.container}>
        <DataTableSkeleton
          columnCount={headers.length + 2}
          rowCount={5}
          headers={headers}
          showToolbar
        />
      </div>
    );
  }

  // Show empty state
  if (!paginatedReferredOrderEntries || paginatedReferredOrderEntries.length === 0) {
    return (
      <div className={styles.container}>
        <ReferredOrdersToolbar
          syncView={syncView}
          onToggleView={toggleSyncView}
          onSyncAllTestOrders={handleSyncAllTestOrders}
          onSyncAllTestOrderResults={handleSyncAllTestOrderResults}
          isSyncingTestOrders={isSyncingAllTestOrders}
          isSyncingTestResults={isSyncingAllTestOrderResults}
        />
        <div className={styles.emptyState}>
          <p>{t("noReferredOrders", "No referred orders found")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DataTable
        rows={paginatedReferredOrderEntries.map(getRowData)}
        headers={headers}
        isSortable
        useZebraStyles
      >
        {({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
          getToolbarProps,
          onInputChange,
          selectedRows,
          getSelectionProps,
          selectAll,
          selectRow,
        }) => (
          <>
            <ReferredOrdersToolbar
              syncView={syncView}
              onToggleView={toggleSyncView}
              onSyncAllTestOrders={handleSyncAllTestOrders}
              onSyncAllTestOrderResults={handleSyncAllTestOrderResults}
              isSyncingTestOrders={isSyncingAllTestOrders}
              isSyncingTestResults={isSyncingAllTestOrderResults}
              disabled={selectedRows.length === 0}
            />

            <TableContainer className={styles.tableContainer}>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    <TableSelectAll
                      {...getSelectionProps()}
                      checked={selectAll}
                      indeterminate={selectedRows.length > 0 && selectedRows.length !== rows.length}
                      onSelect={(event) => {
                        if (event.nativeEvent.shiftKey) {
                          // Handle shift+click for range selection
                          handleRowSelection(getRowIds());
                        } else {
                          handleRowSelection(selectedRows.length === rows.length ? [] : getRowIds());
                        }
                      }}
                    />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps(header)}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowIndex) => {
                    const originalRow = paginatedReferredOrderEntries[rowIndex];
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow {...getRowProps({ row })}>
                          <TableSelectRow
                            {...getSelectionProps()}
                            checked={selectedRows.includes(row.id)}
                            onSelect={(event) => {
                              if (event.nativeEvent.shiftKey) {
                                const currentIndex = rowIndex;
                                const previousIndex = selectedRows.length > 0
                                  ? Math.max(...getRowIds().filter((id) => selectedRows.includes(id)).map((id) =>
                                    getRowIds().indexOf(id)
                                  ))
                                  : -1;
                                const start = Math.min(previousIndex + 1, currentIndex);
                                const end = Math.max(previousIndex + 1, currentIndex);
                                const newSelection = [...selectedRows];
                                for (let i = start; i <= end; i++) {
                                  if (!newSelection.includes(getRowIds()[i])) {
                                    newSelection.push(getRowIds()[i]);
                                  }
                                }
                                handleRowSelection(newSelection);
                              } else {
                                handleRowSelection(
                                  selectedRows.includes(row.id)
                                    ? selectedRows.filter((id) => id !== row.id)
                                    : [...selectedRows, row.id]
                                );
                              }
                            }}
                          />
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.info.header === "status" ? (
                                <div
                                  className={styles.statusBadge}
                                  style={{
                                    backgroundColor: getStatusColor(cell.value),
                                    color: "white",
                                  }}
                                >
                                  {cell.value}
                                </div>
                              ) : (
                                cell.value
                              )}
                            </TableCell>
                          ))}
                        </TableExpandRow>
                        {row.isExpanded && (
                          <ReferredOrderExpandedRow row={originalRow} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Pagination
              totalItems={paginatedReferredOrderEntries.length}
              pageSize={currentPageSize}
              pageSizes={[10, 20, 30, 40, 50]}
              page={currentPage}
              onChange={({ page, pageSize }) => {
                if (pageSize !== currentPageSize) {
                  setPageSize(pageSize);
                }
                goTo(page);
              }}
            />
          </>
        )}
      </DataTable>

      {selectedRows.length > 0 && (
        <div className={styles.bulkActions}>
          <p>{selectedRows.length} {t("selected", "selected")}</p>
          <button
            onClick={handleSyncSelected}
            disabled={
              syncView === "NOT_SYNCED"
                ? isSyncingSelectedTestOrders
                : isSyncingSelectedTestOrderResults
            }
            className={styles.syncButton}
          >
            {syncView === "NOT_SYNCED"
              ? isSyncingSelectedTestOrders
                ? t("syncingOrders", "Syncing orders...")
                : t("syncSelectedOrders", "Sync selected orders")
              : isSyncingSelectedTestOrderResults
              ? t("syncingResults", "Syncing results...")
              : t("syncSelectedResults", "Sync selected results")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReferredOrdersListRefactored;
