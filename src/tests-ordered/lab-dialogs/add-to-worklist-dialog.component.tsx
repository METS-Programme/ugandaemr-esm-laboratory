import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Checkbox,
  TextInput,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import styles from "./add-to-worklist-dialog.scss";
import {
  restBaseUrl,
  showNotification,
  showSnackbar,
  useConfig,
} from "@openmrs/esm-framework";
import { Renew } from "@carbon/react/icons";
import {
  GenerateSpecimenId,
  UpdateOrder,
  extractLetters,
  useReferralLocations,
  useSpecimenTypes,
} from "./add-to-worklist-dialog.resource";
import { Order } from "../../types/patient-queues";
import {
  extractErrorMessagesFromResponse,
  handleMutate,
} from "../../utils/functions";

interface AddToWorklistDialogProps {
  queueId;
  order: Order;
  closeModal: () => void;
}

const inputRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  columnGap: "10px",
};

const AddToWorklistDialog: React.FC<AddToWorklistDialogProps> = ({
  queueId,
  order,
  closeModal,
}) => {
  const { t } = useTranslation();
  const config = useConfig();
  const { specimenTypes } = useSpecimenTypes();
  const { referrals } = useReferralLocations();

  const [specimenID, setSpecimenID] = useState("");
  const [specimenType, setSpecimenType] = useState<string | undefined>();
  const [preferred, setPreferred] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState("");
  const [externalReferralName, setExternalReferralName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [confirmBarcode, setConfirmBarcode] = useState("");

  const isReferralWithName =
    selectedReferral === "3476fd97-71da-4e9c-bf57-2b6318dc0c9f";

  useEffect(() => {
    if (barcode && confirmBarcode && barcode === confirmBarcode) {
      setSpecimenID(barcode);
    }
  }, [barcode, confirmBarcode]);

  const handleGenerateId = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const resp = await GenerateSpecimenId(order.uuid);
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
        handleMutate(`${restBaseUrl}/generatesampleId`);
      } catch (error) {
        handleMutate(`${restBaseUrl}/generatesampleId`);
        const errorMessages = extractErrorMessagesFromResponse(error);
        showNotification({
          title: t("errorGeneratingId", "Error Generating Sample Id"),
          kind: "error",
          critical: true,
          description: errorMessages.join(", "),
        });
      }
    },
    [order.uuid, t]
  );

  const handlePickRequest = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const body = {
          sampleId: specimenID,
          specimenSourceId: specimenType,
          unProcessedOrders: "",
          patientQueueId: queueId,
          referenceLab: preferred ? extractLetters(selectedReferral) : "",
        };
        await UpdateOrder(order.uuid, body);
        showSnackbar({
          isLowContrast: true,
          title: t("pickedAnOrder", "Picked an order"),
          kind: "success",
          subtitle: t(
            "pickSuccessfully",
            "You have successfully picked an Order"
          ),
        });
        closeModal();
        handleMutate(`${restBaseUrl}/order`);
      } catch (error) {
        handleMutate(`${restBaseUrl}/order`);
        const errorMessages = extractErrorMessagesFromResponse(error);
        showNotification({
          title: t("errorPickingAnOrder", "Error Picking an Order"),
          kind: "error",
          critical: true,
          description: errorMessages.join(", "),
        });
      }
    },
    [
      specimenID,
      specimenType,
      queueId,
      preferred,
      selectedReferral,
      order.uuid,
      t,
      closeModal,
    ]
  );

  return (
    <Form onSubmit={handlePickRequest}>
      <ModalHeader
        closeModal={closeModal}
        title={t("pickRequest", `Test : ${order?.concept?.display}`)}
      />
      <ModalBody>
        <div className={styles.modalBody}>
          {/* Specimen ID / Barcode Section */}
          <section className={styles.section}>
            <div style={inputRowStyle}>
              <div className={styles.sectionTitle}>
                {preferred
                  ? t("barcode", "Barcode")
                  : t("specimenID", "Specimen ID")}
              </div>
              <div style={{ width: "430px" }}>
                <TextInput
                  id="specimenId"
                  value={specimenID}
                  readOnly={
                    !!config.enableSpecimenIdAutoGeneration || preferred
                  }
                  hideReadOnly={preferred}
                  onChange={(e) => setSpecimenID(e.target.value)}
                />
              </div>
              {config.enableSpecimenIdAutoGeneration && (
                <Button
                  hasIconOnly
                  onClick={handleGenerateId}
                  renderIcon={(props) => <Renew size={16} {...props} />}
                  disabled={preferred}
                />
              )}
            </div>
          </section>

          {/* Specimen Type Section */}
          <section className={styles.section}>
            <div style={inputRowStyle}>
              <div className={styles.sectionTitle}>
                {t("specimenType", "Specimen Type")}
              </div>
              <div style={{ width: "500px" }}>
                <Select
                  id="specimen-types"
                  name="specimen-types"
                  labelText={t("specimenType", "Specimen Type")}
                  value={specimenType}
                  onChange={(e) => setSpecimenType(e.target.value)}
                >
                  {!specimenType && (
                    <SelectItem
                      text={t("selectSpecimenType", "Select Specimen Type")}
                      value=""
                    />
                  )}
                  {specimenTypes.map(({ uuid, display }) => (
                    <SelectItem key={uuid} text={display} value={uuid} />
                  ))}
                </Select>
              </div>
            </div>
          </section>

          {/* Referral Section */}
          <section style={inputRowStyle}>
            <Checkbox
              checked={preferred}
              onChange={() => setPreferred((prev) => !prev)}
              labelText={t("referred", "Referred")}
              id="test-referred"
            />

            {preferred && (
              <div style={{ width: "500px" }}>
                <section className={styles.section}>
                  <Select
                    id="referralLocation"
                    name="referralLocation"
                    labelText={t("locationReferral", "Referral Location")}
                    value={selectedReferral}
                    onChange={(e) => setSelectedReferral(e.target.value)}
                  >
                    {!selectedReferral && (
                      <SelectItem
                        text={t(
                          "selectReferralPoint",
                          "Select a referral point"
                        )}
                        value=""
                      />
                    )}
                    {referrals.map(({ uuid, display }) => (
                      <SelectItem key={uuid} text={display} value={display} />
                    ))}
                  </Select>
                </section>

                <section className={styles.section}>
                  {isReferralWithName && (
                    <TextInput
                      id="locationName"
                      labelText={t("enterName", "Enter Name")}
                      value={externalReferralName}
                      required
                      onChange={(e) => setExternalReferralName(e.target.value)}
                    />
                  )}

                  <TextInput
                    id="enterBarcode"
                    labelText={t("enterBarcode", "Enter Barcode")}
                    value={barcode}
                    required
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                  <TextInput
                    id="confirmBarcode"
                    labelText={t("confirmBarcode", "Confirm Barcode")}
                    value={confirmBarcode}
                    required
                    onChange={(e) => setConfirmBarcode(e.target.value)}
                  />
                </section>
              </div>
            )}
          </section>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t("cancel", "Cancel")}
        </Button>
        <Button type="submit">{t("pickPatient", "Pick Lab Request")}</Button>
      </ModalFooter>
    </Form>
  );
};

export default AddToWorklistDialog;
