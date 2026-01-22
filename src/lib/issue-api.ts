import { client } from './api-client';
import { IssueDetailDTO, IssueDTO } from '@/types/issue';

// 백엔드 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// 시간 포맷팅 헬퍼 (ISO -> "방금 전", "1시간 전")
function formatTimeAgo(isoString: string | Date): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000; // 초 단위

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

// [GET] 목록 조회
export async function getIssues(): Promise<IssueDTO[]> {
  const res = await client<ApiResponse<any[]>>('/issues');

  return res.data.map((item: any) => ({
    id: item.id, // UUID지만 프론트 타입이 number라면 타입 수정 필요. 일단 any로 처리
    title: item.title,
    preview:
      item.content.substring(0, 50) + (item.content.length > 50 ? '...' : ''),
    author: item.authorName,
    createdAt: formatTimeAgo(item.createdAt),
    timestamp: new Date(item.createdAt).getTime(),
    bumpedAt: item.bumpedAt ? formatTimeAgo(item.bumpedAt) : undefined,
    status: item.status,
    mentions: item.mentions || [],
    priority: item.priorityText
      ? { text: item.priorityText, color: item.priorityColor }
      : undefined,
    tags: item.tags.map((t: any) => ({ text: t.text, color: t.color })),
  }));
}

// [GET] 상세 조회
export async function getIssueDetail(
  id: string | number
): Promise<IssueDetailDTO | null> {
  try {
    const res = await client<ApiResponse<any>>(`/issues/${id}`);
    const item = res.data;

    return {
      id: item.id,
      title: item.title,
      preview: item.content.substring(0, 50),
      description: item.content, // 상세 내용
      author: item.authorName,
      createdAt: formatTimeAgo(item.createdAt),
      timestamp: new Date(item.createdAt).getTime(),
      bumpedAt: item.bumpedAt ? formatTimeAgo(item.bumpedAt) : undefined,
      status: item.status,
      mentions: item.mentions || [],
      priority: item.priorityText
        ? { text: item.priorityText, color: item.priorityColor }
        : undefined,
      tags: item.tags.map((t: any) => ({ text: t.text, color: t.color })),
      timeline: item.timelines.map((t: any) => ({
        id: t.id,
        author: t.authorName,
        content: t.content,
        createdAt: formatTimeAgo(t.createdAt),
        type: t.type,
      })),
    };
  } catch (e) {
    return null;
  }
}

// [POST] 이슈 생성
export async function createIssue(data: {
  title: string;
  description: string;
  categories: string[];
}): Promise<void> {
  await client('/issues', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// [POST] 댓글 작성
export async function createComment(
  id: string | number,
  content: string
): Promise<void> {
  await client(`/issues/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// [PATCH] 상태 변경 (완료 <-> 진행중)
export async function toggleIssueStatus(id: string | number): Promise<void> {
  await client(`/issues/${id}/status`, { method: 'PATCH' });
}

// [PATCH] 끌올 (Bump)
export async function bumpIssue(id: string | number): Promise<void> {
  await client(`/issues/${id}/bump`, { method: 'PATCH' });
}
