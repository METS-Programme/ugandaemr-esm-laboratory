import React, { useCallback } from "react";
import { OverflowMenuItem } from "@carbon/react";
import { Order } from "@openmrs/esm-patient-common-lib";
import { useTranslation } from "react-i18next";
import { showModal } from "@openmrs/esm-framework";

interface ReferredOrderActionMenuProps {
  isEditing: boolean;
  order: Order;
  closeModal: () => void;
}

const AddOrEditReferredOrderActionMenu: React.FC<
  ReferredOrderActionMenuProps
> = ({ isEditing, order }) => {
  const { t } = useTranslation();
  const launchAddOrEditReferredOrderModal = useCallback(() => {
    const dispose = showModal("add-to-worklist-dialog", {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return (
    <OverflowMenuItem
      itemText={isEditing ? "Edit Results" : "Add Results"}
      onClick={() => launchAddOrEditReferredOrderModal}
      style={{
        maxWidth: "100vw",
      }}
    />
  );
};

export default AddOrEditReferredOrderActionMenu;
