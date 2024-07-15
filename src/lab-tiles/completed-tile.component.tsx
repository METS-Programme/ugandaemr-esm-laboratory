import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { useLabTestsStats } from "../summary-tiles/laboratory-summary.resource";
import { useOrderDate } from "../utils/functions";

const ApprovedTileComponent = () => {
  const { t } = useTranslation();

  const { currentOrdersDate } = useOrderDate();
  const { data } = useLabTestsStats("COMPLETED", currentOrdersDate);

  return (
    <SummaryTile
      label={t("approved", "Approved")}
      value={data?.length}
      headerLabel={t("approved", "Approved Tests")}
    />
  );
};

export default ApprovedTileComponent;
