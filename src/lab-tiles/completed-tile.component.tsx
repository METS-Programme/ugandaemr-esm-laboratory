import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { useLabTestsStats } from "../summary-tiles/laboratory-summary.resource";
import dayjs from "dayjs";

const ApprovedTileComponent = () => {
  const { t } = useTranslation();

  const today = dayjs(new Date()).format("YYYY-MM-DD");

  const { data } = useLabTestsStats("COMPLETED", today);

  return (
    <SummaryTile
      label={t("completed", "Completed")}
      value={data?.length}
      headerLabel={t("approved", "Approved")}
    />
  );
};

export default ApprovedTileComponent;
