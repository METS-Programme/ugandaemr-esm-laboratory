import React, { useMemo, useState } from "react";
import { useGetNewReferredOrders } from "../work-list/work-list.resource";
import { useTranslation } from "react-i18next";
import {
  ConfigurableLink,
  formatDate,
  parseDate,
  showSnackbar,
  usePagination,
} from "@openmrs/esm-framework";
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
  TableToolbar,
  TableSelectAll,
  TableSelectRow,
  TableToolbarContent,
  Layer,
  Tile,
  Button,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  InlineLoading,
  TableToolbarSearch,
} from "@carbon/react";
import {
  extractErrorMessagesFromResponse,
  getStatusColor,
  useOrderDate,
} from "../utils/functions";
import styles from "./referred-orders.scss";
import RequestResultsAction from "./request-order-results.component";
import {
  getAllTestOrderResults,
  syncAllTestOrders,
  syncSelectedTestOrderResults,
  syncSelectedTestOrders,
} from "./referred-orders.resource";

const ReferredOrdersList: React.FC = () => {
  const { t } = useTranslation();

  const [isSyncing, setIsSyncing] = useState(false);

  const { currentOrdersDate } = useOrderDate();

  const { data: referredOrderList, isLoading } = useGetNewReferredOrders("");

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  // const filtered = referredOrderList.filter(
  //   (item) => item?.order?.instructions === REFERINSTRUCTIONS
  // );

  const {
    goTo,
    results: paginatedReferredOrderEntries,
    currentPage,
  } = usePagination(referredOrderList, currentPageSize);

  const handleSyncSelectedOrders = async (selectedRows: any[]) => {
    if (selectedRows.length === 0) {
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle: t("syncStatus", "No rows selected to sync."),
        kind: "error",
      });
      return;
    }

    const idsToSync = selectedRows.map((row) => row.id);
    setIsSyncing(true);

    try {
      const response = await syncSelectedTestOrders(idsToSync);

      const isSuccess = response.status === 200;

      showSnackbar({
        title: isSuccess
          ? t("syncSuccess", "Sync successful")
          : t("syncStatus", "Sync Status"),
        subtitle: isSuccess
          ? t("syncSuccess", "Test orders synced successfully.")
          : t(
              "syncFailed",
              `Failed to sync test orders. ${
                response?.data?.responseList?.[0]?.responseMessage || ""
              }`
            ),
        kind: isSuccess ? "success" : "error",
      });
    } catch (error) {
      const errorMessages = extractErrorMessagesFromResponse(error);
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle:
          errorMessages.join(", ") ||
          t("syncFailed", "An unexpected error occurred."),
        kind: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSelectedTestOrderResults = async (selectedRows: any[]) => {
    if (selectedRows.length === 0) {
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle: t("syncStatus", "No rows selected to sync."),
        kind: "error",
      });
      return;
    }

    const idsToSync = selectedRows.map((row) => row.id);
    setIsSyncing(true);

    try {
      const response = await syncSelectedTestOrderResults(idsToSync);

      const isSuccess = response.status === 200;

      showSnackbar({
        title: isSuccess
          ? t("syncSuccess", "Sync successful")
          : t("syncStatus", "Sync Status"),
        subtitle: isSuccess
          ? t("syncSuccess", "Test orders results synced successfully.")
          : t(
              "syncFailed",
              `Failed to sync test result orders. ${
                response?.data?.responseList?.[0]?.responseMessage || ""
              }`
            ),
        kind: isSuccess ? "success" : "error",
      });
    } catch (error) {
      const errorMessages = extractErrorMessagesFromResponse(error);
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle:
          errorMessages.join(", ") ||
          t("syncFailed", "An unexpected error occurred."),
        kind: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAllTestOrders = async () => {
    setIsSyncing(true);

    try {
      const response = await syncAllTestOrders();

      const isSuccess = response.status === 200;

      showSnackbar({
        title: isSuccess
          ? t("syncSuccess", "Sync successful")
          : t("syncStatus", "Sync Status"),
        subtitle: isSuccess
          ? t("syncSuccess", "Test orders  synced successfully.")
          : t(
              "syncFailed",
              `Failed to sync test  orders. ${
                response?.data?.responseList?.[0]?.responseMessage || ""
              }`
            ),
        kind: isSuccess ? "success" : "error",
      });
    } catch (error) {
      const errorMessages = extractErrorMessagesFromResponse(error);
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle:
          errorMessages.join(", ") ||
          t("syncFailed", "An unexpected error occurred."),
        kind: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAllTestOrderResults = async () => {
    setIsSyncing(true);

    try {
      const response = await getAllTestOrderResults();

      const isSuccess = response.status === 200;

      showSnackbar({
        title: isSuccess
          ? t("syncSuccess", "Sync successful")
          : t("syncStatus", "Sync Status"),
        subtitle: isSuccess
          ? t("syncSuccess", "Test orders results synced successfully.")
          : t(
              "syncFailed",
              `Failed to sync test result orders. ${
                response?.data?.responseList?.[0]?.responseMessage || ""
              }`
            ),
        kind: isSuccess ? "success" : "error",
      });
    } catch (error) {
      const errorMessages = extractErrorMessagesFromResponse(error);
      showSnackbar({
        title: t("syncStatus", "Sync Status"),
        subtitle:
          errorMessages.join(", ") ||
          t("syncFailed", "An unexpected error occurred."),
        kind: "error",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // table columns
  let columns = [
    { id: 0, header: t("date", "Date"), key: "date" },

    { id: 1, header: t("orderNumber", "Order Number"), key: "orderNumber" },
    { id: 2, header: t("patient", "Patient"), key: "patient" },
    { id: 3, header: t("artNumber", "Art Number"), key: "artNumber" },
    {
      id: 4,
      header: t("accessionNumber", "Accession Number"),
      key: "accessionNumber",
    },
    { id: 5, header: t("test", "Test"), key: "test" },
    { id: 6, header: t("status", "Status"), key: "status" },
    { id: 7, header: t("orderer", "Ordered By"), key: "orderer" },
    { id: 8, header: t("urgency", "Urgency"), key: "urgency" },
    { id: 9, header: t("action", "Actions"), key: "actions" },
  ];
  const tableRows = useMemo(() => {
    return paginatedReferredOrderEntries.map((entry, index) => ({
      ...entry,
      id: entry?.order?.uuid,
      date: formatDate(parseDate(entry?.order?.dateActivated)),
      patient: (
        <ConfigurableLink
          to={`\${openmrsSpaBase}/patient/${entry?.order?.patient?.uuid}/chart/laboratory-orders`}
        >
          {entry?.order?.patient?.display.split("-")[1]}
        </ConfigurableLink>
      ),
      artNumber: entry?.order?.patient?.identifiers
        .find(
          (item) =>
            item?.identifierType?.uuid ===
            "e1731641-30ab-102d-86b0-7a5022ba4115"
        )
        ?.display.split("=")[1]
        .trim(),
      orderNumber: entry?.order?.orderNumber,
      accessionNumber: entry?.order?.accessionNumber,
      test: entry?.order?.concept?.display,
      action: entry?.order?.action,
      status: (
        <span
          className={styles.statusContainer}
          style={{ color: `${getStatusColor(entry?.order?.fulfillerStatus)}` }}
        >
          {entry?.fulfillerStatus}
        </span>
      ),
      orderer: entry?.order?.orderer?.display,
      orderType: entry?.order?.orderType?.display,
      urgency: entry?.order?.urgency,
      actions: (
        <RequestResultsAction orders={paginatedReferredOrderEntries[index]} />
      ),
    }));
  }, [paginatedReferredOrderEntries]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (paginatedReferredOrderEntries?.length >= 0) {
    return (
      <DataTable rows={tableRows} headers={columns} useZebraStyles isSelectable>
        {({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getSelectionProps,
          getRowProps,
          selectedRows,
          onInputChange,
        }) => (
          <TableContainer className={styles.tableContainer}>
            <TableToolbar style={{ position: "static" }}>
              <TableToolbarContent>
                {/* selected implementation */}
                <Layer
                  style={{
                    margin: "5px",
                  }}
                >
                  {isSyncing ? (
                    <InlineLoading
                      description={t("syncing", "Syncing...")}
                      status="active"
                    />
                  ) : (
                    <Button
                      size="sm"
                      className={styles.button}
                      onClick={() => handleSyncSelectedOrders(selectedRows)}
                    >
                      {t("syncSelected", "Sync Selected Orders")}
                    </Button>
                  )}
                </Layer>
                <Layer
                  style={{
                    margin: "5px",
                  }}
                >
                  {isSyncing ? (
                    <InlineLoading
                      description={t("syncing", "Syncing...")}
                      status="active"
                    />
                  ) : (
                    <Button
                      size="sm"
                      className={styles.button}
                      onClick={() =>
                        handleSyncSelectedTestOrderResults(selectedRows)
                      }
                    >
                      {t("resultsForSelected", "Get Results For Selected")}
                    </Button>
                  )}
                </Layer>
                {/* all implementation */}
                <Layer
                  style={{
                    margin: "5px",
                  }}
                >
                  {isSyncing ? (
                    <InlineLoading
                      description={t("syncing", "Syncing...")}
                      status="active"
                    />
                  ) : (
                    <Button
                      size="sm"
                      className={styles.button}
                      onclick={() => {
                        handleSyncAllTestOrderResults;
                      }}
                    >
                      {t("syncAllResults", "Get All Results")}
                    </Button>
                  )}
                </Layer>
                <Layer
                  style={{
                    margin: "5px",
                  }}
                >
                  {isSyncing ? (
                    <InlineLoading
                      description={t("syncing", "Syncing...")}
                      status="active"
                    />
                  ) : (
                    <Button
                      size="sm"
                      className={styles.button}
                      onclick={handleSyncAllTestOrders}
                    >
                      {t("syncAll", "Sync All Orders")}
                    </Button>
                  )}
                </Layer>

                <Layer style={{ margin: "5px" }}>
                  <TableToolbarSearch
                    expanded
                    onChange={onInputChange}
                    placeholder={t("searchThisList", "Search this list")}
                    size="sm"
                  />
                </Layer>
              </TableToolbarContent>
            </TableToolbar>

            <Table {...getTableProps()} className={styles.activePatientsTable}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  <TableSelectAll {...getSelectionProps()} />
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row, index) => (
                  <React.Fragment key={row.id}>
                    {/* Main Row with Expand and Select */}
                    <TableExpandRow {...getRowProps({ row })}>
                      <TableSelectRow {...getSelectionProps({ row })} />
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>
                          {cell.value?.content ?? cell.value}
                        </TableCell>
                      ))}
                    </TableExpandRow>

                    {/* Expanded Content Row */}
                    {row.isExpanded && (
                      <TableExpandedRow colSpan={headers.length + 2}>
                        <div style={{ padding: "1rem" }}>
                          {paginatedReferredOrderEntries[index]?.syncTask ===
                          null
                            ? "Not Synced"
                            : "Synced"}
                        </div>
                      </TableExpandedRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>

            {/* No Rows Message */}
            {rows.length === 0 && (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t(
                        "noWorklistsToDisplay",
                        "No worklists orders to display"
                      )}
                    </p>
                  </div>
                </Tile>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              forwardText="Next page"
              backwardText="Previous page"
              page={currentPage}
              pageSize={currentPageSize}
              pageSizes={pageSizes}
              totalItems={referredOrderList?.length}
              className={styles.pagination}
              onChange={({ pageSize, page }) => {
                if (pageSize !== currentPageSize) {
                  setPageSize(pageSize);
                }
                if (page !== currentPage) {
                  goTo(page);
                }
              }}
            />
          </TableContainer>
        )}
      </DataTable>
    );
  }
};

export default ReferredOrdersList;
