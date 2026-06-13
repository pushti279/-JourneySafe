export class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.cause = cause;
  }
}

export async function getJson(url, { params, signal } = {}) {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') searchParams.set(key, String(value));
    });
  }

  const query = searchParams.toString();
  const requestUrl = query ? `${url}?${query}` : url;

  let response;
  try {
    response = await fetch(requestUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Network error. Check your connection and try again.', {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status}). Please try again.`, {
      status: response.status,
    });
  }

  return response.json();
}

export function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
