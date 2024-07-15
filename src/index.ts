import { defineConfigSchema, getSyncLifecycle } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import { createHomeDashboardLink } from "./components/create-dashboard-link.component";
import rootComponent from "./root.component";
import laboratoryReferralWorkspaceComponent from "./patient-chart/laboratory-workspaces/laboratory-referral.workspace.component";
import laboratory from "./laboratory.component";
import laboratoryOrder from "./patient-chart/patient-laboratory-order-results.component";
import addToWorklist from "./ordered-orders/ordered-tests-dialogs/pick-orders-dialog/pick-order-dialog.component";
import scheduleTestOrders from "./ordered-orders/ordered-tests-dialogs/schedule-orders-dialog/schedulue-test-orders-dialog.component";
import sendEmail from "./patient-chart/results-summary/send-email-dialog.component";
import reviewItemDialogComponent from "./reviewed-orders/review-order-dialog/review-item.component";
import rejectOrderDialogComponent from "./reject-order-dialog/reject-order-dialog.component";
import approvedTabComponent from "./laboratory-tabs/laboratory-tab/approved-tab.component";
import referredTestTabComponent from "./laboratory-tabs/laboratory-tab/referred-tab.component";
import worklistTabComponent from "./laboratory-tabs/laboratory-tab/work-list-tab.component";
import reveiwTabComponent from "./laboratory-tabs/laboratory-tab/review-tab.component";
import pickLabRequestButtonComponent from "./ordered-orders/ordered-tests-actions/pick-test-order-menu.component";
import worklistTile from "./lab-tiles/worklist-tile.component";
import referredTile from "./lab-tiles/referred-tile.component";
import completedTile from "./lab-tiles/completed-tile.component";
import testsOrdered from "./lab-tiles/tests-ordered-tile.component";
import rejectedTile from "./lab-tiles/rejected-tile.component";
import addOrEditOrderResultsButtonComponent from "./worklist-orders/add-or-edit-order-results-menu-item.component";
import rejectWorklistOrderButtonComponent from "./worklist-orders/reject-worklist-order-menu-item.component";
import editOrReviewOrderResultsButtonComponent from "./reviewed-orders/edit-or-review-order-results-menu-item.component";
import addOrEditReferredOrderButtonComponent from "./referred-orders/add-or-edit-referred-order-menu-item.component";
import rejectReferredOrderButtonComponent from "./referred-orders/reject-referred-order-menu-item.component";
import printOrderResultsButtonComponent from "./approved-orders/print-order-results-menu-item.component";
import {
  createDashboardLink,
  registerWorkspace,
} from "@openmrs/esm-patient-common-lib";
import rejectedTabComponent from "./laboratory-tabs/laboratory-tab/rejected-tab.component";

const moduleName = "@ugandaemr/esm-laboratory-app";

const options = {
  featureName: "ugandaemr-esm-laboratory",
  moduleName,
};

export const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

export const root = getSyncLifecycle(rootComponent, options);

export const laboratoryDashboardLink = getSyncLifecycle(
  createHomeDashboardLink({
    name: "laboratory",
    slot: "laboratory-dashboard-slot",
    title: "Laboratory",
  }),
  options
);

export const laboratoryComponent = getSyncLifecycle(laboratory, options);

// Patient chart
export const laboratoryOrderDashboardLink = getSyncLifecycle(
  createDashboardLink({
    path: "laboratory-orders",
    title: "Investigative Results",
    moduleName,
  }),
  options
);
export const laboratoryOrderComponent = getSyncLifecycle(
  laboratoryOrder,
  options
);

export const addToWorklistDialog = getSyncLifecycle(addToWorklist, options);

export const scheduleTestOrdersDialog = getSyncLifecycle(
  scheduleTestOrders,
  options
);

export const sendEmailDialog = getSyncLifecycle(sendEmail, options);

export const reviewItemDialog = getSyncLifecycle(
  reviewItemDialogComponent,
  options
);

export const rejectOrderDialog = getSyncLifecycle(
  rejectOrderDialogComponent,
  options
);

export const reviewComponent = getSyncLifecycle(reveiwTabComponent, options);

export const approvedComponent = getSyncLifecycle(
  approvedTabComponent,
  options
);

export const rejectedComponent = getSyncLifecycle(
  rejectedTabComponent,
  options
);

export const referredTestComponent = getSyncLifecycle(
  referredTestTabComponent,
  options
);

export const worklistComponent = getSyncLifecycle(
  worklistTabComponent,
  options
);

// buttons
// tests ordered
export const pickWorklistOrderButton = getSyncLifecycle(
  pickLabRequestButtonComponent,
  options
);

// worklist
export const addOrEditOrderResultsButton = getSyncLifecycle(
  addOrEditOrderResultsButtonComponent,
  options
);

export const rejectWorklistOrderButton = getSyncLifecycle(
  rejectWorklistOrderButtonComponent,
  options
);

// reviewed
export const editOrReviewOrderResultsButton = getSyncLifecycle(
  editOrReviewOrderResultsButtonComponent,
  options
);

// referred
export const addOrEditReferredOrderButton = getSyncLifecycle(
  addOrEditReferredOrderButtonComponent,
  options
);
export const rejectReferredOrderButton = getSyncLifecycle(
  rejectReferredOrderButtonComponent,
  options
);

// approved
export const printOrderResultsButton = getSyncLifecycle(
  printOrderResultsButtonComponent,
  options
);

// tiles
export const worklistTileComponent = getSyncLifecycle(worklistTile, options);

export const referredTileComponent = getSyncLifecycle(referredTile, options);

export const completedTileComponent = getSyncLifecycle(completedTile, options);

export const testOrderedTileComponent = getSyncLifecycle(testsOrdered, options);

export const rejectedTileComponent = getSyncLifecycle(rejectedTile, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
  registerWorkspace({
    name: "patient-laboratory-referral-workspace",
    title: "Laboratory Referral Form",
    load: getSyncLifecycle(laboratoryReferralWorkspaceComponent, options),
  });
}
