const BASE_URL = 'https://jsonplaceholder.typicode.com';

export class ApiError extends Error {
  constructor(status, statusText) {
    super(statusText || 'Erro na requisição');
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

export async function requisicao(endpoint, options = {}) {
  const { headers: extraHeaders = {}, signal, body, ...restOptions } = options;

  const config = {
    ...restOptions,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(extraHeaders || {}),
    },
  };

  if (body !== undefined && body !== null) {
    if (typeof body === 'string' || body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  try {
    const resp = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!resp.ok) {
      throw new ApiError(resp.status, resp.statusText);
    }

    const contentType = resp.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await resp.text();
      if (text === '') {
        return null;
      }
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    }

    const text = await resp.text();
    if (text === '') {
      return null;
    }
    return text;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw err;
  }
}

export function apiGet(endpoint, options = {}) {
  const { headers, signal, ...rest } = options || {};
  return requisicao(endpoint, {
    ...rest,
    method: 'GET',
    headers,
    signal,
  });
}

export function apiPost(endpoint, body, options = {}) {
  const { headers, signal, ...rest } = options || {};
  return requisicao(endpoint, {
    ...rest,
    method: 'POST',
    body,
    headers,
    signal,
  });
}

export function apiPut(endpoint, body, options = {}) {
  const { headers, signal, ...rest } = options || {};
  return requisicao(endpoint, {
    ...rest,
    method: 'PUT',
    body,
    headers,
    signal,
  });
}

export function apiPatch(endpoint, body, options = {}) {
  const { headers, signal, ...rest } = options || {};
  return requisicao(endpoint, {
    ...rest,
    method: 'PATCH',
    body,
    headers,
    signal,
  });
}

export function apiDelete(endpoint, options = {}) {
  const { headers, signal, ...rest } = options || {};
  return requisicao(endpoint, {
    ...rest,
    method: 'DELETE',
    headers,
    signal,
  });
}

export default {
  BASE_URL,
  ApiError,
  requisicao,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
};
