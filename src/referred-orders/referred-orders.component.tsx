import React, { useMemo, useState } from "react";
import { useGetOrdersWorklist } from "../work-list/work-list.resource";
import { useTranslation } from "react-i18next";
import {
  ConfigurableLink,
  formatDate,
  parseDate,
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
  TableExpandedRow
} from "@carbon/react";
import { getStatusColor, useOrderDate } from "../utils/functions";
import styles from "./referred-orders.scss";
import { REFERINSTRUCTIONS } from "../constants";
import RequestResultsAction from "./request-order-results.component";

const ReferredOrdersList: React.FC = () => {
  const { t } = useTranslation();

  const { currentOrdersDate } = useOrderDate();


  const { data: referredOrderList, isLoading } = useGetOrdersWorklist(
    "",
    currentOrdersDate
  );

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const filtered = referredOrderList.filter(
    (item) =>
      item?.fulfillerStatus === "IN_PROGRESS" &&
      item?.accessionNumber !== null &&
      item?.instructions === REFERINSTRUCTIONS
  );

  const {
    goTo,
    results: paginatedReferredOrderEntries,
    currentPage,
  } = usePagination(filtered, currentPageSize);

  const handleSync = (selectedRows: any[]) => {
    if (selectedRows.length === 0) {
      alert("No rows selected to sync (delete).");
      return;
    }

    const idsToDelete = selectedRows.map((row) => row.id);


    // Optional: show a success message
    alert(`Selected  ${idsToDelete} row(s)!`);
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
      id: entry?.uuid,
      date: formatDate(parseDate(entry?.dateActivated)),
      patient: (
        <ConfigurableLink
          to={`\${openmrsSpaBase}/patient/${entry?.patient?.uuid}/chart/laboratory-orders`}
        >
          {entry?.patient?.display.split("-")[1]}
        </ConfigurableLink>
      ),
      artNumber: entry.patient?.identifiers
        .find(
          (item) =>
            item?.identifierType?.uuid ===
            "e1731641-30ab-102d-86b0-7a5022ba4115"
        )
        ?.display.split("=")[1]
        .trim(),
      orderNumber: entry?.orderNumber,
      accessionNumber: entry?.accessionNumber,
      test: entry?.concept?.display,
      action: entry?.action,
      status: (
        <span
          className={styles.statusContainer}
          style={{ color: `${getStatusColor(entry?.fulfillerStatus)}` }}
        >
          {entry?.fulfillerStatus}
        </span>
      ),
      orderer: entry?.orderer?.display,
      orderType: entry?.orderType?.display,
      urgency: entry?.urgency,
      actions: <RequestResultsAction orders={[]} />,
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
        }) => (
          <TableContainer className={styles.tableContainer}>
            <TableToolbar style={{ position: "static" }}>
              <TableToolbarContent>
                <Layer style={{ margin: "10px" }}>
                  <Button
                    kind="ghost"
                    size="sm"
                    className={styles.button}
                    onClick={() => handleSync(selectedRows)}
                  >
                    {t("sync", "Sync")}
                  </Button>
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
                {rows.map((row) => (
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
                          <strong>Expanded Row for:</strong> {row.id}
                          <p>Here you can show more detailed information or actions related to the selected row.</p>
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
                      {t("noWorklistsToDisplay", "No worklists orders to display")}
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
              totalItems={filtered?.length}
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
