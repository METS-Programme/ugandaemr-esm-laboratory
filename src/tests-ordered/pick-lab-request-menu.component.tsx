import { OverflowMenuItem } from '@carbon/react';
import { launchWorkspace, showModal } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Order } from '../types/patient-queues';

interface PickLabRequestActionMenuProps {
  order: Order;
}

const PickLabRequestActionMenu: React.FC<PickLabRequestActionMenuProps> = ({ order }) => {
  const { t } = useTranslation();

  const handleLaunchWorkspace = useCallback(() => {
    launchWorkspace('pick-order-form-workspace', {
      order,
    });
  }, [order]);

  return (
    <OverflowMenuItem
      itemText={t('pickLabRequest', 'Pick Lab Request')}
      onClick={handleLaunchWorkspace}
      style={{
        maxWidth: '100vw',
      }}
    />
  );
};

export default PickLabRequestActionMenu;
