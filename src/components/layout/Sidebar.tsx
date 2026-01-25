'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FaAddressBook,
  FaBook,
  FaCheckSquare,
  FaCog,
  FaExclamationCircle,
  FaFileAlt,
  FaSignOutAlt,
  FaTable,
  FaTools,
  FaUsers,
} from 'react-icons/fa';
import SidebarItem from './SidebarItem';
import { useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // [디버깅] 내 권한이 제대로 들어오는지 브라우저 콘솔(F12)에서 확인
  useEffect(() => {
    if (user) {
      console.log('Current User Role:', user.role);
    }
  }, [user]);

  if (!user) return null;

  // [수정] 권한 체크 로직
  const userRole = user.role ? user.role.toLowerCase() : '';
  const isAdminOrDev = userRole === 'admin' || userRole === 'developer';
  const isManagerOrAbove = isAdminOrDev || userRole === 'manager';

  // 1. 일반 업무 메뉴
  const generalMenus = [
    { label: '데일리 업무(예정)', href: '/daily-work', icon: FaTable },
    { label: '이슈 / 인수인계', href: '/issues', icon: FaExclamationCircle },
    { label: '데일리 체크', href: '/daily-check', icon: FaCheckSquare },
    { label: '연락처 리스트(예정)', href: '/contacts', icon: FaAddressBook },
    { label: '업무 가이드(예정)', href: '/guide', icon: FaBook },
    { label: '유틸리티(예정)', href: '/utility', icon: FaTools },
    { label: '업무 양식(구현중)', href: '/forms', icon: FaFileAlt },
  ];

  // 2. 관리자 전용 메뉴
  const adminMenus = [
    ...(isManagerOrAbove
      ? [{ label: '팀원 관리', href: '/teams', icon: FaUsers }]
      : []),
    ...(isAdminOrDev
      ? [{ label: '시스템 관리', href: '/admin', icon: FaCog }]
      : []),
  ];

  // [추가] 클릭 시 '미구현' 알림 처리 함수
  const handleDisabledClick = (e) => {
    e.preventDefault(); // 기본 링크 이동 방지
    alert('현재 준비 중인 기능입니다.');
  };

  return (
    <nav className="flex h-screen w-[260px] flex-shrink-0 flex-col bg-[#202020] transition-all">
      {/* [Logo] */}
      <div className="px-6 pt-8 pb-4">
        <Link
          href="/"
          className="block cursor-pointer transition-opacity hover:opacity-80"
        >
          <h1 className="text-xl font-bold tracking-wider text-white">
            ❄️ JINCHEON
          </h1>
          <p className="mt-1 pl-2 text-[11px] tracking-wide text-gray-500">
            Cold Storage Center v1.3.1
          </p>
        </Link>
      </div>

      {/* [Menu Area] */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="flex flex-col gap-1">
          {generalMenus.map((menu) => {
            // [수정] 허용된 메뉴인지 확인 (이슈, 데일리체크만 true)
            const isAllowed =
              menu.href === '/issues' ||
              menu.href === '/daily-check' ||
              menu.href === '/forms';

            return (
              <li key={menu.href}>
                {isAllowed ? (
                  // 허용된 메뉴: 정상적으로 렌더링
                  <SidebarItem
                    label={menu.label}
                    href={menu.href}
                    icon={menu.icon}
                    isActive={pathname === menu.href}
                  />
                ) : (
                  // 비허용 메뉴: href를 '#'으로 바꾸고 클릭 이벤트 가로채기
                  <div onClick={handleDisabledClick}>
                    <SidebarItem
                      label={menu.label}
                      href="#"
                      icon={menu.icon}
                      isActive={false} // 항상 비활성화 상태로 표시
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* 메뉴가 있을 때만 렌더링 */}
        {adminMenus.length > 0 && (
          <div className="mx-4 mt-6 border-t border-[#333] pt-6">
            <p className="mb-2 px-4 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              Management
            </p>
            <ul className="-mx-4 flex flex-col gap-1">
              {adminMenus.map((menu) => (
                <li key={menu.href}>
                  <SidebarItem
                    label={menu.label}
                    href={menu.href}
                    icon={menu.icon}
                    isActive={pathname === menu.href}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* [Profile Footer] */}
      <div className="mt-auto border-t border-[#333] bg-[#1a1a1a] p-4">
        <div className="flex items-center gap-3">
          <Link href="/mypage" className="group flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-600 bg-gray-700 text-gray-300 transition-colors group-hover:border-[#2eaadc]">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold">
                  {(user.name || 'U').charAt(0)}
                </span>
              )}
            </div>
          </Link>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <Link
              href="/mypage"
              className="truncate text-sm font-bold text-white transition-colors hover:text-[#2eaadc]"
            >
              {user.name} 님
            </Link>

            <Link
              href="/teams"
              className="mt-0.5 flex cursor-pointer flex-col truncate text-[11px] leading-tight text-gray-500 transition-colors hover:text-white"
            >
              <span>{user.groupName || '소속없음'}</span>
              <span className="text-gray-400">{user.teamName || ''}</span>
            </Link>
          </div>

          <button
            onClick={logout}
            className="rounded-md p-2 text-gray-500 transition-all hover:bg-[#333] hover:text-red-400"
            title="로그아웃"
          >
            <FaSignOutAlt size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
