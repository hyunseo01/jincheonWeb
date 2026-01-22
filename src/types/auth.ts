export type Role = 'developer' | 'admin' | 'manager' | 'staff';

export interface Group {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  groupId: string; // 프론트 편의상 유지
  group?: Group; // 백엔드 관계 데이터
}

export interface User {
  id: string;
  email: string; // [변경] username -> email
  name: string;
  role: Role;
  password?: string;

  mobilePhone?: string; // [추가]
  officePhone?: string; // [추가]

  // 백엔드에서 오는 중첩 데이터
  team?: {
    id: string;
    name: string;
    group: {
      id: string;
      name: string;
    };
  };

  // [UI 호환용] API 호출 후 클라이언트에서 가공해서 채워줄 필드들
  // (기존 UI 코드를 덜 고치기 위해 유지)
  teamId?: string;
  teamName?: string;
  groupId?: string;
  groupName?: string;

  avatar?: string;
}
