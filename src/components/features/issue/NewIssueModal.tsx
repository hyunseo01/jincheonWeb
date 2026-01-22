'use client';

import { useEffect, useRef, useState } from 'react';
import { BadgeColor } from '@/types/issue';
import { User } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers } from '@/lib/user-api';
import { createIssue } from '@/lib/issue-api';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { FaCheck, FaPen, FaPlus, FaTimes } from 'react-icons/fa';

interface NewIssueModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES: { label: string; color: BadgeColor }[] = [
  { label: '긴급', color: 'red' },
  { label: '중요', color: 'yellow' },
  { label: '데일리', color: 'gray' },
  { label: '입출고', color: 'blue' },
  { label: '배차', color: 'purple' },
];

export default function NewIssueModal({
  onClose,
  onSuccess,
}: NewIssueModalProps) {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [customTag, setCustomTag] = useState('');

  // 멘션 관련
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAllUsers();
        setUsersList(data);
      } catch (error) {
        console.error('유저 로딩 실패', error);
      }
    }
    loadUsers();
  }, []);

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  };

  const handleAddCustomTag = () => {
    const val = customTag.trim();
    if (val && !selectedCategories.includes(val)) {
      setSelectedCategories([...selectedCategories, val]);
      setCustomTag('');
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    setDescription(val);
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
    const cursorIndex = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = description.slice(0, cursorIndex);
    const textAfterCursor = description.slice(cursorIndex);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    const newTextBefore =
      textBeforeCursor.slice(0, lastAtPos) + `@${userName} `;
    setDescription(newTextBefore + textAfterCursor);
    setShowMentionList(false);
    textareaRef.current?.focus();
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.includes(mentionQuery) || (u.teamName || '').includes(mentionQuery)
  );

  const handleSubmit = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      selectedCategories.length === 0
    ) {
      alert('제목, 내용, 태그(최소 1개)를 입력해주세요.');
      return;
    }

    try {
      await createIssue({
        title,
        description,
        categories: selectedCategories,
      });
      alert('등록되었습니다.');

      // [수정] 성공 콜백을 닫기 전에 호출하여 데이터 갱신 보장
      if (onSuccess) onSuccess();

      onClose();
    } catch (e) {
      console.error(e);
      alert('등록 실패: 서버 연결을 확인해주세요.');
    }
  };

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
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-8 py-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
            <FaPen className="text-xl text-[#2eaadc]" /> 새 이슈 작성
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="relative flex-1 space-y-8 overflow-y-auto p-8">
          {/* 태그 선택 */}
          <section>
            <label className="mb-3 block text-sm font-bold text-gray-700">
              태그 선택 <span className="text-red-500">*</span>
            </label>

            {/* 프리셋 */}
            <div className="flex flex-wrap gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => toggleCategory(cat.label)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-bold transition-all',
                    selectedCategories.includes(cat.label)
                      ? 'border-[#2eaadc] bg-blue-50 text-[#2eaadc]'
                      : 'border-gray-100 text-gray-500'
                  )}
                >
                  {selectedCategories.includes(cat.label) && <FaCheck />}
                  <Badge color={cat.color}>{cat.label}</Badge>
                </button>
              ))}
            </div>

            {/* 직접 입력 */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                placeholder="직접 입력 (예: 회식)"
                className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2eaadc] focus:ring-1 focus:ring-[#2eaadc]"
              />
              <button
                onClick={handleAddCustomTag}
                className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200"
              >
                <FaPlus size={12} /> 추가
              </button>
            </div>

            {/* 선택된 태그들 */}
            {selectedCategories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 rounded-lg bg-gray-50 p-3">
                <span className="mr-2 self-center text-xs font-bold text-gray-400">
                  선택됨:
                </span>
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm"
                  >
                    {cat}
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="ml-1 rounded-full p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <FaTimes />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* 제목 입력 */}
          <section>
            <label className="mb-3 block text-sm font-bold text-gray-700">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목 입력"
              className="w-full border-b-2 border-gray-200 px-2 py-2 text-lg font-medium focus:border-[#2eaadc] focus:outline-none"
            />
          </section>

          {/* 내용 입력 */}
          <section className="relative flex h-full flex-col">
            <label className="mb-3 block text-sm font-bold text-gray-700">
              내용 <span className="text-red-500">*</span>
            </label>
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={description}
                onChange={handleDescriptionChange}
                placeholder="@를 입력하여 팀원을 언급해보세요."
                className="min-h-[400px] w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-4 leading-relaxed focus:bg-white focus:ring-2 focus:ring-[#2eaadc] focus:outline-none"
              />
              {showMentionList && filteredUsers.length > 0 && (
                <div className="animate-fade-in-up absolute bottom-full left-2 z-50 mb-2 w-60 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-500">
                    팀원 선택
                  </div>
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user.name)}
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-blue-50 hover:text-blue-600"
                    >
                      <span className="font-bold">{user.name}</span>
                      <span className="text-xs text-gray-400">
                        {user.teamName || '소속없음'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 z-20 flex justify-end gap-3 border-t border-gray-200 bg-white p-6">
          <button
            onClick={onClose}
            className="rounded-lg px-6 py-3 font-bold text-gray-500 hover:bg-gray-100"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-lg bg-[#2eaadc] px-8 py-3 font-bold text-white hover:bg-[#2589b0]"
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
