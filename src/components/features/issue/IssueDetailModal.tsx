'use client';

import { useEffect, useRef, useState } from 'react';
import { IssueDetailDTO } from '@/types/issue';
import {
  bumpIssue,
  createComment,
  deleteIssue,
  getIssueDetail,
  toggleIssueStatus,
} from '@/lib/issue-api';
import { getAllUsers } from '@/lib/user-api';
import { User } from '@/types/auth';

import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  FaArrowUp,
  FaCheck,
  FaPaperPlane,
  FaTimes,
  FaTrash,
  FaUndo,
  FaUserCircle,
} from 'react-icons/fa';

interface IssueDetailModalProps {
  issueId: string | number;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function IssueDetailModal({
  issueId,
  onClose,
  onUpdate,
}: IssueDetailModalProps) {
  const { user } = useAuth();

  const [data, setData] = useState<IssueDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [usersList, setUsersList] = useState<User[]>([]);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const timelineEndRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      if (!data) setIsLoading(true);

      const [detailData, usersData] = await Promise.all([
        getIssueDetail(issueId),
        getAllUsers(),
      ]);

      setData(detailData);
      setUsersList(usersData);
    } catch (e) {
      console.error('Failed to load issue detail:', e);
      alert('데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId]);

  useEffect(() => {
    if (data?.timeline) {
      setTimeout(() => {
        timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [data?.timeline]);

  const renderContentWithMentions = (content: string) => {
    return content.split(/(\s+)/).map((word, index) => {
      if (word.startsWith('@') && word.length > 1) {
        return (
          <span
            key={index}
            className="mx-0.5 rounded bg-blue-50 px-1 font-bold text-blue-600"
          >
            {word}
          </span>
        );
      }
      return word;
    });
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewComment(val);

    const cursorIndex = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorIndex);
    const lastWordMatch = textBeforeCursor.match(/@(\S*)$/);

    if (lastWordMatch) {
      setMentionQuery(lastWordMatch[1]);
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }
  };

  const handleSelectUser = (userName: string) => {
    const cursorIndex = commentInputRef.current?.selectionStart || 0;
    const textBeforeCursor = newComment.slice(0, cursorIndex);
    const textAfterCursor = newComment.slice(cursorIndex);

    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    const newTextBefore =
      textBeforeCursor.slice(0, lastAtPos) + `@${userName} `;

    setNewComment(newTextBefore + textAfterCursor);
    setShowMentionList(false);
    commentInputRef.current?.focus();
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.includes(mentionQuery) ||
      (u.teamName && u.teamName.includes(mentionQuery))
  );

  const handleBumpIssue = async () => {
    if (!data) return;
    try {
      await bumpIssue(issueId);
      await fetchData();
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
      alert('끌올 실패');
    }
  };

  const handleToggleStatus = async () => {
    if (!data) return;
    try {
      await toggleIssueStatus(issueId);
      await fetchData();
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
      alert('상태 변경 실패');
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !data) return;
    try {
      await createComment(issueId, newComment);
      setNewComment('');
      setShowMentionList(false);
      await fetchData();
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
      alert('댓글 등록 실패');
    }
  };

  // 삭제 권한 계산
  const canDelete = (() => {
    if (!user || !data) return false;
    const isAdminOrDev = user.role === 'admin' || user.role === 'developer';
    const isOwner = !!data.authorId && data.authorId === user.id;
    return isAdminOrDev || isOwner;
  })();

  const handleDeleteIssue = async () => {
    if (!data) return;
    const ok = confirm('이 이슈를 완전히 삭제할까요? (복구 불가)');
    if (!ok) return;

    try {
      await deleteIssue(issueId);
      if (onUpdate) onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
      alert('삭제 실패');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="animate-pulse rounded-lg bg-white p-5">로딩 중...</div>
      </div>
    );
  }

  const isDone = data.status === 'DONE';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-black/40 transition-opacity"
      onClick={onClose}
    >
      <div
        className="animate-slide-in-right flex h-full w-full max-w-[80%] flex-col overflow-y-auto bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm">
          <div className="flex-1 pr-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge color={isDone ? 'green' : 'blue'}>
                {isDone ? '완료됨' : '진행중'}
              </Badge>
              {data.bumpedAt && (
                <span className="flex items-center gap-1 rounded-[4px] border border-blue-100 bg-blue-50 px-[6px] py-[2px] text-[11px] font-bold text-[#2eaadc]">
                  <FaArrowUp size={9} /> 끌올됨 ({data.bumpedAt})
                </span>
              )}
              {data.priority && (
                <Badge color={data.priority.color}>{data.priority.text}</Badge>
              )}
              {data.tags.map((tag, i) => (
                <Badge key={i} color={tag.color}>
                  {tag.text}
                </Badge>
              ))}
            </div>
            <h2
              className={cn(
                'text-xl leading-tight font-bold text-gray-800 transition-all',
                isDone && 'text-gray-400 line-through'
              )}
            >
              {data.title}
            </h2>
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FaUserCircle /> {data.author}
              </span>
              <span>·</span>
              <span>{data.createdAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isDone && (
              <button
                onClick={handleBumpIssue}
                className="flex items-center gap-2 rounded-md bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-600 transition-colors hover:bg-orange-100"
                title="이슈를 리스트 최상단으로 올립니다"
              >
                <FaArrowUp size={12} /> 끌올
              </button>
            )}

            <button
              onClick={handleToggleStatus}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-bold transition-colors',
                isDone
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              )}
            >
              {isDone ? (
                <>
                  <FaUndo size={12} /> 다시 진행
                </>
              ) : (
                <>
                  <FaCheck size={12} /> 해결 완료
                </>
              )}
            </button>

            {/* 삭제 버튼 */}
            {canDelete && (
              <button
                onClick={handleDeleteIssue}
                className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-1.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                title="잘못 작성된 이슈를 완전히 삭제합니다"
              >
                <FaTrash size={12} /> 삭제
              </button>
            )}

            <button
              onClick={onClose}
              className="ml-2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-gray-100 px-6 py-6">
            <h3 className="mb-3 text-sm font-bold text-gray-700">이슈 내용</h3>
            <p className="leading-relaxed whitespace-pre-wrap text-gray-600">
              {renderContentWithMentions(data.description)}
            </p>
          </div>

          <div className="min-h-[400px] bg-gray-50 px-6 py-6">
            <h3 className="mb-4 text-sm font-bold text-gray-700">
              타임라인 ({data.timeline.length})
            </h3>

            <div className="relative flex flex-col gap-6 pb-4 pl-4">
              <div className="absolute top-2 bottom-2 left-[11px] w-[2px] bg-gray-200"></div>
              {data.timeline.map((item) => (
                <div
                  key={item.id}
                  className="animate-fade-in-up relative z-10 flex gap-4"
                >
                  <div className="z-10 flex-shrink-0 rounded-full border-2 border-white bg-white shadow-sm">
                    <FaUserCircle
                      className={cn(
                        'text-3xl',
                        item.type === 'STATUS_CHANGE'
                          ? 'text-gray-300'
                          : 'text-gray-400'
                      )}
                    />
                  </div>

                  <div
                    className={cn(
                      'flex-1 rounded-lg border p-3 text-sm shadow-sm',
                      item.type === 'STATUS_CHANGE'
                        ? 'flex items-center border-transparent bg-gray-100 py-2 text-gray-500 italic'
                        : 'border-gray-200 bg-white'
                    )}
                  >
                    {item.type !== 'STATUS_CHANGE' && (
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-semibold text-gray-700">
                          {item.author}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.createdAt}
                        </span>
                      </div>
                    )}
                    <div
                      className={cn(
                        'whitespace-pre-wrap text-gray-600',
                        item.type === 'STATUS_CHANGE' && 'ml-2'
                      )}
                    >
                      {item.type === 'STATUS_CHANGE' && (
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gray-400"></span>
                      )}
                      {renderContentWithMentions(item.content)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={timelineEndRef} />
            </div>
          </div>
        </div>

        {/* Footer Input */}
        <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-white p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 pt-1">
              <FaUserCircle className="text-3xl text-gray-300" />
            </div>
            <div className="relative flex-1">
              <textarea
                ref={commentInputRef}
                value={newComment}
                onChange={handleCommentChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !showMentionList) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
                placeholder="댓글을 입력하세요... (@로 멘션 가능)"
                className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 py-3 pr-12 pl-3 text-sm transition-colors focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#2eaadc] focus:outline-none"
                rows={1}
                style={{ minHeight: '46px', maxHeight: '120px' }}
              />

              {showMentionList && filteredUsers.length > 0 && (
                <div className="animate-fade-in-up absolute bottom-full left-0 z-50 mb-2 w-60 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500">
                    팀원 선택
                  </div>
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u.name)}
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-blue-50 hover:text-blue-600"
                    >
                      <span className="font-bold">{u.name}</span>
                      <span className="text-xs text-gray-400">
                        {u.teamName}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="absolute top-1.5 right-2 p-2 text-[#2eaadc] transition-colors hover:text-[#2589b0] disabled:text-gray-300"
                title="등록"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
