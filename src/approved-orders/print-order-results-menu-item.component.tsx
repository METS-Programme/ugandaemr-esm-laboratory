import React, { useCallback } from "react";
import { OverflowMenuItem } from "@carbon/react";
import { Order } from "@openmrs/esm-patient-common-lib";
import { useTranslation } from "react-i18next";

interface PrintOrderResultsActionMenuProps {
  order: Order;
  closeModal: () => void;
}

const PrintResultsActionMenu: React.FC<PrintOrderResultsActionMenuProps> = ({
  order,
}) => {
  const { t } = useTranslation();
  // const launchPickLabRequestModal = useCallback(() => {
  //   const dispose = showModal("add-to-worklist-dialog", {
  //     closeModal: () => dispose(),
  //     order,
  //   });
  // }, [order]);

  return (
    <OverflowMenuItem
      itemText={"Print Results"}
      onClick={() => {}}
      style={{
        maxWidth: "100vw",
      }}
    />
  );
};

export default PrintResultsActionMenu;
