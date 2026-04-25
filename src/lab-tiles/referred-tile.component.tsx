import React from "react";
import { useTranslation } from "react-i18next";
import SummaryTile from "../summary-tiles/summary-tile.component";
import { useLabTestsStats } from "../summary-tiles/laboratory-summary.resource";
import { useOrderDate } from "../utils/functions";
import { REFERINSTRUCTIONS } from "../constants";

const ReferredTileComponent = () => {
  const { t } = useTranslation();

  const { currentOrdersDate } = useOrderDate();

  const { data } = useLabTestsStats("", currentOrdersDate);

  const filteredData = data?.filter(
    (item) =>
      item?.fulfillerStatus === "IN_PROGRESS" &&
      item?.accessionNumber !== null &&
      item?.dateStopped === null &&
      item?.instructions === REFERINSTRUCTIONS
  );

  return (
    <SummaryTile
      label={t("transferred", "Transferred")}
      value={filteredData?.length}
      headerLabel={t("referredTests", "Referred tests")}
    />
  );
};

export default ReferredTileComponent;
