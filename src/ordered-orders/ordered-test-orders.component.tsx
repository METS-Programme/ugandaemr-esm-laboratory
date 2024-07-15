import React, { useEffect, useMemo, useState } from "react";
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
import { usePatientLabOrders } from "../patient-test-orders/patient-test-orders.resource";
import styles from "./tests-ordered.scss";
import OrderCustomOverflowMenuComponent from "../ui-components/overflow-menu.component";
import ScheduleTestOrdersButton from "./ordered-tests-actions/schedule-test-orders-button.component";

interface TestOrderProps {
  patientUuid: string;
  orderNumberChange?: (ordersLeft: number) => void;
}

const TestOrders: React.FC<TestOrderProps> = ({
  patientUuid,
  orderNumberChange,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";

  const [ordersLeft, setOrdersLeft] = useState<number | null>(0);

  console.log("patientUuid--->" + JSON.stringify(patientUuid, null, 2));

  const { orders, isLoading } = usePatientLabOrders(patientUuid);

  console.log("orders--->" + JSON.stringify(orders, null, 2));

  const testOrderHeaders: Array<{ key: string; header: string }> = [
    {
      key: "tests",
      header: t("tests", "Test"),
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
      tests: order?.display,
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
            name="tests-ordered-actions-slot"
          />
        </OrderCustomOverflowMenuComponent>
      ),
    }));
  }, [orders]);

  useEffect(() => {
    if (testRows.length >= 0) {
      setOrdersLeft(orders.length);

      if (typeof orderNumberChange === "function") {
        orderNumberChange(ordersLeft);
      }
    }
  }, [orders, orderNumberChange]);

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
                    <TableSelectAll {...getSelectionProps()} />
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
                      <TableSelectRow
                        {...getSelectionProps({
                          row,
                        })}
                      />
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
      <div style={{ margin: "1rem" }}>
        {testRows.length > 0 && (
          <ScheduleTestOrdersButton orders={orders} closeModal={() => true} />
        )}
      </div>
    </>
  );
};

export default TestOrders;
