const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3050';

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

export async function client<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // [핵심] 쿠키(세션)를 주고받기 위해 필수
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);

    // 응답 파싱
    const data = await response.json();

    if (!response.ok) {
      // 백엔드에서 내려준 에러 메시지가 있으면 그걸 던짐
      throw new Error(data.message || 'API Error');
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Error [${path}]:`, error);
    throw error;
  }
}
