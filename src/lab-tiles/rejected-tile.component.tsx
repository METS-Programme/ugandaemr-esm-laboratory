import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { useLabTestsStats } from "../summary-tiles/laboratory-summary.resource";
import { useOrderDate } from "../utils/functions";

const RejectedTileComponent = () => {
  const { t } = useTranslation();

  const { currentOrdersDate } = useOrderDate();

  const { data } = useLabTestsStats("", currentOrdersDate);

  const filteredData = data?.filter(
    (item) => item?.fulfillerStatus === "DECLINED"
  );

  return (
    <SummaryTile
      label={t("rejected", "Rejected")}
      value={filteredData?.length}
      headerLabel={t("rejectedTests", "Rejected Tests")}
    />
  );
};

export default RejectedTileComponent;
