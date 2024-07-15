import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import { Order } from "@openmrs/esm-patient-common-lib";
import React, { useCallback } from "react";

interface ScheduleTestOrdersButtonProps {
  orders: Order[];
  closeModal: () => void;
}

const ScheduleTestOrdersButton: React.FC<ScheduleTestOrdersButtonProps> = ({
  orders,
}) => {
  const launchPickLabRequestModal = useCallback(() => {
    const dispose = showModal("schedule-test-orders-dialog", {
      orders,
      closeModal: () => dispose(),
    });
  }, [orders]);

  return (
    <Button kind="primary" onClick={launchPickLabRequestModal}>
      Schedule Orders
    </Button>
  );
};

export default ScheduleTestOrdersButton;
