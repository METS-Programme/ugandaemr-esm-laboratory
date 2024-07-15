import React, { useMemo, useState } from "react";
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
  DataTableSkeleton,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
} from "@carbon/react";

import { useTranslation } from "react-i18next";
import {
  ErrorState,
  useLayoutType,
  useLocations,
  usePagination,
  useSession,
} from "@openmrs/esm-framework";
import styles from "./tests-ordered.scss";
import { usePatientQueuesList } from "./tests-ordered-list.resource";
import { formatWaitTime, trimVisitNumber } from "../utils/functions";
import TestOrders from "./ordered-test-orders.component";

const TestsOrderedList: React.FC = () => {
  const { t } = useTranslation();
  const session = useSession();
  const isTablet = useLayoutType() === "tablet";
  const locations = useLocations();

  const { patientQueueEntries, isLoading, isError } = usePatientQueuesList(
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

  const tableHeaders = useMemo(
    () => [
      { id: 0, header: t("visitId", "Visit ID"), key: "visitId" },
      {
        id: 1,
        header: t("patientNo", "Patient No."),
        key: "patientNo",
      },
      {
        id: 2,
        header: t("names", "Names"),
        key: "names",
      },
      {
        id: 3,
        header: t("age", "Age"),
        key: "age",
      },
      {
        id: 4,
        header: t("orderedFrom", "OrderedFrom"),
        key: "orderedFrom",
      },
      {
        id: 5,
        header: t("waitingTime", "Waiting Time"),
        key: "waitTime",
      },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return paginatedQueueEntries?.map((entry) => ({
      ...entry,
      id: entry.uuid,
      patientUuid: entry.patientUuid,
      visitId: {
        content: <span>{trimVisitNumber(entry.visitNumber)}</span>,
      },
      patientNo: {
        content: <span>{entry?.identifiers[0].display}</span>,
      },
      names: {
        content: <span>{entry?.name}</span>,
      },
      age: {
        content: <span>{entry?.patientAge}</span>,
      },
      orderedFrom: {
        content: locations.find((loc) => loc.uuid === entry?.locationFrom)
          ?.display,
      },
      waitTime: {
        content: <span> {formatWaitTime(entry.waitTime, t)}</span>,
      },
    }));
  }, [paginatedQueueEntries]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={!isTablet} zebra />;
  }

  if (isError) {
    return <ErrorState error={isError} headerTitle={"Ordered Tests"} />;
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
          {...getTableContainerProps()}
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
                      <TestOrders patientUuid={tableRows[index].patientUuid} />
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

export default TestsOrderedList;
