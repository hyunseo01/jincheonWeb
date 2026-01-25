import { FormItem } from '@/types/forms';

// [GET] 양식 목록 조회
export async function getForms(): Promise<FormItem[]> {
  // 실제 백엔드 연동 시: const res = await client<FormItem[]>('/forms');
  // 현재는 더미 데이터 반환으로 처리 (나중에 주석 해제하여 사용)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_FORMS_DATA);
    }, 500); // 로딩 시뮬레이션
  });
}

// [DOWNLOAD] 파일 다운로드 (URL이 있다면 window.open, 없다면 alert)
export async function downloadFormFile(
  formId: string,
  historyId?: string
): Promise<void> {
  // const url = `/api/forms/${formId}/download${historyId ? `?historyId=${historyId}` : ''}`;
  // window.location.href = url;
  console.log(
    `Download requesting: Form ${formId}, History ${historyId ?? 'Latest'}`
  );
}

// --- 더미 데이터 (백엔드 연결 전까지 사용) ---
const MOCK_FORMS_DATA: FormItem[] = [
  {
    id: 'f1',
    title: '필요단량 양식',
    type: 'XLSX',
    category: '입출고',
    latestDate: '2026-01-20',
    latestUser: '홍길동',
    history: [
      {
        id: 'h1',
        note: '단량 최신화',
        date: '2026-01-20',
        user: '홍길동',
      },
      {
        id: 'h2',
        note: '단량최신화',
        date: '2025-12-15',
        user: '김철수',
      },
      { id: 'h3', note: '최초 생성', date: '2025-11-01', user: '관리자' },
    ],
  },
  {
    id: 'f2',
    title: '광역 예상지',
    type: 'PDF',
    category: '',
    latestDate: '2026-01-24',
    latestUser: '이영희',
    history: [
      {
        id: 'h4',
        note: '파일 꺠짐 수정',
        date: '2026-01-24',
        user: '이영희',
      },
      { id: 'h5', note: '서식 오타 수정', date: '2026-01-10', user: '이영희' },
    ],
  },
  {
    id: 'f3',
    title: 'CU 검수지',
    type: 'DOCX',
    category: '입출고',
    latestDate: '2026-01-25',
    latestUser: '박지민',
    history: [
      {
        id: 'h6',
        note: '후입단량 추가',
        date: '2026-01-25',
        user: '박지민',
      },
    ],
  },
  {
    id: 'f4',
    title: '기사님 팔랫트 양식',
    type: 'PDF',
    category: '입출고',
    latestDate: '2026-01-15',
    latestUser: '김기사',
    history: [
      {
        id: 'h7',
        note: 'KPP추가',
        date: '2026-01-15',
        user: '김기사',
      },
    ],
  },
];
