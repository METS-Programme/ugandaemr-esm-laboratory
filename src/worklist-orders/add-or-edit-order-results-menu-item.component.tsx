import React, { useCallback } from "react";
import { OverflowMenuItem } from "@carbon/react";
import { Order } from "@openmrs/esm-patient-common-lib";
import { useTranslation } from "react-i18next";
import { showModal } from "@openmrs/esm-framework";

interface AddOrEditOrderResultsActionMenuProps {
  isEditing: boolean;
  order: Order;
  closeModal: () => void;
}

const AddOrderResultsActionMenu: React.FC<
  AddOrEditOrderResultsActionMenuProps
> = ({ isEditing, order }) => {
  const { t } = useTranslation();
  const launchAddOrEditWorklistOrderModal = useCallback(() => {
    const dispose = showModal("add-to-worklist-dialog", {
      closeModal: () => dispose(),
      order,
    });
  }, [order]);

  return (
    <OverflowMenuItem
      itemText={isEditing ? "Edit Results" : "Add Results"}
      onClick={launchAddOrEditWorklistOrderModal}
      style={{
        maxWidth: "100vw",
      }}
    />
  );
};

export default AddOrderResultsActionMenu;
