import React, { useMemo, useState } from "react";
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
  TableToolbarContent,
  Layer,
  Tile,
  TableToolbarSearch,
} from "@carbon/react";

import { useTranslation } from "react-i18next";
import { formatDate, parseDate, usePagination } from "@openmrs/esm-framework";
import styles from "../ordered-orders/tests-ordered.scss";
import { useGetOrdersWorklist } from "../worklist-orders/work-list.resource";
import { useOrderDate } from "../utils/functions";

const RejectedTestsList: React.FC = () => {
  const { t } = useTranslation();

  const { currentOrdersDate } = useOrderDate();
  const { data: pickedOrderList, isLoading } = useGetOrdersWorklist(
    "",
    currentOrdersDate
  );

  const data = pickedOrderList.filter(
    (item) => item?.fulfillerStatus === "DECLINED"
  );

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const {
    goTo,
    results: paginatedPickedOrderQueueEntries,
    currentPage,
  } = usePagination(data, currentPageSize);

  let columns = [
    { id: 0, header: t("date", "Date"), key: "date" },

    { id: 1, header: t("orderNumber", "Order Number"), key: "orderNumber" },
    {
      id: 2,
      header: t("accessionNumber", "Accession Number"),
      key: "accessionNumber",
    },
    { id: 3, header: t("patient", "Patient"), key: "patient" },
    { id: 4, header: t("artNumber", "Art Number"), key: "artNumber" },

    { id: 5, header: t("test", "Test"), key: "test" },
    { id: 6, header: t("orderer", "Ordered By"), key: "orderer" },
    { id: 7, header: t("urgency", "Urgency"), key: "urgency" },
    {
      id: 8,
      header: t("fulfillerComment", "Reason for Rejection"),
      key: "fulfillerComment",
    },
  ];

  const tableRows = useMemo(() => {
    return paginatedPickedOrderQueueEntries.map((entry) => ({
      ...entry,
      id: entry?.uuid,
      date: (
        <span className={styles["single-line-display"]}>
          {formatDate(parseDate(entry?.dateActivated))}
        </span>
      ),
      patient: entry?.patient?.display.split("-")[1],
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
      orderer: entry?.orderer?.display,
      urgency: entry?.urgency,
      fulfillerComment: entry?.fulfillerComment,
    }));
  }, [paginatedPickedOrderQueueEntries]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (paginatedPickedOrderQueueEntries?.length >= 0) {
    return (
      <DataTable
        rows={tableRows}
        headers={columns}
        useZebraStyles
        overflowMenuOnHover={true}
      >
        {({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
          onInputChange,
        }) => (
          <TableContainer className={styles.tableContainer}>
            <TableToolbar
              style={{
                position: "static",
              }}
            >
              <TableToolbarContent>
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
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.value?.content ?? cell.value}
                          </TableCell>
                        ))}
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t(
                        "noRejectedTestsToDisplay",
                        "No rejected tests to display"
                      )}
                    </p>
                  </div>
                </Tile>
              </div>
            ) : null}
            <Pagination
              forwardText="Next page"
              backwardText="Previous page"
              page={currentPage}
              pageSize={currentPageSize}
              pageSizes={pageSizes}
              totalItems={data?.length}
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

export default RejectedTestsList;
