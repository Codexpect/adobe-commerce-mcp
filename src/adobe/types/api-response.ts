export interface ApiResponse<T> {
  success: boolean;
  endpoint: string;
  data?: T;
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
    endpoint,
    error: errorMessage,
  };
}

export function apiSuccessResponse<T>(endpoint: string, data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    endpoint,
  };
}
