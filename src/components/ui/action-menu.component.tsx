/**
 * Action Menu Component
 * Provides consistent action menus with confirmation dialogs
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { OverflowMenuItem, OverflowMenu } from "@carbon/react";
import {
  DocumentAdd,
  DocumentDownload,
  TrashCan,
  Edit,
  View,
  ArrowRight,
  Renew,
  Email,
  Printer,
} from "@carbon/icons-react";

export interface ActionItem {
  id: string;
  label: string;
  icon?: React.ComponentType;
  onClick: () => void;
  requireConfirmation?: boolean;
  confirmationMessage?: string;
  dangerous?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface ActionMenuProps {
  actions: ActionItem[];
  direction?: "bottom" | "top";
  size?: "sm" | "md" | "lg";
  menuLabel?: string;
  className?: string;
}

/**
 * Reusable action menu component
 * Provides consistent action menus with confirmation support
 */
export const ActionMenu: React.FC<ActionMenuProps> = ({
  actions,
  direction = "bottom",
  size = "md",
  menuLabel = "Actions",
  className = "",
}) => {
  const { t } = useTranslation();
  const [pendingAction, setPendingAction] = useState<ActionItem | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleActionClick = (action: ActionItem) => {
    if (action.requireConfirmation) {
      setPendingAction(action);
      setShowConfirmation(true);
    } else {
      action.onClick();
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      pendingAction.onClick();
      setShowConfirmation(false);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmation(false);
    setPendingAction(null);
  };

  return (
    <div className={`action-menu ${className}`}>
      <OverflowMenu flipped={direction === "top"} menuLabel={menuLabel} size={size}>
        {actions.map((action) => (
          <OverflowMenuItem
            key={action.id}
            itemText={action.label}
            disabled={action.disabled}
            isDelete={action.dangerous}
            hasDivider={action.divider}
            requireTitle
            onClick={() => handleActionClick(action)}
          />
        ))}
      </OverflowMenu>

      {/* Confirmation Dialog */}
      {showConfirmation && pendingAction && (
        <div className="confirmation-dialog">
          <div className="confirmation-dialog-content">
            <p>{pendingAction.confirmationMessage || t("confirmAction", "Are you sure?")}</p>
            <div className="confirmation-dialog-actions">
              <button onClick={cancelAction} className="btn btn-secondary">
                {t("cancel", "Cancel")}
              </button>
              <button
                onClick={confirmAction}
                className={`btn ${pendingAction.dangerous ? "btn-danger" : "btn-primary"}`}
              >
                {t("confirm", "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Common action creators for standard actions
 */
export const createActions = {
  view: (onClick: () => void, label?: string): ActionItem => ({
    id: "view",
    label: label || "View",
    icon: View,
    onClick,
  }),

  edit: (onClick: () => void, label?: string): ActionItem => ({
    id: "edit",
    label: label || "Edit",
    icon: Edit,
    onClick,
  }),

  delete: (onClick: () => void, confirmationMessage?: string, label?: string): ActionItem => ({
    id: "delete",
    label: label || "Delete",
    icon: TrashCan,
    onClick,
    requireConfirmation: true,
    confirmationMessage: confirmationMessage || "Are you sure you want to delete this item?",
    dangerous: true,
  }),

  download: (onClick: () => void, label?: string): ActionItem => ({
    id: "download",
    label: label || "Download",
    icon: DocumentDownload,
    onClick,
  }),

  print: (onClick: () => void, label?: string): ActionItem => ({
    id: "print",
    label: label || "Print",
    icon: Printer,
    onClick,
  }),

  email: (onClick: () => void, label?: string): ActionItem => ({
    id: "email",
    label: label || "Email",
    icon: Email,
    onClick,
  }),

  refresh: (onClick: () => void, label?: string): ActionItem => ({
    id: "refresh",
    label: label || "Refresh",
    icon: Renew,
    onClick,
  }),

  add: (onClick: () => void, label?: string): ActionItem => ({
    id: "add",
    label: label || "Add",
    icon: DocumentAdd,
    onClick,
  }),

  navigate: (onClick: () => void, label?: string): ActionItem => ({
    id: "navigate",
    label: label || "Go to",
    icon: ArrowRight,
    onClick,
  }),
};
