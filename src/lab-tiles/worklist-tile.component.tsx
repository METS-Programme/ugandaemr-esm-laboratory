import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { useLabTestsStats } from "../summary-tiles/laboratory-summary.resource";
import { useOrderDate } from "../utils/functions";
import { REFERINSTRUCTIONS } from "../constants";

const WorklistTileComponent = () => {
  const { t } = useTranslation();
  const { currentOrdersDate } = useOrderDate();

  const { data } = useLabTestsStats("IN_PROGRESS", currentOrdersDate);

  const filteredData = data?.filter(
    (item) =>
      item?.fulfillerStatus === "IN_PROGRESS" &&
      item?.accessionNumber !== null &&
      item?.dateStopped === null &&
      item?.instructions !== REFERINSTRUCTIONS
  );

  return (
    <SummaryTile
      label={t("worklist", "Work List")}
      value={filteredData?.length}
      headerLabel={t("worklist", "Work List")}
    />
  );
};

export default WorklistTileComponent;
