import { openmrsFetch, restBaseUrl } from "@openmrs/esm-framework";
import { logger } from "../../utils/logger";

export interface EmailPayload {
  patientUuid: string;
  recipientEmail: string;
  subject: string;
  message: string;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
}

/**
 * Sends laboratory results to a patient via email
 * @param payload - Email sending payload containing patient info and email details
 * @returns Promise with success status and message
 */
export async function sendLabResultsByEmail(
  payload: EmailPayload
): Promise<SendEmailResponse> {
  try {
    const response = await openmrsFetch(`${restBaseUrl}/email/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return {
        success: true,
        message: "Results sent successfully",
      };
    } else {
      const errorData = response.data || {};
      return {
        success: false,
        message:
          errorData.message ||
          "Failed to send results. Please try again later.",
      };
    }
  } catch (error) {
    logger.error("Error sending email:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
