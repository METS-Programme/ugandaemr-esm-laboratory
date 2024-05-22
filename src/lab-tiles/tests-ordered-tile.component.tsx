import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import dayjs from "dayjs";
import { useGetOrdersWorklist } from "../work-list/work-list.resource";

const TestsOrderedTileComponent = () => {
  const { t } = useTranslation();
  const today = dayjs(new Date()).format("YYYY-MM-DD");
  const { data } = useGetOrdersWorklist("", today);

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
