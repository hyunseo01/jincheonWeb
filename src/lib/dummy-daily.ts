import { DailyGroup } from '@/types/daily';

export async function getDailyChecks(): Promise<DailyGroup[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: 'g1',
      title: '코스트코 (냉동/냉장)',
      isSkipped: false,
      config: {
        t1_label: '고객사',
        t2_label: '단량명(제품)',
        t4_label: '비고',
        b1_label: '출력',
      },
      rows: [
        {
          id: 'r1',
          t1: 'CJ',
          t2: '사각어묵 1kg',
          t3: '',
          t4: '',
          b1: true,
          b2: null, // 진행 중인 상태 예시
          disabledCells: [],
        },
        {
          id: 'r2',
          t1: '3J',
          t2: '정통어묵탕',
          t3: '',
          t4: '',
          b1: null,
          b2: null, // 아직 안 한 상태 (기본)
          disabledCells: [],
        },
      ],
    },
    {
      id: 'g2',
      title: '홈플러스',
      isSkipped: false,
      config: {
        t1_label: '거래처',
        b1_label: '입고예약',
        b2_label: '납품서 출력',
      },
      rows: [
        {
          id: 'r3',
          t1: '함안 일배',
          t2: '',
          t3: '',
          t4: '',
          b1: true,
          b2: true,
          disabledCells: [],
        },
        {
          id: 'r4',
          t1: '안성 신선',
          t2: '',
          t3: '',
          t4: '',
          b1: true,
          b2: null,
          disabledCells: ['b2'], // 안성은 납품서 출력 안 함 (잠금)
        },
      ],
    },
  ];
}
