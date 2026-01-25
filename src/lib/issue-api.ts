// lib/issue-api.ts
import { client } from './api-client';
import { IssueDetailDTO, IssueDTO } from '@/types/issue';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

function formatTimeAgo(isoString: string | Date): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export async function getIssues(): Promise<IssueDTO[]> {
  const res = await client<ApiResponse<any[]>>('/issues');

  return res.data.map((item: any) => ({
    id: item.id,
    title: item.title,
    preview:
      item.content.substring(0, 50) + (item.content.length > 50 ? '...' : ''),
    author: item.authorName,
    authorId: item.authorId, // 추가

    createdAt: formatTimeAgo(item.createdAt),
    timestamp: new Date(item.createdAt).getTime(),

    bumpedAt: item.bumpedAt ? formatTimeAgo(item.bumpedAt) : undefined,
    status: item.status,
    mentions: item.mentions || [],
    priority: item.priorityText
      ? { text: item.priorityText, color: item.priorityColor }
      : undefined,
    tags: (item.tags || []).map((t: any) => ({ text: t.text, color: t.color })),
  }));
}

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
      description: item.content,

      author: item.authorName,
      authorId: item.authorId, // 추가

      createdAt: formatTimeAgo(item.createdAt),
      timestamp: new Date(item.createdAt).getTime(),

      bumpedAt: item.bumpedAt ? formatTimeAgo(item.bumpedAt) : undefined,
      status: item.status,
      mentions: item.mentions || [],
      priority: item.priorityText
        ? { text: item.priorityText, color: item.priorityColor }
        : undefined,
      tags: (item.tags || []).map((t: any) => ({
        text: t.text,
        color: t.color,
      })),
      timeline: (item.timelines || []).map((t: any) => ({
        id: t.id,
        author: t.authorName,
        content: t.content,
        createdAt: formatTimeAgo(t.createdAt),
        type: t.type,
      })),
    };
  } catch {
    return null;
  }
}

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

export async function createComment(
  id: string | number,
  content: string
): Promise<void> {
  await client(`/issues/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function toggleIssueStatus(id: string | number): Promise<void> {
  await client(`/issues/${id}/status`, { method: 'PATCH' });
}

export async function bumpIssue(id: string | number): Promise<void> {
  await client(`/issues/${id}/bump`, { method: 'PATCH' });
}

// 삭제 추가
export async function deleteIssue(id: string | number): Promise<void> {
  await client(`/issues/${id}`, { method: 'DELETE' });
}
