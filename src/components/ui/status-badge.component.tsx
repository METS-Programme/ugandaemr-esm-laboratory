/**
 * Status Badge Component
 * Provides consistent status display with automatic color coding
 */

import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./status-badge.component.scss";

export type StatusType =
  | "COMPLETED"
  | "IN_PROGRESS"
  | "PENDING"
  | "CANCELLED"
  | "REJECTED"
  | "FAILED"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "INFO"
  | "NEW"
  | "RECEIVED"
  | "EXPIRED";

export interface StatusBadgeProps {
  status: StatusType | string;
  translationKey?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Default status colors mapping
 */
const STATUS_COLORS: Record<StatusType, string> = {
  COMPLETED: "#4CAF50",
  IN_PROGRESS: "#FF9800",
  PENDING: "#2196F3",
  CANCELLED: "#9E9E9E",
  REJECTED: "#F44336",
  FAILED: "#F44336",
  SUCCESS: "#4CAF50",
  WARNING: "#FF9800",
  ERROR: "#F44336",
  INFO: "#2196F3",
  NEW: "#9C27B0",
  RECEIVED: "#4CAF50",
  EXPIRED: "#9E9E9E",
};

/**
 * Reusable status badge component
 * Displays status with automatic color coding and translations
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  translationKey,
  className = "",
  size = "md",
}) => {
  const { t } = useTranslation();

  // Get status color (default to gray for unknown statuses)
  const getStatusColor = (status: string): string => {
    const upperStatus = status.toUpperCase() as StatusType;
    return STATUS_COLORS[upperStatus] || "#757575";
  };

  // Get status display text
  const getStatusText = (status: string): string => {
    if (translationKey) {
      return t(`${translationKey}.${status}`, status);
    }
    return t(`status.${status.toLowerCase()}`, status);
  };

  const badgeColor = getStatusColor(status);
  const badgeText = getStatusText(status);

  return (
    <span
      className={`status-badge status-badge--${size} ${className}`}
      style={{
        backgroundColor: badgeColor,
        color: "white",
      }}
    >
      {badgeText}
    </span>
  );
};

/**
 * Hook for getting status color that can be used independently
 */
export function useStatusColor() {
  const getStatusColor = (status: string): string => {
    const upperStatus = status.toUpperCase() as StatusType;
    return STATUS_COLORS[upperStatus] || "#757575";
  };

  return { getStatusColor };
}
