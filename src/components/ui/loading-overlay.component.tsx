/**
 * Loading Overlay Component
 * Provides consistent loading states with optional messages
 */

import React from "react";
import { InlineLoading, Loading } from "@carbon/react";
import { useTranslation } from "react-i18next";
import styles from "./loading-overlay.component.scss";

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  description?: string;
  type?: "inline" | "fullscreen" | "overlay";
  size?: "sm" | "md" | "lg";
}

/**
 * Reusable loading overlay component
 * Displays loading state with consistent styling
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message,
  description,
  type = "inline",
  size = "md",
}) => {
  const { t } = useTranslation();

  if (!isLoading) return null;

  const loadingMessage = message || t("loading", "Loading...");
  const loadingDescription = description || t("pleaseWait", "Please wait...");

  if (type === "fullscreen") {
    return (
      <div
        className={`loading-overlay loading-overlay--fullscreen ${styles.fullscreen}`}
      >
        <Loading
          active={true}
          withOverlay={true}
          description={loadingMessage}
        />
        <p className={styles.description}>{loadingDescription}</p>
      </div>
    );
  }

  if (type === "overlay") {
    return (
      <div
        className={`loading-overlay loading-overlay--overlay ${styles.overlay}`}
      >
        <div className={styles.content}>
          <Loading active={true} small={size === "sm"} withOverlay={false} />
          <p className={styles.message}>{loadingMessage}</p>
          {description && (
            <p className={styles.description}>{loadingDescription}</p>
          )}
        </div>
      </div>
    );
  }

  // Default inline loading
  return (
    <div className={`loading-overlay loading-overlay--inline ${styles.inline}`}>
      <InlineLoading
        className={styles.inlineLoading}
        status={loadingMessage}
        description={description}
        iconDescription={loadingDescription}
      />
    </div>
  );
};

/**
 * Simple loading spinner for small components
 */
export const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({
  size = "md",
}) => {
  return <Loading active={true} small={size === "sm"} withOverlay={false} />;
};
