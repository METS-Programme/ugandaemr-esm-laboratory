import React, { useMemo, useState } from "react";
import {
  Button,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectItem,
  TextInput,
} from "@carbon/react";
import { Order } from "@openmrs/esm-patient-common-lib";
import { useTranslation } from "react-i18next";
import styles from "../pick-orders-dialog/pick-order-dialog.scss";
import {
  showNotification,
  showSnackbar,
  useLayoutType,
} from "@openmrs/esm-framework";

import { extractErrorMessagesFromResponse } from "../../../utils/functions";
import {
  GenerateSpecimenId,
  useReferralLocations,
  useSpecimenTypes,
} from "../pick-orders-dialog/pick-order-dialog.resource";
interface ScheduleTestOrdersDialogProps {
  orders: Order[];
  closeModal: () => void;
}

const ScheduleTestOrdersDialog: React.FC<ScheduleTestOrdersDialogProps> = ({
  orders,
  closeModal,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === "tablet";

  const { specimenTypes } = useSpecimenTypes();
  const { referrals } = useReferralLocations();

  const [specimenType, setSpecimenType] = useState();
  const [selectedReferral, setSelectedReferral] = useState("");
  const [specimenID, setSpecimenID] = useState("");

  const tableHeaders = useMemo(
    () => [
      { id: 0, header: t("test", "Test"), key: "test" },
      { id: 1, header: t("specimenId", "Specimen ID"), key: "specimenId" },
      {
        id: 2,
        header: t("specimenSource", "Specimen Source"),
        key: "specimenSource",
      },
      { id: 3, header: t("referralLab", "Referral Lab"), key: "referralLab" },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return orders?.map((order) => ({
      ...order,
      id: order.uuid,
      test: order.display,
      specimenId: (
        <div style={{ width: "100px" }}>
          <TextInput
            type="text"
            id="specimentId"
            value={specimenID}
            onChange={(e) => setSpecimenID(e.target.value)}
          />
        </div>
      ),
      specimenSource: (
        <Select
          labelText=""
          id="specimen-types"
          name="specimen-types"
          value={specimenType}
          onChange={(event) => setSpecimenType(event.target.value)}
        >
          {!specimenType ? (
            <SelectItem
              text={t("specimenType", "Select Specimen Type")}
              value=""
            />
          ) : null}
          {specimenTypes.map((type) => (
            <SelectItem key={type.uuid} text={type.display} value={type.uuid}>
              {type.display}
            </SelectItem>
          ))}
        </Select>
      ),
      referralLab: (
        <Select
          labelText=""
          id="referralLocation"
          name="referralLocation"
          value={selectedReferral}
          onChange={(event) => setSelectedReferral(event.target.value)}
        >
          {!selectedReferral ? (
            <SelectItem
              text={t("selectAreferralPoint", "Select a referal point")}
              value=""
            />
          ) : null}
          {referrals.map((referral) => (
            <SelectItem
              key={referral.uuid}
              text={referral.display}
              value={referral.display}
            >
              {referral.display}
            </SelectItem>
          ))}
        </Select>
      ),
    }));
  }, [orders]);

  const generateId = async (e, uuid: string) => {
    e.preventDefault();
    GenerateSpecimenId(uuid).then(
      (resp) => {
        setSpecimenID(resp.data.results[0].sampleId);
        showSnackbar({
          isLowContrast: true,
          title: t("generatesampleID", "Generate Sample Id"),
          kind: "success",
          subtitle: t(
            "generateSuccessfully",
            "You have successfully generated a Sample Id"
          ),
        });
      },
      (error) => {
        const errorMessages = extractErrorMessagesFromResponse(error);

        showNotification({
          title: t(`errorGeneratingId', 'Error Generating Sample Id`),
          kind: "error",
          critical: true,
          description: errorMessages.join(", "),
        });
      }
    );
  };

  return (
    <div>
      <Form>
        <ModalHeader closeModal={closeModal} title={"Schedule Orders"} />
        <ModalBody>
          <div className={styles.modalBody}>
            <div style={{ marginBottom: "1rem" }}>
              <Button kind="primary" onClick={generateId}>
                Generate ID
              </Button>
            </div>

            <DataTable
              rows={tableRows}
              headers={tableHeaders}
              size={isTablet ? "lg" : "sm"}
            >
              {({
                rows,
                headers,
                getHeaderProps,
                getRowProps,
                getTableProps,
                getTableContainerProps,
              }) => (
                <TableContainer {...getTableContainerProps()}>
                  <Table {...getTableProps()} aria-label="testorders">
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader {...getHeaderProps({ header })}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={styles.testCell}
                            >
                              {cell.value}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t("cancel", "Cancel")}
          </Button>
          <Button type="submit" onClick={""}>
            {t("scheduleOrders", "Schedule Orders")}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default ScheduleTestOrdersDialog;
