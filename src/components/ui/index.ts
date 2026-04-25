/**
 * Central exports for UI components
 * Provides consistent import interface for all reusable UI components
 */

// Data display components
export { CustomDataTable } from "./data-table.component";
export type { Column, DataTableProps } from "./data-table.component";

// Status and feedback components
export { StatusBadge, useStatusColor } from "./status-badge.component";
export type { StatusBadgeProps, StatusType } from "./status-badge.component";

// Loading components
export { LoadingOverlay, LoadingSpinner } from "./loading-overlay.component";
export type { LoadingOverlayProps } from "./loading-overlay.component";

// Action components
export { ActionMenu, createActions } from "./action-menu.component";
export type { ActionItem, ActionMenuProps } from "./action-menu.component";
