import { client } from './api-client';
import { Group, Team, User } from '@/types/auth';

// 공통 응답 구조 (TransformInterceptor 기준)
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
}

// 로그인 응답 (백엔드 /auth/login 리턴값)
type LoginResponse = {
  accessToken: string;
  user: User;
};

// 토큰 저장 키 (원하면 이름 바꿔도 됨)
const ACCESS_TOKEN_KEY = 'accessToken';

// 토큰 저장/삭제 유틸
function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function clearAccessToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// user 데이터 UI 호환 가공
function normalizeUser(u: User): User {
  return {
    ...u,
    teamId: u.team?.id,
    teamName: u.team?.name,
    groupId: u.team?.group?.id,
    groupName: u.team?.group?.name,
  };
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

  return normalizeUser(res.data);
}

// 4. 로그인 (POST /auth/login)
// - 서버는 { accessToken, user }를 리턴
// - 토큰은 localStorage에 저장
export async function loginApi(email: string, pw: string): Promise<User> {
  const res = await client<ApiResponse<LoginResponse>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: pw }),
  });

  const payload = res.data;
  if (!payload?.accessToken || !payload?.user) {
    throw new Error('로그인 응답이 올바르지 않습니다.');
  }

  setAccessToken(payload.accessToken);
  return normalizeUser(payload.user);
}

// 5. 로그아웃 (POST /auth/logout)
// - 서버에 호출은 선택이지만(지금은 사실상 의미 거의 없음) 유지
// - 중요한 건 토큰 삭제
export async function logoutApi(): Promise<void> {
  try {
    await client('/auth/logout', { method: 'POST' });
  } finally {
    clearAccessToken();
  }
}

// 6. 내 정보 조회 (GET /auth/me)
// - 토큰 없거나 만료면 null
export async function getMe(): Promise<User | null> {
  try {
    const res = await client<ApiResponse<User>>('/auth/me');
    return normalizeUser(res.data);
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
