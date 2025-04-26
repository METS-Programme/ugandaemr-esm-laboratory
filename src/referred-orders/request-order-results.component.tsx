import React, { useState } from "react";
import { Button, InlineLoading } from "@carbon/react";
import { SyncTestOrder } from "../work-list/work-list.resource";

interface RequestResultsActionProps {
    orders: string[];
}

const RequestResultsAction: React.FC<RequestResultsActionProps> = ({ orders }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRequestResults = async () => {
        try {
            setIsSubmitting(true);
            const response = await SyncTestOrder(orders);

            if (response.status === 201) {
                console.log("Results requested successfully:", response);
            } else {
                console.error("Error requesting results, status:", response.status);
            }
        } catch (error) {
            console.error("Request failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {isSubmitting ? (
                <InlineLoading description="Requesting results..." />
            ) : (
                <Button kind="ghost" size="sm" onClick={handleRequestResults} disabled={orders.length === 0}>
                    Request Results
                </Button>
            )}
        </div>
    );
};

export default RequestResultsAction;
