/**
 * Type definition for API error responses from the backend
 */
export interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
    status?: number;
  };
  message?: string;
}

/**
 * Type guard to check if an error is an API error
 */
export function isApiError(error: unknown): error is ApiErrorResponse {
  return typeof error === "object" && error !== null && "response" in error;
}

/**
 * Extract error message from an unknown error
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (isApiError(error)) {
    return error.response?.data?.detail || fallbackMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}
