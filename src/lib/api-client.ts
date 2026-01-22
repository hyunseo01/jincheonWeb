const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3050';

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

export async function client<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  // [디버깅용 로그 추가] 배포 후 브라우저 콘솔(F12)에 이 로그가 떠야 성공입니다.
  console.log(`📡 API 요청: ${path}, credentials 설정 확인: include`);

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // [중요] 여기가 핵심입니다.
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
