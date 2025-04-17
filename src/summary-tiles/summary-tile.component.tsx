import React from "react";
import { useTranslation } from "react-i18next";
import { Tile } from "@carbon/react";
import styles from "./summary-tile.scss";

interface SummaryTileProps {
  label: string;
  value: number;
  headerLabel: string;
  children?: React.ReactNode;
}

const SummaryTile: React.FC<SummaryTileProps> = ({
  label,
  value,
  headerLabel,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.tileContainer} light={true}>
      <div className={styles.tileHeader}>
        <div className={styles.headerLabelContainer}>
          <label className={styles.headerLabel}>{headerLabel}</label>
          {children}
        </div>
        <div></div>
      </div>
      <div>
        <label className={styles.totalsLabel}>{label}</label>
        <p className={styles.totalsValue}>{value}</p>
      </div>
    </Tile>
  );
};

export default SummaryTile;
