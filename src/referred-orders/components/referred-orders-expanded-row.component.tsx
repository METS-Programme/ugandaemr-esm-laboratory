/**
 * Referred Orders Expanded Row Component
 * Displays detailed information for a referred order when expanded
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { TableExpandedRow, TableCell, TableRow } from "@carbon/react";
import { formatDate, parseDate } from "@openmrs/esm-framework";
import { getAllTestOrderResults } from "../referred-orders.resource";
import styles from "../referred-orders.scss";

export interface ReferredOrderExpandedRowProps {
  row: {
    id: string;
    referringFacility: string;
    receivingFacility: string;
    orderDate: string;
    status: string;
    patient: {
      uuid: string;
      display: string;
    };
    tests: Array<{
      uuid: string;
      display: string;
    }>;
    notes?: string;
  };
}

/**
 * Expanded row component showing detailed referred order information
 */
export const ReferredOrderExpandedRow: React.FC<
  ReferredOrderExpandedRowProps
> = ({ row }) => {
  const { t } = useTranslation();
  const [testResults, setTestResults] = React.useState<Array<any>>([]);
  const [isLoadingResults, setIsLoadingResults] = React.useState(false);

  React.useEffect(() => {
    const fetchResults = async () => {
      setIsLoadingResults(true);
      try {
        const results = await getAllTestOrderResults();
        setTestResults(results?.data || []);
      } catch (error) {
        console.error("Error fetching test results:", error);
      } finally {
        setIsLoadingResults(false);
      }
    };

    if (row.id) {
      fetchResults();
    }
  }, [row.id]);

  const formattedDate = formatDate(parseDate(row.orderDate));

  return (
    <TableExpandedRow colSpan={8}>
      <TableCell className={styles.expandedCell}>
        <div className={styles.expandedContent}>
          <div className={styles.expandedSection}>
            <h4>{t("orderDetails", "Order Details")}</h4>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("referringFacility", "Referring Facility")}:
              </span>
              <span className={styles.detailValue}>
                {row.referringFacility}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("receivingFacility", "Receiving Facility")}:
              </span>
              <span className={styles.detailValue}>
                {row.receivingFacility}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("orderDate", "Order Date")}:
              </span>
              <span className={styles.detailValue}>{formattedDate}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t("patient", "Patient")}:
              </span>
              <span className={styles.detailValue}>{row.patient?.display}</span>
            </div>
          </div>

          <div className={styles.expandedSection}>
            <h4>{t("tests", "Tests")}</h4>
            <ul className={styles.testList}>
              {row.tests?.map((test, index) => (
                <li key={index}>{test.display}</li>
              ))}
            </ul>
          </div>

          {row.notes && (
            <div className={styles.expandedSection}>
              <h4>{t("notes", "Notes")}</h4>
              <p className={styles.notes}>{row.notes}</p>
            </div>
          )}

          <div className={styles.expandedSection}>
            <h4>{t("testResults", "Test Results")}</h4>
            {isLoadingResults ? (
              <div className={styles.loadingText}>
                {t("loadingResults", "Loading results...")}
              </div>
            ) : testResults.length > 0 ? (
              <ul className={styles.resultsList}>
                {testResults.map((result, index) => (
                  <li key={index} className={styles.resultItem}>
                    <span className={styles.resultName}>{result.testName}</span>
                    <span className={styles.resultValue}>{result.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.noResults}>
                {t("noResultsAvailable", "No results available")}
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableExpandedRow>
  );
};
