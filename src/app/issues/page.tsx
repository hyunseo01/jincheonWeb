'use client';

import { useEffect, useState } from 'react';
import IssueCard from '@/components/features/issue/IssueCard';
import IssueListItem from '@/components/features/issue/IssueListItem';
import IssueDetailModal from '@/components/features/issue/IssueDetailModal';
import NewIssueModal from '@/components/features/issue/NewIssueModal';
import { IssueDTO } from '@/types/issue';
import { cn } from '@/lib/utils';
import { FaList, FaThLarge } from 'react-icons/fa';
import { getIssues } from '@/lib/issue-api';

type LayoutMode = 'default' | 'separated';
type FilterType = '최신' | '긴급' | '중요' | '데일리' | '입출고' | '배차';

export default function IssuesPage() {
  const [issues, setIssues] = useState<IssueDTO[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('최신');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('default');

  const [selectedIssueId, setSelectedIssueId] = useState<
    string | number | null
  >(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // 데이터 로드 함수
  const fetchData = async () => {
    try {
      const data = await getIssues();
      setIssues(data);
    } catch (e) {
      console.error('이슈 목록 로딩 실패:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    if (activeFilter === '최신') return true;
    return issue.priority?.text === activeFilter;
  });

  const doneIssues = filteredIssues.filter((issue) => issue.status === 'DONE');
  const inProgressIssues = filteredIssues.filter(
    (issue) => issue.status === 'IN_PROGRESS'
  );
  const dailyActiveIssues = inProgressIssues.filter(
    (issue) => issue.priority?.text === '데일리'
  );
  const normalActiveIssues = inProgressIssues.filter(
    (issue) => issue.priority?.text !== '데일리'
  );

  const handleCardClick = (id: string | number) => setSelectedIssueId(id);
  const handleCloseDetailModal = () => setSelectedIssueId(null);

  const getFilterBtnStyle = (filterName: FilterType) => {
    const isActive = activeFilter === filterName;
    return cn(
      'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
      isActive
        ? 'bg-gray-700 text-white'
        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
    );
  };

  return (
    <div className="relative flex h-full flex-col overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-6 flex flex-shrink-0 items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#37352f]">
            이슈 및 인수인계
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            팀원들과 공유해야 할 특이사항입니다.
          </p>
        </div>
        <button
          onClick={() => setIsWriteModalOpen(true)}
          className="flex-shrink-0 rounded-md bg-[#2eaadc] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#2589b0]"
        >
          + 새 이슈 작성
        </button>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-shrink-0 items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex flex-wrap gap-2">
          {(
            ['최신', '긴급', '중요', '데일리', '입출고', '배차'] as FilterType[]
          ).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={getFilterBtnStyle(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex flex-shrink-0 gap-1 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setLayoutMode('default')}
            className={cn(
              'flex items-center justify-center rounded-md p-2 transition-all',
              layoutMode === 'default'
                ? 'bg-white text-[#2eaadc] shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            )}
            title="기본 뷰"
          >
            <FaThLarge size={16} />
          </button>
          <button
            onClick={() => setLayoutMode('separated')}
            className={cn(
              'flex items-center justify-center rounded-md p-2 transition-all',
              layoutMode === 'separated'
                ? 'bg-white text-[#2eaadc] shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            )}
            title="구분 뷰"
          >
            <FaList size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredIssues.length === 0 && (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">
            해당 카테고리의 이슈가 없습니다.
          </div>
        )}

        {layoutMode === 'default' && (
          <div className="grid grid-cols-1 gap-5 pb-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => handleCardClick(issue.id)}
                className="cursor-pointer"
              >
                <IssueCard data={issue} />
              </div>
            ))}
          </div>
        )}

        {layoutMode === 'separated' && (
          <div className="flex flex-col gap-10 pb-10">
            {/* 데일리 섹션 */}
            {dailyActiveIssues.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-purple-500"></span>
                  데일리 업무
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    {dailyActiveIssues.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {dailyActiveIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => handleCardClick(issue.id)}
                      className="cursor-pointer"
                    >
                      <IssueCard data={issue} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 일반 진행중 섹션 */}
            {normalActiveIssues.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                  진행 중
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    {normalActiveIssues.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {normalActiveIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => handleCardClick(issue.id)}
                      className="cursor-pointer"
                    >
                      <IssueCard data={issue} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 완료 섹션 */}
            {doneIssues.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                  완료됨
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    {doneIssues.length}
                  </span>
                </h2>
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  {doneIssues.map((issue) => (
                    <div
                      key={issue.id}
                      onClick={() => handleCardClick(issue.id)}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                    >
                      <IssueListItem data={issue} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {selectedIssueId !== null && (
        <IssueDetailModal
          issueId={selectedIssueId as any}
          onClose={handleCloseDetailModal}
          onUpdate={fetchData} // [추가] 모달 작업 후 리스트 갱신 함수 전달
        />
      )}
      {isWriteModalOpen && (
        <NewIssueModal
          onClose={() => setIsWriteModalOpen(false)}
          onSuccess={() => {
            fetchData(); // [중요] 생성 성공 시 리스트 갱신
          }}
        />
      )}
    </div>
  );
}
