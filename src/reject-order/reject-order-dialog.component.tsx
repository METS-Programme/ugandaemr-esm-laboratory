import React, { useState } from "react";

import {
  Button,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextArea,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import styles from "./reject-order-dialog.scss";
import { Result } from "../work-list/work-list.resource";
import { RejectOrder } from "./reject-order-dialog.resource";
import {
  restBaseUrl,
  showNotification,
  showSnackbar,
} from "@openmrs/esm-framework";
import {
  extractErrorMessagesFromResponse,
  handleMutate,
} from "../utils/functions";

interface RejectOrderDialogProps {
  order: Result;
  closeModal: () => void;
}

const RejectOrderDialog: React.FC<RejectOrderDialogProps> = ({
  order,
  closeModal,
}) => {
  const { t } = useTranslation();

  const [notes, setNotes] = useState("");

  const rejectOrder = async (event) => {
    event.preventDefault();

    const payload = {
      fulfillerStatus: "DECLINED", // Todo changed to Declined when UgEMR module is upgraded to 2.6.1
      fulfillerComment: notes,
    };
    RejectOrder(order.uuid, payload).then(
      (resp) => {
        showSnackbar({
          isLowContrast: true,
          title: t("rejectOrder", "Rejected Order"),
          kind: "success",
          subtitle: t(
            "successfullyrejected",
            `You have successfully rejected an Order with OrderNumber ${order.orderNumber} `
          ),
        });
        closeModal();
        handleMutate(`${restBaseUrl}/order`);
      },
      (error) => {
        const errorMessages = extractErrorMessagesFromResponse(error);

        showNotification({
          title: t(`errorRejecting order', 'Error Rejecting a order`),
          kind: "error",
          critical: true,
          description: errorMessages.join(", "),
        });
        handleMutate(`${restBaseUrl}/order`);
      }
    );
  };

  return (
    <div>
      <Form onSubmit={rejectOrder}>
        <ModalHeader
          closeModal={closeModal}
          title={t("rejectOrder", "Reject Order")}
        />
        <ModalBody>
          <div className={styles.modalBody}>
            <section className={styles.section}>
              <h5 className={styles.section}>
                {order?.accessionNumber} &nbsp; · &nbsp;{order?.fulfillerStatus}{" "}
                &nbsp; · &nbsp;
                {order?.orderNumber}
                &nbsp;
              </h5>
            </section>
            <br />
            <section className={styles.section}>
              <TextArea
                labelText={t("notes", "Enter Comments ")}
                id="nextNotes"
                name="nextNotes"
                invalidText="Required"
                helperText="Please enter comment"
                maxCount={500}
                enableCounter
                onChange={(e) => setNotes(e.target.value)}
              />
            </section>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t("cancel", "Cancel")}
          </Button>
          <Button kind="danger" type="submit">
            {t("rejectOrder", "Reject Order")}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default RejectOrderDialog;
