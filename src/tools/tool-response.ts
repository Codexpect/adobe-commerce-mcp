import type { ApiResponse } from "../adobe/types/api-response";

export function toolTextResponse<T>(
  response: ApiResponse<T>,
  successText: string | ((resp: ApiResponse<T>) => string)
): { content: { type: "text"; text: string }[] } {
  if (!response.success) {
    return {
      content: [
        {
          type: "text" as const,
          text: `
            Failed to retrieve data from Adobe Commerce.
            Endpoint: ${response.endpoint}
            Error: ${response.error}
           `,
        },
      ],
    };
  }

  const text = typeof successText === "function" ? successText(response) : successText;
  return {
    content: [
      {
        type: "text" as const,
        text,
      },
    ],
  };
}
