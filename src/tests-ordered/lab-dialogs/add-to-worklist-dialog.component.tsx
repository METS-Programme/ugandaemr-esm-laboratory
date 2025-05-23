import React, { useEffect, useState } from 'react';
import { Button, Select, SelectItem, Checkbox, TextInput, ButtonSet, FormGroup } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './add-to-worklist-dialog.scss';
import { DefaultWorkspaceProps, restBaseUrl, showNotification, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { Renew } from '@carbon/react/icons';
import {
  GenerateSpecimenId,
  UpdateOrder,
  extractLetters,
  useReferralLocations,
  useSpecimenTypes,
} from './add-to-worklist-dialog.resource';
import { Order } from '../../types/patient-queues';
import { extractErrorMessagesFromResponse, handleMutate } from '../../utils/functions';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

type AddToWorklistDialogProps = DefaultWorkspaceProps & {
  order: Order;
};

const AddToWorklistDialog: React.FC<AddToWorklistDialogProps> = ({ closeWorkspace, order }) => {
  const { t } = useTranslation();
  const config = useConfig();
  const { specimenTypes } = useSpecimenTypes();
  const { referrals } = useReferralLocations();

  const [preferred, setPreferred] = useState(false);
  const [specimenID, setSpecimenID] = useState('');
  const [barcode, setBarcode] = useState('');
  const [specimenType, setSpecimenType] = useState('');
  const [selectedReferral, setSelectedReferral] = useState('');
  const [confirmBarcode, setConfirmBarcode] = useState('');
  const [externalReferralName, setExternalReferralName] = useState('');

  const generateSpecimenIdSchema = z
    .object({
      specimenId: z.string().min(1, { message: t('specimenIdRequired', 'Specimen ID is required') }),
      specimenSourceId: z.string().min(1, { message: t('specimenTypeRequired', 'Specimen Type is required') }),
      barcode: z
        .string()
        .min(2, { message: t('barcodeMinLength', 'Barcode must be at least 2 characters') })
        .max(10, { message: t('barcodeMaxLength', 'Barcode must be at most 10 characters') })
        .regex(/^[a-zA-Z0-9]+$/, {
          message: t('barcodeAlphanumeric', 'Barcode must only contain letters and numbers'),
        })
        .refine((val) => !/\s/.test(val), {
          message: t('barcodeNoSpaces', 'Barcode must not contain spaces'),
        })
        .refine(
          (val) => {
            const prefix = val.slice(0, 2);
            const num = parseInt(prefix, 10);
            return !isNaN(num) && num >= 24;
          },
          {
            message: t('barcodePrefixInvalid', 'Barcode must start with a number 24 or greater'),
          },
        ),
      confirmBarcode: z.string().min(1, { message: t('confirmBarcodeRequired', 'Confirm Barcode is required') }),
      unProcessedOrders: z.string().optional(),
      patientQueueId: z.string().optional(),
      referenceLab: z.string().optional(),
      referred: z.boolean().optional(),
      externalReferralName: z.string().optional(),
    })
    .refine((data) => data.barcode === data.confirmBarcode, {
      message: t('barcodeMismatch', 'Barcode and Confirm Barcode must match'),
      path: ['confirmBarcode'],
    });

  type GenerateSpecimenIdSchema = z.infer<typeof generateSpecimenIdSchema>;

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GenerateSpecimenIdSchema>({
    mode: 'all',
    resolver: zodResolver(generateSpecimenIdSchema),
    defaultValues: {
      specimenId: preferred ? barcode : specimenID,
      referenceLab: preferred ? extractLetters(selectedReferral) : '',
    },
  });

  const handleSave = async () => {
    const body = {
      sampleId: preferred ? barcode : specimenID,
      specimenSourceId: specimenType,
      unProcessedOrders: '',
      patientQueueId: '',
      referenceLab: preferred ? extractLetters(selectedReferral) : '',
    };

    try {
      await UpdateOrder(order.uuid, body);
      showSnackbar({
        isLowContrast: true,
        title: t('pickedAnOrder', 'Picked an order'),
        kind: 'success',
        subtitle: t('pickSuccessfully', 'You have successfully picked an Order'),
      });
      closeWorkspace();
    } catch (error) {
      const errorMessages = extractErrorMessagesFromResponse(error);
      showNotification({
        title: t('errorPickingOrder', 'Error Picking an Order'),
        kind: 'error',
        critical: true,
        description: errorMessages.join(', '),
      });
    } finally {
      handleMutate(`${restBaseUrl}/order`);
    }
  };

  const generateId = async () => {
    try {
      const resp = await GenerateSpecimenId(order.uuid);
      setSpecimenID(resp.data.results[0].sampleId);
      showSnackbar({
        isLowContrast: true,
        title: t('generatesampleID', 'Generate Sample Id'),
        kind: 'success',
        subtitle: t('generateSuccessfully', 'You have successfully generated a Sample Id'),
      });
    } catch (error) {
      const errorMessages = extractErrorMessagesFromResponse(error);
      showNotification({
        title: t('errorGeneratingId', 'Error Generating Sample Id'),
        kind: 'error',
        critical: true,
        description: errorMessages.join(', '),
      });
    }
  };

  useEffect(() => {
    if (barcode !== '' && confirmBarcode !== '' && barcode === confirmBarcode) {
      setSpecimenID(barcode || confirmBarcode || specimenID);
    }
  }, [barcode, confirmBarcode]);

  return (
    <div className={styles.container}>
      <div className={styles.body}>
        {Object.keys(errors).length > 0 && (
          <div className={styles.errorMessage}>
            <ul>
              {Object.entries(errors).map(([key, error]) => (
                <li key={key}>
                  {key}: {error?.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <FormGroup title={preferred ? t('barcode', 'Barcode') : t('specimenID', 'Specimen ID')}>
          <div className={styles.flexRow}>
            <Controller
              name="specimenId"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  type="text"
                  id="specimenId"
                  labelText={preferred ? t('barcode', 'Barcode') : t('specimenID', 'Specimen ID')}
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  readOnly={config.enableSpecimenIdAutoGeneration || preferred}
                  hideReadOnly={preferred}
                  onChange={(e) => {
                    field.onChange(e);
                    if (!preferred) setSpecimenID(e.target.value);
                  }}
                />
              )}
            />
            {config.enableSpecimenIdAutoGeneration && (
              <Button
                hasIconOnly
                onClick={generateId}
                renderIcon={(props) => <Renew size={16} {...props} />}
                disabled={preferred}
              />
            )}
          </div>
        </FormGroup>

        <FormGroup title={t('specimenType', 'Specimen Type')}>
          <div className={styles.flexRow}>
            <Controller
              name="specimenSourceId"
              control={control}
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  id="specimen-types"
                  labelText="Specimen Type"
                  invalid={!!fieldState.error}
                  invalidText={fieldState.error?.message}
                  onChange={(event) => {
                    field.onChange(event);
                    setSpecimenType(event.target.value);
                  }}>
                  {!specimenType && <SelectItem text={t('specimenType', 'Select Specimen Type')} value="" />}
                  {specimenTypes.map((type) => (
                    <SelectItem key={type.uuid} text={type.display} value={type.uuid} />
                  ))}
                </Select>
              )}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <Controller
            name="referred"
            control={control}
            render={({ field }) => (
              <Checkbox
                {...field}
                id="referred"
                labelText={t('referred', 'Referred')}
                checked={preferred}
                onChange={(event) => {
                  field.onChange(event);
                  setPreferred(event.target.checked);
                }}
              />
            )}
          />

          {preferred && (
            <>
              <FormGroup title={t('locationReferral', 'Referral Location')}>
                <div className={styles.flexRow}>
                  <Controller
                    name="referenceLab"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Select
                        {...field}
                        id="referral-location"
                        labelText={t('locationReferral', 'Referral Location')}
                        invalid={!!fieldState.error}
                        invalidText={fieldState.error?.message}
                        onChange={(event) => {
                          field.onChange(event);
                          setSelectedReferral(event.target.value);
                        }}>
                        {!selectedReferral && (
                          <SelectItem text={t('selectAReferralPoint', 'Select a referral point')} value="" />
                        )}
                        {referrals.map((referral) => (
                          <SelectItem key={referral.uuid} text={referral.display} value={referral.uuid} />
                        ))}
                      </Select>
                    )}
                  />
                </div>
              </FormGroup>

              {selectedReferral === '3476fd97-71da-4e9c-bf57-2b6318dc0c9f' && (
                <FormGroup title="Enter Name">
                  <div className={styles.flexRow}>
                    <Controller
                      name="externalReferralName"
                      control={control}
                      render={({ field }) => (
                        <TextInput
                          {...field}
                          type="text"
                          labelText="Enter Name"
                          id="locationName"
                          onChange={(e) => {
                            field.onChange(e);
                            setExternalReferralName(e.target.value);
                          }}
                        />
                      )}
                    />
                  </div>
                </FormGroup>
              )}

              <FormGroup title="Enter Barcode">
                <div className={styles.flexRow}>
                  <Controller
                    name="barcode"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div style={{ width: '100%' }}>
                        <TextInput
                          {...field}
                          type="text"
                          id="barcode"
                          labelText="Enter Barcode"
                          invalid={!!fieldState.error}
                          invalidText={fieldState.error?.message}
                          value={barcode}
                          onChange={(e) => {
                            field.onChange(e);
                            setBarcode(e.target.value);
                          }}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {barcode.length} / 10
                        </div>
                      </div>
                    )}
                  />
                </div>
              </FormGroup>

              <FormGroup title="Confirm Barcode">
                <div className={styles.flexRow}>
                  <Controller
                    name="confirmBarcode"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div style={{ width: '100%' }}>
                        <TextInput
                          {...field}
                          type="text"
                          id="confirmBarcode"
                          labelText="Confirm Barcode"
                          invalid={!!fieldState.error}
                          invalidText={fieldState.error?.message}
                          value={confirmBarcode}
                          onChange={(e) => {
                            field.onChange(e);
                            setConfirmBarcode(e.target.value);
                          }}
                        />
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {confirmBarcode.length} / 10
                        </div>
                      </div>
                    )}
                  />
                </div>
              </FormGroup>
            </>
          )}
        </FormGroup>
      </div>

      <ButtonSet className={styles.buttonSet}>
        <Button kind="secondary" onClick={closeWorkspace} className={styles.button}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" onClick={handleSubmit(handleSave)} className={styles.button}>
          {t('pickPatient', 'Pick Lab Request')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default AddToWorklistDialog;
