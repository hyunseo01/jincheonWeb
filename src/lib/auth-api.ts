import { client } from './api-client';
import { Group, Team, User } from '@/types/auth';

// 공통 응답 구조
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
}

// --- [Auth & User Create/Update API] ---

// 1. 회원가입 (POST /auth/register)
export async function createUser(data: Partial<User>): Promise<void> {
  await client('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      password: data.password || '1234',
      name: data.name,
      role: data.role,
      // 빈 문자열("")이면 undefined로 변환 -> JSON 키 생략됨 -> 백엔드 Validation 통과
      teamId: data.teamId || undefined,
      mobilePhone: data.mobilePhone || undefined,
      officePhone: data.officePhone || undefined,
    }),
  });
}

// 2. 관리자용 유저 수정 (PATCH /auth/:id)
export async function updateUserByAdmin(
  id: string,
  data: Partial<User>
): Promise<void> {
  await client(`/auth/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: data.name,
      role: data.role,
      email: data.email,
      password: data.password || undefined,
      teamId: data.teamId || undefined,
      mobilePhone: data.mobilePhone || undefined,
      officePhone: data.officePhone || undefined,
    }),
  });
}

// 3. 내 정보 수정 (PATCH /auth/profile)
export async function updateProfile(data: Partial<User>): Promise<User> {
  const res = await client<ApiResponse<User>>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify({
      name: data.name,
      password: data.password || undefined,
      mobilePhone: data.mobilePhone || undefined,
      officePhone: data.officePhone || undefined,
    }),
  });
  return res.data;
}

// 4. 로그인 (POST /auth/login)
export async function loginApi(email: string, pw: string): Promise<User> {
  const res = await client<ApiResponse<User>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: pw }),
  });

  const u = res.data;
  if (!u) throw new Error('사용자 정보가 없습니다.');

  return {
    ...u,
    teamId: u.team?.id,
    teamName: u.team?.name,
    groupId: u.team?.group?.id,
    groupName: u.team?.group?.name,
  };
}

// 5. 로그아웃 (POST /auth/logout)
export async function logoutApi(): Promise<void> {
  await client('/auth/logout', { method: 'POST' });
}

// 6. 내 정보 조회 (GET /auth/me)
export async function getMe(): Promise<User | null> {
  try {
    const res = await client<ApiResponse<User>>('/auth/me');
    const u = res.data;
    return {
      ...u,
      teamId: u.team?.id,
      teamName: u.team?.name,
      groupId: u.team?.group?.id,
      groupName: u.team?.group?.name,
    };
  } catch (e) {
    return null;
  }
}

// --- [Group API] ---

export async function getAllGroups(): Promise<Group[]> {
  const res = await client<ApiResponse<Group[]>>('/groups');
  return res.data;
}

export async function createGroup(name: string): Promise<void> {
  await client('/groups', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function updateGroup(id: string, name: string): Promise<void> {
  await client(`/groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function deleteGroup(id: string): Promise<void> {
  await client(`/groups/${id}`, { method: 'DELETE' });
}

// --- [Team API] ---

export async function getAllTeams(): Promise<Team[]> {
  const res = await client<ApiResponse<Team[]>>('/teams');
  const teams = res.data;
  return teams.map((t) => ({
    ...t,
    groupId: t.group?.id || '',
  }));
}

export async function createTeam(name: string, groupId: string): Promise<void> {
  await client('/teams', {
    method: 'POST',
    body: JSON.stringify({ name, groupId }),
  });
}

export async function updateTeam(id: string, name: string): Promise<void> {
  await client(`/teams/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function deleteTeam(id: string): Promise<void> {
  await client(`/teams/${id}`, { method: 'DELETE' });
}
