export class ApiError extends Error {
  status?: number;
  isNotFound?: boolean;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNotFound = status === 404;
  }
}

/**
 * Robust fetch wrapper that prevents "Unexpected end of JSON input" and 404 HTML fallback crashes.
 * Accurately surfaces AI server status and actionable guidance.
 */
export async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, options);
  } catch (err: any) {
    throw new ApiError(
      'The AI server was not found (HTTP 404). This app needs its Node server running ("npm start"); static-only hosting cannot run the AI features.',
      404
    );
  }

  // Handle explicit 404 status
  if (response.status === 404) {
    throw new ApiError(
      'The AI server was not found (HTTP 404). This app needs its Node server running ("npm start"); static-only hosting cannot run the AI features.',
      404
    );
  }

  let text = '';
  try {
    text = await response.text();
  } catch (readErr: any) {
    throw new ApiError(`Failed to read server response: ${readErr?.message || 'Connection lost'}`);
  }

  // Prevent "Unexpected end of JSON input" when response body is empty
  if (!text || text.trim().length === 0) {
    throw new ApiError(
      `Server returned an empty response (HTTP ${response.status}). Ensure the backend server is active and reachable.`,
      response.status
    );
  }

  // Detect HTML responses (such as Vite fallback serving index.html for missing routes)
  const trimmed = text.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.includes('<title>')) {
    throw new ApiError(
      'The AI server was not found (HTTP 404). This app needs its Node server running ("npm start"); static-only hosting cannot run the AI features.',
      404
    );
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ApiError(
      `Failed to parse server response: expected JSON but received "${trimmed.slice(0, 100)}..."`,
      response.status
    );
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with HTTP status ${response.status}`;
    throw new ApiError(errorMsg, response.status);
  }

  return data as T;
}
