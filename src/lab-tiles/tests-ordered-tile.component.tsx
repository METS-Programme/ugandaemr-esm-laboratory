import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { useGetOrdersWorklist } from "../worklist-orders/work-list.resource";
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
      label={t("ordered", "Ordered")}
      value={filteredData?.length}
      headerLabel={t("ordered", "Ordered Tests")}
    />
  );
};

export default TestsOrderedTileComponent;
