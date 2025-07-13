import dotenv from "dotenv";
dotenv.config();

const ADOBE_API_URL = process.env.ADOBE_COMMERCE_API_URL;
const ADOBE_API_TOKEN = process.env.ADOBE_COMMERCE_API_TOKEN;

if (!ADOBE_API_URL || !ADOBE_API_TOKEN) {
  throw new Error("Missing Adobe Commerce API URL or Token in environment variables");
}

export async function adobeApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const url = `${ADOBE_API_URL}${endpoint}`;
  const headers = {
    "Authorization": `Bearer ${ADOBE_API_TOKEN}`,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(`Adobe Commerce API error: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error calling Adobe Commerce API:", error);
    return null;
  }
} 