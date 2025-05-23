import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Microscope, TrashCan, Edit } from '@carbon/react/icons';

import {
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Layer,
  Button,
  Tile,
} from '@carbon/react';
import { Result, useGetOrdersWorklist } from './work-list.resource';
import styles from './work-list.scss';
import { ConfigurableLink, formatDate, parseDate, showModal, usePagination } from '@openmrs/esm-framework';
import { launchOverlay } from '../components/overlay/hook';
import ResultForm from '../results/result-form.component';
import { getStatusColor, useOrderDate } from '../utils/functions';
import { REFERINSTRUCTIONS } from '../constants';

interface WorklistProps {
  fulfillerStatus: string;
}

interface ResultsOrderProps {
  order: Result;
  patientUuid: string;
}

interface RejectOrderProps {
  order: Result;
}

interface EditOrderProps {
  order: Result;
}

const WorkList: React.FC<WorklistProps> = ({ fulfillerStatus }) => {
  const { t } = useTranslation();

  const { currentOrdersDate } = useOrderDate();

  const { data: pickedOrderEntries, isLoading } = useGetOrdersWorklist(fulfillerStatus, currentOrdersDate);

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const filtered = pickedOrderEntries.filter(
    (item) =>
      item?.fulfillerStatus === 'IN_PROGRESS' &&
      item?.accessionNumber !== null &&
      item.dateStopped === null &&
      item.instructions !== REFERINSTRUCTIONS,
  );

  const { goTo, results: paginatedWorkListEntries, currentPage } = usePagination(filtered, currentPageSize);

  const RejectOrder: React.FC<RejectOrderProps> = ({ order }) => {
    const launchRejectOrderModal = useCallback(() => {
      const dispose = showModal('reject-order-dialog', {
        closeModal: () => dispose(),
        order,
      });
    }, [order]);
    return (
      <Button kind="ghost" onClick={launchRejectOrderModal} renderIcon={(props) => <TrashCan size={16} {...props} />} />
    );
  };

  const EditOrder: React.FC<EditOrderProps> = ({ order }) => {
    return <Button kind="ghost" renderIcon={() => <Edit size="16" />}></Button>;
  };

  // get picked orders
  let columns = [
    { id: 0, header: t('date', 'Date'), key: 'date' },

    { id: 1, header: t('orderNumber', 'Order Number'), key: 'orderNumber' },
    { id: 2, header: t('artNumber', 'Art Number'), key: 'artNumber' },
    { id: 3, header: t('patient', 'Patient'), key: 'patient' },
    {
      id: 4,
      header: t('accessionNumber', 'Accession Number'),
      key: 'accessionNumber',
    },
    { id: 5, header: t('test', 'Test'), key: 'test' },
    { id: 6, header: t('status', 'Status'), key: 'status' },
    { id: 7, header: t('orderer', 'Ordered By'), key: 'orderer' },
    { id: 8, header: t('urgency', 'Urgency'), key: 'urgency' },
    { id: 9, header: t('actions', 'Actions'), key: 'actions' },
  ];

  const ResultsOrder = useCallback(
    ({ order, patientUuid }) => {
      return (
        <Button
          kind="ghost"
          onClick={() => {
            launchOverlay(t('resultForm', 'Lab results form'), <ResultForm patientUuid={patientUuid} order={order} />);
          }}
          renderIcon={(props) => <Microscope size={16} {...props} />}
        />
      );
    },
    [t],
  );

  const tableRows = useMemo(() => {
    return paginatedWorkListEntries.map((entry, index) => ({
      ...entry,
      id: entry?.uuid,
      date: formatDate(parseDate(entry?.dateActivated)),
      patient: (
        <ConfigurableLink to={`\${openmrsSpaBase}/patient/${entry?.patient?.uuid}/chart/laboratory-orders`}>
          {entry?.patient?.names[0]?.display}
        </ConfigurableLink>
      ),
      orderNumber: entry?.orderNumber,
      artNumber: entry.patient?.identifiers
        .find((item) => item?.identifierType?.uuid === 'e1731641-30ab-102d-86b0-7a5022ba4115')
        ?.display.split('=')[1]
        .trim(),
      accessionNumber: entry?.accessionNumber,
      test: entry?.concept?.display,
      action: entry?.action,
      status: (
        <span className={styles.statusContainer} style={{ color: `${getStatusColor(entry?.fulfillerStatus)}` }}>
          {entry?.fulfillerStatus}
        </span>
      ),
      orderer: entry?.orderer?.display,
      orderType: entry?.orderType?.display,
      urgency: entry?.urgency,
      actions: {
        content: (
          <>
            <ResultsOrder patientUuid={entry?.patient?.uuid} order={paginatedWorkListEntries[index]} />
            <RejectOrder order={paginatedWorkListEntries[index]} />
            <EditOrder order={paginatedWorkListEntries[index]} />
          </>
        ),
      },
    }));
  }, [ResultsOrder, paginatedWorkListEntries]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (paginatedWorkListEntries?.length >= 0) {
    return (
      <DataTable rows={tableRows} headers={columns} useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps, onInputChange }) => (
          <TableContainer className={styles.tableContainer}>
            <TableToolbar
              style={{
                position: 'static',
              }}>
              <TableToolbarContent>
                <Layer>
                  <TableToolbarSearch
                    expanded
                    onChange={onInputChange}
                    placeholder={t('searchThisList', 'Search this list')}
                    size="sm"
                  />
                </Layer>
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} className={styles.activePatientsTable}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header?.content ?? header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => {
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>{t('noWorklistsToDisplay', 'No worklists orders to display')}</p>
                  </div>
                </Tile>
              </div>
            ) : null}
            <Pagination
              forwardText="Next page"
              backwardText="Previous page"
              page={currentPage}
              pageSize={currentPageSize}
              pageSizes={pageSizes}
              totalItems={filtered?.length}
              className={styles.pagination}
              onChange={({ pageSize, page }) => {
                if (pageSize !== currentPageSize) {
                  setPageSize(pageSize);
                }
                if (page !== currentPage) {
                  goTo(page);
                }
              }}
            />
          </TableContainer>
        )}
      </DataTable>
    );
  }
};

export default WorkList;
