'use client';

import { useState } from 'react';
import { FormItem } from '@/types/forms';
import { cn } from '@/lib/utils';
import { downloadFormFile } from '@/lib/forms-api';

interface Props {
  item: FormItem;
}

export default function FormCard({ item }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // 파일 타입별 뱃지 스타일 (첫번째 사진 참고: 회색 배경 + 진한 텍스트)
  const getFileBadge = (type: string) => {
    const baseStyle =
      'flex h-8 w-12 items-center justify-center rounded bg-gray-100 text-[11px] font-bold tracking-wide';
    switch (type) {
      case 'XLSX':
        return <div className={cn(baseStyle, 'text-blue-600')}>XLSX</div>;
      case 'PDF':
        return <div className={cn(baseStyle, 'text-red-500')}>PDF</div>;
      case 'DOCX':
        return <div className={cn(baseStyle, 'text-blue-500')}>DOCX</div>;
      default:
        return <div className={cn(baseStyle, 'text-gray-500')}>FILE</div>;
    }
  };

  const handleDownload = async (e: React.MouseEvent, historyId?: string) => {
    e.stopPropagation();
    const targetVersion = historyId
      ? item.history.find((h) => h.id === historyId)?.date
      : item.latestDate;

    if (
      confirm(`${item.title} (${targetVersion} 버전)을 다운로드 하시겠습니까?`)
    ) {
      await downloadFormFile(item.id, historyId);
    }
  };

  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-white transition-all',
        isOpen
          ? 'border-[#2eaadc] shadow-md ring-1 ring-[#2eaadc]/10'
          : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow'
      )}
    >
      {/* 1. 메인 카드 영역 */}
      <div className="flex items-center gap-4 p-5">
        {/* 파일 타입 뱃지 */}
        <div className="shrink-0">{getFileBadge(item.type)}</div>

        {/* 파일 정보 */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="mb-1.5 truncate text-[15px] leading-tight font-bold text-gray-800">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <span className="flex items-center gap-1">
              📅 {item.latestDate}
            </span>
            <span className="h-2 w-[1px] bg-gray-300"></span>
            <span className="flex items-center gap-1">
              👤 {item.latestUser}
            </span>
          </div>
        </div>

        {/* 최신본 다운로드 버튼 (검정 배경) */}
        <button
          onClick={(e) => handleDownload(e)}
          className="z-10 shrink-0 rounded font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: '#222',
            color: '#ffffff',
            padding: '10px',
            paddingBottom: '10px',
            fontSize: '11px',
            lineHeight: '1',
            minWidth: 'fit-content',
            display: 'block',
          }}
        >
          다운로드
        </button>
      </div>

      {/* 2. 상세 히스토리 패널 (디자인 수정됨) */}
      {isOpen && (
        <div className="animate-fade-in-down border-t border-gray-100 bg-[#f9f9f9] p-2 px-5">
          <div className="pg-grey flex flex-col">
            {item.history.map((hist, idx) => (
              <div
                key={hist.id}
                className={cn(
                  'flex items-center justify-between py-3', // 상하 간격 적절하게 조정
                  idx !== item.history.length - 1 &&
                    'border-b border-dashed border-gray-200' // 점선 구분선
                )}
              >
                {/* 왼쪽: 화살표 + 수정 내역 */}
                <div className="mr-4 flex flex-1 items-center gap-3 overflow-hidden">
                  <span className="shrink-0 text-[10px] text-gray-300">└</span>
                  <span className="truncate text-[13px] font-medium text-gray-600">
                    {hist.note}
                  </span>
                </div>

                {/* 오른쪽: 날짜 | 작성자 | 버튼 */}
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-[11px] tracking-tight text-gray-400">
                    {hist.date.slice(2)}{' '}
                    <span className="mx-0.5 text-gray-300">|</span>{' '}
                    {hist.user.split(' ')[0]}
                  </span>

                  <button
                    onClick={(e) => handleDownload(e, hist.id)}
                    className="rounded border border-gray-200 bg-white p-3 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-black"
                  >
                    받기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
