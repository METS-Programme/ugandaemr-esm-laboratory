import React, { useState } from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { syncSelectedTestOrderResults } from './referred-orders.resource';

interface RequestResultsActionProps {
  orders: string[];
}

const RequestResultsAction: React.FC<RequestResultsActionProps> = ({ orders }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRequestResults = async () => {
    if (orders.length === 0) {
      showSnackbar({
        title: 'Request ViralLoad',
        subtitle: 'No orders selected to request results.',
        kind: 'warning',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setIsSuccess(false);

      const response = await syncSelectedTestOrderResults(orders);

      if (response.status === 201) {
        showSnackbar({
          title: 'Request ViralLoad',
          subtitle: 'Request sent successfully.',
          kind: 'success',
        });
        setIsSuccess(true);
      } else {
        showSnackbar({
          title: 'Request ViralLoad',
          subtitle: `Unexpected response status: ${response.status}`,
          kind: 'error',
        });
      }
    } catch (error: any) {
      showSnackbar({
        title: 'Request ViralLoad',
        subtitle: `Request failed: ${error?.message ?? 'Unknown error'}`,
        kind: 'error',
      });
    } finally {
      // Small delay to show the success state if applicable
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(false);
      }, 1500);
    }
  };

  return (
    <div>
      {isSubmitting ? (
        <InlineLoading
          description={isSuccess ? 'Request sent!' : 'Requesting results...'}
          status={isSuccess ? 'finished' : 'active'}
        />
      ) : (
        <Button kind="ghost" size="sm" onClick={handleRequestResults} disabled={orders.length === 0}>
          Request Results
        </Button>
      )}
    </div>
  );
};

export default RequestResultsAction;
