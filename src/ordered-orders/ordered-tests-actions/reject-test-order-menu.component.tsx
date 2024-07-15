import { OverflowMenuItem } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import { Order } from "@openmrs/esm-patient-common-lib";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

interface RejectTestOrderActionMenuProps {
  order: Order;
  closeModal: () => void;
}

const RejectTestOrderActionMenu: React.FC<RejectTestOrderActionMenuProps> = ({
  order,
}) => {
  const { t } = useTranslation();
  const launchRejectTestOrderModal = useCallback(() => {
    const dispose = showModal("reject-order-button", {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return (
    <OverflowMenuItem
      itemText={t("rejectOrder", "Reject Order")}
      onClick={launchRejectTestOrderModal}
      style={{
        maxWidth: "100vw",
      }}
    />
  );
};

export default RejectTestOrderActionMenu;
