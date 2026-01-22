import { cn } from '@/lib/utils';

// 서버 DTO에서 이 타입 그대로 가져다 쓰면 됩니다.
export type BadgeColor =
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'gray';

interface BadgeProps {
  children: React.ReactNode; // 뱃지 텍스트
  color?: BadgeColor; // 색상 키값 (기본값: gray)
  className?: string; // 추가 스타일 (필요시)
}

export default function Badge({
  children,
  color = 'gray',
  className,
}: BadgeProps) {
  // Notion 스타일의 파스텔 톤 매핑
  const colorStyles: Record<BadgeColor, string> = {
    gray: 'bg-gray-100 text-gray-600', // 기본
    red: 'bg-[#ffe2dd] text-[#d44c47]', // 긴급, 장애, 미출
    yellow: 'bg-[#fdecc8] text-[#cb932d]', // 주의, 중요, 과출
    green: 'bg-[#dbeddb] text-[#448361]', // 완료, 안전, 공지
    blue: 'bg-[#e3f2fd] text-[#1976d2]', // 진행, 배송, 입고
    purple: 'bg-[#f3e5f5] text-[#7b1fa2]', // 데일리, 3PL, 프로세스
  };

  return (
    <span
      className={cn(
        // [기본 모양] 둥근 사각형, 작은 글씨, 줄바꿈 방지
        'inline-flex items-center justify-center rounded-[4px] px-[6px] py-[2px] text-[11px] font-medium whitespace-nowrap',
        // [색상 적용]
        colorStyles[color],
        // [커스텀 클래스 병합]
        className
      )}
    >
      {children}
    </span>
  );
}
