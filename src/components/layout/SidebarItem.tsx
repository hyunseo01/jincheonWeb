'use client';

import Link from 'next/link';
import { IconType } from 'react-icons';
import { cn } from '@/lib/utils'; // 아까 만든 유틸 (스타일 합치기용)

// 1. Props 타입 정의 (부모한테 받을 데이터 명세서)
interface SidebarItemProps {
  label: string; // 메뉴 이름 (예: "데일리 업무")
  href: string; // 이동할 주소 (예: "/daily-work")
  icon: IconType; // 아이콘 컴포넌트
  isActive?: boolean; // 현재 선택된 메뉴인지 여부
}

// 2. 컴포넌트 구현
export default function SidebarItem({
  label,
  href,
  icon: Icon,
  isActive,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        // 기본 스타일: 회색 글씨, 투명 테두리, 호버시 살짝 밝아짐
        'flex cursor-pointer items-center gap-3 border-l-4 border-transparent px-6 py-3 text-sm text-[#9ca3af] transition-all hover:bg-[#333] hover:text-white',

        // 활성화(isActive) 되었을 때 스타일: 흰색 글씨, 파란 테두리, 배경색
        isActive && 'border-l-[#2eaadc] bg-[#333] font-semibold text-white'
      )}
    >
      {/* 아이콘 표시 */}
      <Icon className="w-5 text-center" />
      {/* 글자 표시 */}
      <span>{label}</span>
    </Link>
  );
}
