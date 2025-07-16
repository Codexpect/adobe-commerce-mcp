export interface ApiResponse<T> {
  success: boolean;
  endpoint: string;
  data?: T;
  error?: string;
}

export function apiErrorResponse<T>(endpoint: string, error: unknown): ApiResponse<T> {
  let errorMessage = "Unknown error";
  let responseBody: unknown = undefined;

  if (typeof error === "object" && error !== null) {
    // Axios errors have a response property
    if (
      "response" in error &&
      typeof (error as { response?: unknown }).response === "object" &&
      (error as { response?: unknown }).response !== null
    ) {
      const response = (error as { response: unknown }).response;
      if (
        typeof response === "object" &&
        response !== null &&
        "data" in response
      ) {
        responseBody = (response as { data?: unknown }).data;
      }
    }
    // Try to get a message
    if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
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
    error: errorMessage + (responseBody ? ` | Response body: ${JSON.stringify(responseBody)}` : ""),
  };
}

export function apiSuccessResponse<T>(endpoint: string, data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    endpoint,
  };
}
