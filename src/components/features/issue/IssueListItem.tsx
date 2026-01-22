import { IssueDTO } from '@/types/issue';
import { cn } from '@/lib/utils';
import { FaCheckCircle } from 'react-icons/fa';

interface IssueListItemProps {
  data: IssueDTO;
}

// 완료된 이슈를 간단한 한 줄 리스트로 보여주는 컴포넌트
export default function IssueListItem({ data }: IssueListItemProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 bg-white p-4 text-sm last:border-b-0">
      <div className="flex items-center gap-3">
        {/* 완료 아이콘 */}
        <FaCheckCircle className="flex-shrink-0 text-lg text-green-500" />
        {/* 제목 (취소선 적용) */}
        <span className={cn('font-medium text-gray-500 line-through')}>
          {data.title}
        </span>
      </div>
      {/* 메타 정보 */}
      <div className="ml-4 flex flex-shrink-0 items-center gap-2 text-xs text-gray-400">
        <span>{data.createdAt}</span>
        <span>·</span>
        <span>{data.author}</span>
      </div>
    </div>
  );
}
