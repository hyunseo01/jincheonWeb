import { client } from './api-client';
import { DailyGroup, DailyRow } from '@/types/daily';

// [Helper] 백엔드(Flat) -> 프론트엔드(Nested Config) 변환 함수
function mapToFrontendGroup(item: any): DailyGroup {
  return {
    id: item.id,
    title: item.title,
    isSkipped: item.isSkipped,
    // 백엔드의 평문 컬럼들을 config 객체로 묶어줌
    config: {
      t1_label: item.t1_label,
      t2_label: item.t2_label,
      t3_label: item.t3_label,
      t4_label: item.t4_label,
      b1_label: item.b1_label,
      b2_label: item.b2_label,
    },
    // rows가 없으면 빈 배열
    rows: Array.isArray(item.rows) ? item.rows : [],
  };
}

// [GET] 날짜별 조회
export async function getDailyChecks(date: string): Promise<DailyGroup[]> {
  const res = await client<any>(`/daily?date=${date}`);

  // [수정 1] 여기가 핵심 에러 원인이었습니다.
  // 빈 배열([])로 두면 TS가 never[]로 인식하므로, any[]라고 명시해줍니다.
  let rawData: any[] = [];

  if (res.data && Array.isArray(res.data)) {
    rawData = res.data;
  } else if (Array.isArray(res)) {
    rawData = res;
  }

  // 받아온 데이터를 프론트엔드 구조로 변환
  return rawData.map(mapToFrontendGroup);
}

// [POST] 그룹 추가
export async function createDailyGroup(date: string): Promise<DailyGroup> {
  const res = await client<any>(`/daily/groups?date=${date}`, {
    method: 'POST',
  });

  // 백엔드 응답(Flat)을 프론트엔드 구조(Nested)로 변환
  const rawData = res.data || res;
  return mapToFrontendGroup(rawData);
}

// [PATCH] 그룹 업데이트 (제목, 설정, 스킵여부 등)
export async function updateDailyGroup(group: DailyGroup): Promise<void> {
  // 프론트엔드(Nested Config) -> 백엔드(Flat) 변환
  // [수정 2] rows를 구조분해할 때, 사용하지 않으면 빌드 에러가 날 수 있습니다.
  // : _rows로 이름을 바꿔서 '사용하지 않음(ignored)' 처리하거나, 제외시킵니다.
  // rest에 rows가 포함되지 않도록 추출만 하고 버립니다.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { config, rows: _rows, id, ...rest } = group;

  const payload = {
    ...rest, // title, isSkipped 등
    ...config, // t1_label, b1_label 등을 최상위로 펼침
  };

  await client(`/daily/groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// [DELETE] 그룹 삭제
export async function deleteDailyGroup(groupId: string): Promise<void> {
  await client(`/daily/groups/${groupId}`, { method: 'DELETE' });
}

// [POST] 행 추가
export async function createDailyRow(groupId: string): Promise<DailyRow> {
  const res = await client<{ success: boolean; data: DailyRow }>(
    `/daily/groups/${groupId}/rows`,
    { method: 'POST' }
  );
  // Row는 구조가 같아서 변환 불필요
  // res.data가 없으면 res 자체가 데이터일 수 있으므로 any 캐스팅으로 방어
  return res.data || (res as any);
}

// [PATCH] 행 업데이트
export async function updateDailyRow(row: DailyRow): Promise<void> {
  const { id, ...rest } = row;
  await client(`/daily/rows/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(rest),
  });
}

// [DELETE] 행 삭제
export async function deleteDailyRow(rowId: string): Promise<void> {
  await client(`/daily/rows/${rowId}`, { method: 'DELETE' });
}
