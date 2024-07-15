import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Pagination,
  InlineLoading,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
} from "@carbon/react";
import styles from "./work-list.scss";
import { usePagination, useSession } from "@openmrs/esm-framework";
import { usePatientQueuesList } from "../ordered-orders/tests-ordered-list.resource";
import TestOrders from "../ordered-orders/ordered-test-orders.component";
import WorkListTestOrders from "./work-list-test-orders.component";

const WorkList: React.FC = () => {
  const { t } = useTranslation();
  const session = useSession();

  const { patientQueueEntries, isLoading } = usePatientQueuesList(
    session?.sessionLocation?.uuid,
    status,
    session.user.systemId
  );

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const {
    goTo,
    results: paginatedQueueEntries,
    currentPage,
  } = usePagination(patientQueueEntries, currentPageSize);
  // get picked orders

  const [ordersCount, setOrdersCount] = useState<{
    [patientUuid: string]: number;
  }>({});

  const updateOrdersCount = (patientUuid: string, number: number) => {
    setOrdersCount((prev) => ({ ...prev, [patientUuid]: number }));
  };

  const tableHeaders = useMemo(
    () => [
      { id: 0, header: t("patient", "Patient"), key: "name" },

      { id: 1, header: t("orders", "Orders"), key: "orders" },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return paginatedQueueEntries.map((entry, index) => ({
      ...entry,
      name: {
        content: <span>{entry?.name}</span>,
      },
      orders: ordersCount[entry.patientUuid] ?? 0,
    }));
  }, [paginatedQueueEntries]);

  if (isLoading) {
    return <InlineLoading status="active" />;
  }

  return (
    <DataTable rows={tableRows} headers={tableHeaders} useZebraStyles>
      {({
        rows,
        headers,
        getHeaderProps,
        getTableProps,
        getRowProps,
        getExpandHeaderProps,
        getTableContainerProps,
      }) => (
        <TableContainer
          {...getTableContainerProps}
          className={styles.tableContainer}
        >
          <Table {...getTableProps()} className={styles.activePatientsTable}>
            <TableHead>
              <TableRow>
                <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
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
                    <TableExpandRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>
                          {cell.value?.content ?? cell.value}
                        </TableCell>
                      ))}
                    </TableExpandRow>
                    <TableExpandedRow colSpan={headers.length + 1}>
                      <WorkListTestOrders
                        patientUuid={tableRows[index]?.patientUuid}
                        orderNumberChange={(number) => {
                          // updateOrdersCount(row.id, );
                        }}
                      />
                    </TableExpandedRow>
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
                    {t("noPatientsToDisplay", "No patients to display")}
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
            totalItems={paginatedQueueEntries?.length}
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
};

export default WorkList;
