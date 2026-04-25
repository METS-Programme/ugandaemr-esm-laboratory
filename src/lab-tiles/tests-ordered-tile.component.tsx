import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { useGetOrdersWorklist } from "../work-list/work-list.resource";
import { useOrderDate } from "../utils/functions";

const TestsOrderedTileComponent = () => {
  const { t } = useTranslation();

  const { currentOrdersDate } = useOrderDate();
  const { data } = useGetOrdersWorklist("", currentOrdersDate);

  const filteredData = data?.filter(
    (item) =>
      item?.action === "NEW" &&
      item?.dateStopped === null &&
      item?.fulfillerStatus === null
  );

  return (
    <SummaryTile
      label={t("orders", "Orders")}
      value={filteredData?.length}
      headerLabel={t("testsOrdered", "Tests ordered")}
    />
  );
};

export default TestsOrderedTileComponent;
