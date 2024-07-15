import React, { useMemo } from "react";
import {
  DataTable,
  DataTableSkeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
} from "@carbon/react";
import { OverflowMenuVertical } from "@carbon/react/icons";

import { useTranslation } from "react-i18next";
import { ExtensionSlot, useLayoutType } from "@openmrs/esm-framework";
import styles from "./referred-orders.scss";
import OrderCustomOverflowMenuComponent from "../ui-components/overflow-menu.component";
import { usePatientLabOrders } from "../patient-test-orders/patient-test-orders.resource";

interface TestOrderProps {
  patientUuid: string;
}

const ReferredTestOrders: React.FC<TestOrderProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";

  const { orders, isLoading } = usePatientLabOrders(patientUuid);

  const testOrderHeaders: Array<{ key: string; header: string }> = [
    {
      key: "sampleId",
      header: t("sampleId", "Sample ID"),
    },

    {
      key: "date",
      header: t("date", "Date"),
    },
    {
      key: "test",
      header: t("test", "Test"),
    },
    {
      key: "status",
      header: t("status", "Status"),
    },
    {
      key: "actions",
      header: t("actions", "Action"),
    },
  ];

  const testRows = useMemo(() => {
    return orders?.map((order, index) => ({
      ...orders,
      id: order?.uuid,
      sampleId: order?.accessionNumber,
      date: order.dateActivated,
      tests: order?.display,
      status: order?.fulfillerStatus,
      actions: (
        <OrderCustomOverflowMenuComponent
          menuTitle={
            <>
              <OverflowMenuVertical
                size={16}
                style={{ marginLeft: "0.3rem" }}
              />
            </>
          }
        >
          <ExtensionSlot
            className={styles.menuLink}
            state={{ order: orders[index] }}
            name="referred-order-actions-slot"
          />
        </OrderCustomOverflowMenuComponent>
      ),
    }));
  }, [orders]);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  return (
    <>
      <div className={styles.testOrder}>
        <DataTable
          rows={testRows}
          headers={testOrderHeaders}
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
          }) => (
            <TableContainer {...getTableContainerProps()}>
              <Table {...getTableProps()} aria-label="testorders">
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id} className={styles.testCell}>
                          {cell.value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>
    </>
  );
};

export default ReferredTestOrders;
