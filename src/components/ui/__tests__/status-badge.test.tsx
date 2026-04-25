/**
 * Tests for StatusBadge component
 * Tests status display, color coding, and translations
 */

import React from "react";
import { render, screen, renderHook } from "@testing-library/react";
import { StatusBadge, useStatusColor } from "../status-badge.component";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";

// Create a simple i18n instance for testing
const i18n = i18next.createInstance({
  lng: "en",
  resources: {
    en: {
      translation: {
        "COMPLETED": "completed",
        "IN_PROGRESS": "in progress",
        "PENDING": "pending",
        "CANCELLED": "cancelled",
      },
    },
  },
});

// Wrapper with i18n provider
const renderWithI18n = (component: React.ReactElement) => {
  return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
};

describe("StatusBadge Component", () => {
  describe("rendering", () => {
    it("should render status badge with correct text", () => {
      renderWithI18n(<StatusBadge status="COMPLETED" />);
      expect(screen.getByText("completed")).toBeInTheDocument();
    });

    it("should render custom status when not in predefined list", () => {
      renderWithI18n(<StatusBadge status="CUSTOM_STATUS" />);
      expect(screen.getByText("CUSTOM_STATUS")).toBeInTheDocument();
    });

    it("should apply correct styling classes", () => {
      const { container } = renderWithI18n(<StatusBadge status="IN_PROGRESS" size="sm" />);
      const badge = container.querySelector(".status-badge");
      expect(badge).toHaveClass("status-badge--sm");
    });
  });

  describe("color coding", () => {
    it("should apply green color for COMPLETED status", () => {
      const { container } = renderWithI18n(<StatusBadge status="COMPLETED" />);
      const badge = container.querySelector(".status-badge");
      expect(badge).toHaveStyle({ backgroundColor: "#4CAF50" });
    });

    it("should apply orange color for IN_PROGRESS status", () => {
      const { container } = renderWithI18n(<StatusBadge status="IN_PROGRESS" />);
      const badge = container.querySelector(".status-badge");
      expect(badge).toHaveStyle({ backgroundColor: "#FF9800" });
    });

    it("should apply red color for ERROR status", () => {
      const { container } = renderWithI18n(<StatusBadge status="ERROR" />);
      const badge = container.querySelector(".status-badge");
      expect(badge).toHaveStyle({ backgroundColor: "#F44336" });
    });

    it("should apply gray color for unknown status", () => {
      const { container } = renderWithI18n(<StatusBadge status="UNKNOWN" />);
      const badge = container.querySelector(".status-badge");
      expect(badge).toHaveStyle({ backgroundColor: "#757575" });
    });
  });

  describe("size variations", () => {
    it("should render small badge with size='sm'", () => {
      const { container } = renderWithI18n(<StatusBadge status="COMPLETED" size="sm" />);
      const badge = container.querySelector(".status-badge");
      expect(badge).toHaveClass("status-badge--sm");
    });

    it("should render medium badge with size='md'", () => {
      const { container } = renderWithI18n(<StatusBadge status="COMPLETED" size="md" />);
      const badge = container.querySelector(".status-badge");
      expect(badge).toHaveClass("status-badge--md");
    });

    it("should render large badge with size='lg'", () => {
      const { container } = renderWithI18n(<StatusBadge status="COMPLETED" size="lg" />);
      const badge = container.querySelector(".status-badge");
      expect(badge).toHaveClass("status-badge--lg");
    });
  });

  describe("translations", () => {
    it("should use translation key when provided", () => {
      renderWithI18n(<StatusBadge status="COMPLETED" translationKey="orderStatus" />);
      // Assuming translations are set up, this would use the translated version
      expect(screen.getByText("completed")).toBeInTheDocument();
    });

    it("should fallback to status text when translation not found", () => {
      renderWithI18n(<StatusBadge status="RANDOM_STATUS" translationKey="customKey" />);
      expect(screen.getByText("RANDOM_STATUS")).toBeInTheDocument();
    });
  });
});

describe("useStatusColor Hook", () => {
  it("should return correct color for predefined statuses", () => {
    const { result } = renderHook(() => useStatusColor());

    expect(result.current.getStatusColor("COMPLETED")).toBe("#4CAF50");
    expect(result.current.getStatusColor("IN_PROGRESS")).toBe("#FF9800");
    expect(result.current.getStatusColor("PENDING")).toBe("#2196F3");
    expect(result.current.getStatusColor("ERROR")).toBe("#F44336");
  });

  it("should return gray color for unknown statuses", () => {
    const { result } = renderHook(() => useStatusColor());

    expect(result.current.getStatusColor("UNKNOWN_STATUS")).toBe("#757575");
    expect(result.current.getStatusColor("random")).toBe("#757575");
  });

  it("should be case insensitive", () => {
    const { result } = renderHook(() => useStatusColor());

    expect(result.current.getStatusColor("completed")).toBe("#4CAF50");
    expect(result.current.getStatusColor("Completed")).toBe("#4CAF50");
    expect(result.current.getStatusColor("CoMpLeTeD")).toBe("#4CAF50");
  });
});
