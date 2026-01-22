'use client'; // hooks 사용을 위해 client 선언

import { IssueDTO } from '@/types/issue';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { FaArrowUp, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext'; // [NEW]

interface Props {
  data: IssueDTO;
}

export default function IssueCard({ data }: Props) {
  const { user } = useAuth(); // [NEW] 현재 로그인 유저 정보
  const isDone = data.status === 'DONE';

  // 내가 멘션되었는지 확인 (user가 없으면 false)
  const isMentioned = user && data.mentions?.includes(user.name);

  return (
    <div
      className={cn(
        'relative flex cursor-pointer flex-col gap-3 rounded-lg border border-[#e0e0e0] bg-white p-4 shadow-sm transition-all hover:shadow-md',
        isDone && 'bg-gray-50 opacity-60',
        // 멘션 스타일 적용
        isMentioned &&
          !isDone &&
          'border-blue-200 bg-blue-50/30 ring-2 ring-blue-200'
      )}
    >
      {/* ... (나머지 렌더링 코드는 기존과 동일, 끌올 뱃지 위치 등) ... */}
      <div className="flex flex-wrap items-center gap-2">
        {data.priority && (
          <Badge color={data.priority.color}>{data.priority.text}</Badge>
        )}
        {data.tags.map((tag, index) => (
          <Badge key={index} color={tag.color}>
            {tag.text}
          </Badge>
        ))}
      </div>

      <div>
        <h3
          className={cn(
            'mb-1 text-[15px] font-bold',
            isDone && 'text-gray-500 line-through'
          )}
        >
          {data.title}
        </h3>
        <p className="line-clamp-2 text-sm text-gray-500">
          {/* 멘션 텍스트 하이라이트 */}
          {data.preview.split(' ').map((word, i) =>
            word.startsWith('@') ? (
              <span key={i} className="mr-1 font-medium text-blue-600">
                {word}
              </span>
            ) : (
              word + ' '
            )
          )}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span>{data.createdAt}</span>
          {data.bumpedAt && !isDone && (
            <span
              className="flex items-center gap-0.5 font-bold text-[#2eaadc]"
              title={`최근 끌올: ${data.bumpedAt}`}
            >
              <FaArrowUp size={10} />
              <span>끌올</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <FaUserCircle /> {data.author}
        </div>
      </div>
    </div>
  );
}
