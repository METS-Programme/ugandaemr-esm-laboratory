import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetOrdersWorklist } from "../work-list/work-list.resource";
import {
  formatDate,
  parseDate,
  usePagination,
  ConfigurableLink,
} from "@openmrs/esm-framework";
import {
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  TableToolbar,
  TableToolbarContent,
  Layer,
  TableToolbarSearch,
  DataTableSkeleton,
} from "@carbon/react";
import styles from "./completed-list.scss";
import { getStatusColor, useOrderDate } from "../utils/functions";

interface CompletedListProps {
  fulfillerStatus: string;
}

const CompletedList: React.FC<CompletedListProps> = ({ fulfillerStatus }) => {
  const { t } = useTranslation();

  const { currentOrdersDate } = useOrderDate();

  const { data: completedOrderList, isLoading } = useGetOrdersWorklist(
    fulfillerStatus,
    currentOrdersDate
  );

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const {
    goTo,
    results: paginatedCompletedOrderEntries,
    currentPage,
  } = usePagination(completedOrderList, currentPageSize);

  const tableColumns = [
    { id: 0, header: t("date", "Date"), key: "date" },
    { id: 1, header: t("orderNumber", "Order Number"), key: "orderNumber" },
    { id: 2, header: t("artNumber", "Art Number"), key: "artNumber" },
    { id: 3, header: t("patient", "Patient"), key: "patient" },
    {
      id: 4,
      header: t("accessionNumber", "Accession Number"),
      key: "accessionNumber",
    },
    { id: 5, header: t("test", "Test"), key: "test" },
    { id: 6, header: t("status", "Status"), key: "status" },
    { id: 7, header: t("orderer", "Ordered By"), key: "orderer" },
    { id: 8, header: t("urgency", "Urgency"), key: "urgency" },
  ];

  const tableRows = useMemo(() => {
    return paginatedCompletedOrderEntries
      ?.filter(
        (item) =>
          item?.fulfillerStatus === fulfillerStatus ||
          item?.action === "NEW" ||
          item?.action === "REVISE"
      )
      .map((entry) => ({
        ...entry,
        id: entry?.uuid,
        date: formatDate(parseDate(entry?.dateActivated)),

        patient: (
          <ConfigurableLink
            to={`\${openmrsSpaBase}/patient/${entry?.patient?.uuid}/chart/laboratory-orders`}
          >
            {entry?.patient?.names[0]?.display}
          </ConfigurableLink>
        ),
        orderNumber: entry?.orderNumber,
        artNumber: entry.patient?.identifiers
          .find(
            (item) =>
              item?.identifierType?.uuid ===
              "e1731641-30ab-102d-86b0-7a5022ba4115"
          )
          ?.display.split("=")[1]
          .trim(),
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
        orderType: entry?.orderType.display,
        urgency: entry?.urgency,
      }));
  }, [fulfillerStatus, paginatedCompletedOrderEntries]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (paginatedCompletedOrderEntries?.length >= 0) {
    return (
      <DataTable rows={tableRows} headers={tableColumns} useZebraStyles>
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
                {rows.map((row, index) => {
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
                        "noWorklistsToDisplay",
                        "No worklists orders to display"
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
              totalItems={completedOrderList?.length}
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

export default CompletedList;
