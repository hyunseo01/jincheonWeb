import { loadingEnd, loadingStart } from './loading-bus';

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3050';

export async function client<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  loadingStart();
  try {
    const url = `${BASE_URL}${path}`;
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'API Error');
    return data as T;
  } finally {
    loadingEnd();
  }
}
