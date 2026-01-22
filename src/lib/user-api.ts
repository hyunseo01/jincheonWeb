import { client } from './api-client';
import { User } from '@/types/auth';

// 공통 응답 구조
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
}

// 1. 전체 유저 조회 (GET /users)
export async function getAllUsers(): Promise<User[]> {
  const res = await client<ApiResponse<User[]>>('/users');
  const users = res.data;

  // 데이터 가공 (UI 호환성)
  return users.map((u) => ({
    ...u,
    teamId: u.team?.id || '',
    teamName: u.team?.name || '',
    groupId: u.team?.group?.id || '',
    groupName: u.team?.group?.name || '소속없음',
  }));
}

// 2. 유저 삭제 (DELETE /users/:id)
export async function deleteUser(id: string): Promise<void> {
  await client(`/users/${id}`, { method: 'DELETE' });
}
