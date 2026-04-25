/**
 * Testing Utilities
 * Provides reusable testing helpers and mock functions
 */

import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";

// Create a simple i18n instance for testing
import i18next from "i18next";

const i18n = i18next.createInstance({
  lng: "en",
  resources: {
    en: {
      translation: {
        "loading": "Loading",
        "success": "Success",
        "error": "Error",
        "operation": "Operation",
      },
    },
  },
});

/**
 * Custom render function that includes providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  mockComponentContext?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = "/",
    mockComponentContext = {},
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Wrapper with all necessary providers
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </BrowserRouter>
    );
  };

  return {
    ...render(ui, { wrapper: AllTheProviders, ...renderOptions }),
  };
}

/**
 * Mock data generators
 */
export const mockData = {
  patient: {
    uuid: "patient-uuid-123",
    display: "John Doe",
    identifiers: [
      {
        uuid: "id-1",
        identifier: "12345",
        identifierType: {
          uuid: "type-1",
          display: "Patient ID",
        },
        preferred: true,
      },
    ],
    person: {
      uuid: "person-1",
      display: "John Doe",
      gender: "M",
      age: 35,
      birthDate: "1989-01-01",
    },
  },

  laboratoryOrder: {
    uuid: "order-uuid-123",
    orderNumber: "ORD-2025-001",
    accessionNumber: "ACC-2025-001",
    patient: {
      uuid: "patient-uuid-123",
      display: "John Doe",
    },
    concept: {
      uuid: "concept-uuid-123",
      display: "Malaria Test",
      datatype: {
        display: "Coded",
        uuid: "datatype-uuid-123",
      },
      set: false,
      answers: [
        { uuid: "answer-1", display: "Positive" },
        { uuid: "answer-2", display: "Negative" },
      ],
    },
    encounter: {
      uuid: "encounter-uuid-123",
      encounterDatetime: "2025-04-25T10:00:00Z",
    },
    orderer: {
      uuid: "provider-uuid-123",
      display: "Dr. Smith",
    },
    careSetting: {
      uuid: "caresetting-uuid-123",
      display: "Outpatient",
    },
    action: "NEW",
    fulfillerStatus: "IN_PROGRESS",
    dateActivated: "2025-04-25T10:00:00Z",
    status: "IN_PROGRESS",
  },

  panelConcept: {
    uuid: "panel-uuid-123",
    display: "Complete Blood Count",
    datatype: {
      display: "Numeric",
      uuid: "datatype-numeric",
    },
    set: true,
    setMembers: [
      {
        uuid: "member-1",
        display: "Hemoglobin",
        datatype: { display: "Numeric" },
        hiNormal: 17,
        lowNormal: 12,
        hiAbsolute: 20,
        lowAbsolute: 8,
        units: "g/dL",
      },
      {
        uuid: "member-2",
        display: "WBC Count",
        datatype: { display: "Numeric" },
        hiNormal: 11,
        lowNormal: 4,
        hiAbsolute: 15,
        lowAbsolute: 2,
        units: "x10^9/L",
      },
    ],
  },

  observation: {
    uuid: "obs-uuid-123",
    concept: {
      uuid: "concept-uuid-123",
      display: "Malaria Test",
    },
    value: { uuid: "answer-1", display: "Positive" },
    status: "FINAL",
    obsDatetime: "2025-04-25T11:00:00Z",
  },

  workListItem: {
    uuid: "worklist-uuid-123",
    orderNumber: "ORD-2025-001",
    accessionNumber: "ACC-2025-001",
    patient: {
      uuid: "patient-uuid-123",
      display: "John Doe",
      identifiers: [
        {
          identifier: "12345",
          identifierType: { display: "Patient ID" },
        },
      ],
    },
    concept: {
      uuid: "concept-uuid-123",
      display: "Malaria Test",
    },
    encounter: { uuid: "encounter-uuid-123" },
    orderer: { display: "Dr. Smith" },
    careSetting: { display: "Outpatient" },
    fulfillerStatus: "IN_PROGRESS",
    dateActivated: "2025-04-25T10:00:00Z",
    action: "NEW",
  },
};

/**
 * Mock functions for common operations
 */
export const mockFunctions = {
  // Mock successful API response
  createMockSuccessResponse: (data: any) => ({
    ok: true,
    data,
    status: 200,
  }),

  // Mock error response
  createMockErrorResponse: (message: string, status: number = 400) => ({
    ok: false,
    status,
    data: {
      error: {
        message,
        fieldErrors: {},
      },
    },
  }),

  // Mock SWR response
  createMockSWRResponse: (data: any, error?: Error) => ({
    data,
    error,
    isValidating: false,
    mutate: jest.fn(),
  }),

  // Mock form values
  createMockFormValues: (values: Record<string, any>) => values,
};

/**
 * Custom matchers for testing
 */
export const customMatchers = {
  // Check if element has valid status
  toHaveValidStatus(received: string) {
    const validStatuses = ["COMPLETED", "IN_PROGRESS", "PENDING", "CANCELLED"];
    const pass = validStatuses.includes(received);
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid status`
          : `Expected ${received} to be a valid status (one of: ${validStatuses.join(", ")})`,
    };
  },

  // Check if value is within range
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be within range ${min}-${max}`
          : `Expected ${received} to be within range ${min}-${max}`,
    };
  },
};

/**
 * Wait for async operations
 */
export const waitForAsync = {
  // Wait for component to update
  waitForUpdate: async (ms: number = 0) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  },

  // Wait for loading to complete
  waitForLoadingToComplete: async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  // Wait for mock API calls
  waitForMockApi: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  },
};

/**
 * Test environment setup
 */
export const setupTestEnvironment = () => {
  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };

  // Mock window.matchMedia for responsive tests
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Run setup automatically
setupTestEnvironment();
