import React from "react";
import { Button } from "@carbon/react";
import { Edit } from "@carbon/react/icons";
import { Result } from "../work-list/work-list.resource";
import { useTranslation } from "react-i18next";

interface EditReferredOrdersProps {
  order: Result;
}
const EditReferredOrders = (props: EditReferredOrdersProps) => {
  const { t } = useTranslation();

  return (
    <Button
      kind="ghost"
      onClick={(e) => {}}
      iconDescription={t("editOrder", "Edit Order")}
      renderIcon={(props) => <Edit size={16} {...props} />}
    />
  );
};
export default EditReferredOrders;
