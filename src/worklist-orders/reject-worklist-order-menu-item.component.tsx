import React, { useCallback } from "react";
import { OverflowMenuItem } from "@carbon/react";
import { Order } from "@openmrs/esm-patient-common-lib";
import { useTranslation } from "react-i18next";
import { showModal } from "@openmrs/esm-framework";

interface RejectOrderActionMenuProps {
  order: Order;
  closeModal: () => void;
}

const RejectWorklistOrderActionMenu: React.FC<RejectOrderActionMenuProps> = ({
  order,
}) => {
  const { t } = useTranslation();
  const launchRejectWorklistModal = useCallback(() => {
    const dispose = showModal("reject-order-button", {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return (
    <OverflowMenuItem
      itemText={"Reject Order"}
      onClick={launchRejectWorklistModal}
      style={{
        maxWidth: "100vw",
      }}
    />
  );
};

export default RejectWorklistOrderActionMenu;
