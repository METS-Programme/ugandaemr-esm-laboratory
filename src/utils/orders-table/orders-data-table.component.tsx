import React, { useState } from "react";
import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
  Tile,
  Pagination,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
} from "@carbon/react";
import styles from "./orders-data-table.scss";
import { useTranslation } from "react-i18next";
import { useLayoutType, usePagination } from "@openmrs/esm-framework";

interface OrdersDataTableProps {
  data?: Array<Record<string, any>>;
  children?: () => React.ReactElement;
  expanded?: boolean;
  showPagination?: boolean;
  showCheck?: boolean;
  rows: Array<Record<string, any>>;
  columns: Array<Record<string, any>>;
}

const OrdersDataTable: React.FC<OrdersDataTableProps> = ({
  rows,
  columns,
  showCheck,
  showPagination,
  expanded,
  children,
  data,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const {
    goTo,
    results: paginatedRows,
    currentPage,
  } = usePagination(data, currentPageSize);

  return (
    <DataTable
      rows={rows}
      headers={columns}
      size={isTablet ? "lg" : "sm"}
      useZebraStyles
    >
      {({
        rows,
        headers,
        getHeaderProps,
        getRowProps,
        getTableProps,
        getTableContainerProps,
        getSelectionProps,
        getExpandHeaderProps,
      }) => (
        <TableContainer
          {...getTableContainerProps()}
          className={styles.tableContainer}
        >
          <Table
            {...getTableProps()}
            className={styles.activePatientsTable}
            aria-label="testorders"
          >
            <TableHead>
              <TableRow>
                {showCheck && <TableSelectAll {...getSelectionProps()} />}
                {expanded && (
                  <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                )}
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
                  {expanded && (
                    <>
                      <TableExpandRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.value?.content ?? cell.value}
                          </TableCell>
                        ))}
                      </TableExpandRow>
                      <TableExpandedRow colSpan={headers.length + 1}>
                        {children && children.length > 0 && children}
                      </TableExpandedRow>
                    </>
                  )}
                  <TableRow {...getRowProps({ row })}>
                    {showCheck && (
                      <TableSelectRow
                        {...getSelectionProps({
                          row,
                        })}
                      />
                    )}
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id} className={styles.testCell}>
                        {cell.value?.content ?? cell.value}
                      </TableCell>
                    ))}
                  </TableRow>
                </React.Fragment>
              ))}
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
          {showPagination && (
            <Pagination
              forwardText="Next page"
              backwardText="Previous page"
              page={currentPage}
              pageSize={currentPageSize}
              pageSizes={pageSizes}
              totalItems={paginatedRows?.length}
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
          )}
        </TableContainer>
      )}
    </DataTable>
  );
};

export default OrdersDataTable;
