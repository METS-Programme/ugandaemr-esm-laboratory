/**
 * Reusable Data Table Component
 * Provides consistent table functionality with pagination, filtering, and selection
 */

import React, { useState, useMemo } from "react";
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
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
} from "@carbon/react";
import { useArrayPagination } from "../../hooks/use-pagination";

export interface Column<T> {
  key: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  selectable?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  toolbarActions?: React.ReactNode;
}

/**
 * Reusable data table component with pagination and selection
 */
export function CustomDataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  emptyMessage,
  searchable = true,
  selectable = true,
  pageSize = 20,
  onRowClick,
  toolbarActions,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Array<string>>([]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [data, columns, searchQuery]);

  // Setup pagination
  const {
    currentPage,
    currentPageSize,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
    setPageSize,
    paginatedData,
    availablePageSizes,
  } = useArrayPagination(filteredData, { initialPageSize: pageSize });

  // Get row ID for selection
  const getRowId = (row: T): string =>
    row.id || row.uuid || JSON.stringify(row);

  // Get cell value
  const getCellValue = (row: T, column: Column<T>): React.ReactNode => {
    if (column.cell) {
      return column.cell(row);
    }
    return row[column.key];
  };

  // Handle row selection
  const handleSelectRow = (rowId: string, selected: boolean) => {
    setSelectedRows((prev) =>
      selected ? [...prev, rowId] : prev.filter((id) => id !== rowId)
    );
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(paginatedData.map(getRowId));
    } else {
      setSelectedRows([]);
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return <DataTableSkeleton columnCount={columns.length + 1} />;
  }

  // Show empty state
  if (data.length === 0) {
    return (
      <div className="emptyState">
        <p>{emptyMessage || t("noDataAvailable", "No data available")}</p>
      </div>
    );
  }

  // Show no search results state
  if (filteredData.length === 0) {
    return (
      <div className="emptyState">
        <p>{t("noSearchResults", "No results match your search")}</p>
        <Button onClick={() => setSearchQuery("")} kind="ghost" size="small">
          {t("clearSearch", "Clear search")}
        </Button>
      </div>
    );
  }

  return (
    <DataTable rows={paginatedData} headers={columns} isSortable useZebraStyles>
      {({
        rows,
        headers,
        getHeaderProps,
        getTableProps,
        getRowProps,
        getToolbarProps,
        onInputChange,
      }) => (
        <>
          <TableToolbar {...getToolbarProps()}>
            <TableToolbarContent>
              {searchable && (
                <TableToolbarSearch
                  persistent
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search", "Search...")}
                />
              )}
              {toolbarActions}
            </TableToolbarContent>
          </TableToolbar>

          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {selectable && (
                    <TableSelectAll
                      checked={
                        selectedRows.length === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      indeterminate={
                        selectedRows.length > 0 &&
                        selectedRows.length < paginatedData.length
                      }
                      onSelect={(event) =>
                        handleSelectAll(event.target.checked)
                      }
                    />
                  )}
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps(header)} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const originalRow = paginatedData[row.index];
                  const rowId = getRowId(originalRow);
                  const isSelected = selectedRows.includes(rowId);

                  return (
                    <TableRow
                      {...getRowProps({ row })}
                      key={rowId}
                      onClick={() => onRowClick?.(originalRow)}
                      style={{ cursor: onRowClick ? "pointer" : "default" }}
                    >
                      {selectable && (
                        <TableSelectRow
                          checked={isSelected}
                          onSelect={(event) =>
                            handleSelectRow(rowId, event.target.checked)
                          }
                        />
                      )}
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Pagination
            totalItems={filteredData.length}
            pageSize={currentPageSize}
            pageSizes={availablePageSizes}
            page={currentPage}
            onChange={({ page, pageSize }) => {
              if (pageSize !== currentPageSize) {
                setPageSize(pageSize);
              }
              goToPage(page);
            }}
          />
        </>
      )}
    </DataTable>
  );
}
