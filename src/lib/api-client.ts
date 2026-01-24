const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3050';

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

export async function client<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // 토큰이 만료/무효면 저장소에서 제거
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    throw new Error((data && data.message) || 'API Error');
  }

  return data as T;
}
