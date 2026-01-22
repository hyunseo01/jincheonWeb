// [BadgeColor]: 서버가 내려줄 수 있는 색상 리스트 (프론트 디자인 시스템에 맞춤)
export type BadgeColor =
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'gray';

// [1. 상태]: 진행중 vs 완료 (UI 전체 스타일 결정)
export type IssueStatus = 'IN_PROGRESS' | 'DONE';

export interface UserDTO {
  id: string;
  name: string;
  team: string; // "전산팀", "물류팀"
  avatar?: string;
}

export interface IssueDTO {
  id: string;
  title: string;
  preview: string;
  author: string;
  createdAt: string; // 생성일 ("1시간 전")
  timestamp: number; // [NEW] 정렬을 위한 실제 타임스탬프 (ms)

  // [NEW] 끌올 기능
  bumpedAt?: string; // 끌올된 시간 (없으면 null/undefined)

  // [NEW] 멘션된 사용자 목록 (로그인한 유저가 여기 포함되면 카드 테두리 파랗게)
  mentions?: string[];

  status: IssueStatus;
  priority?: {
    text: string;
    color: BadgeColor;
  };
  tags: {
    text: string;
    color: BadgeColor;
  }[];
}

// 상세 DTO
export interface IssueDetailDTO extends IssueDTO {
  description: string;
  timeline: TimelineItem[];
}

export interface TimelineItem {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  type: 'COMMENT' | 'STATUS_CHANGE';
}
