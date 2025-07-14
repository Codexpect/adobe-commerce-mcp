export interface ApiResponse<T> {
  success: boolean;
  items: T[];
  endpoint: string;
  error?: string;
}

export function apiErrorResponse<T>(endpoint: string, error: unknown): ApiResponse<T> {
  let errorMessage = "Unknown error";
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      errorMessage = (error as { message: string }).message;
    } else {
      errorMessage = JSON.stringify(error);
    }
  } else {
    errorMessage = String(error);
  }
  return {
    success: false,
    items: [],
    endpoint,
    error: errorMessage,
  };
}

export function apiSuccessResponse<T>(endpoint: string, items: T[]): ApiResponse<T> {
  return {
    success: true,
    items,
    endpoint,
  };
}
