'use client';

import { useEffect, useState } from 'react';
import { DailyGroup } from '@/types/daily';
import DailyCheckGroup from '@/components/features/daily/DailyCheckGroup';
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
// [New] API Import
import {
  createDailyGroup,
  deleteDailyGroup,
  getDailyChecks,
} from '@/lib/daily-api';

export default function DailyCheckPage() {
  const [groups, setGroups] = useState<DailyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // [중요] 한국 시간 기준 날짜 초기화 (서버와 싱크를 맞추기 위해 YYYY-MM-DD 스트링 사용)
  // 클라이언트 로컬 시간이 아니라, 초기 로딩 시 서버 시간을 받아오거나
  // 간단하게는 로컬에서 날짜 포맷만 맞춰서 보내면 서버가 해당 날짜로 조회함.
  const [currentDate, setCurrentDate] = useState(() => {
    // KST 변환 (브라우저가 어디에 있든 한국시간으로 계산)
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const kstGap = 9 * 60 * 60 * 1000;
    const todayKst = new Date(utc + kstGap);
    return todayKst.toISOString().split('T')[0];
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // [API] 실제 데이터 조회
      const data = await getDailyChecks(currentDate);
      setGroups(data);
    } catch (e) {
      console.error(e);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // 날짜 이동
  const handleDateChange = (days: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  // 그룹 업데이트 (자식 컴포넌트에서 호출 시 로컬 state 즉시 반영 - Optimistic UI)
  const handleGroupUpdate = (updatedGroup: DailyGroup) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    );
  };

  // 그룹 추가
  const handleAddGroup = async () => {
    try {
      const newGroup = await createDailyGroup(currentDate);
      setGroups([...groups, newGroup]);
    } catch (e) {
      alert('그룹 생성 실패');
    }
  };

  // 그룹 삭제
  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('정말로 이 그룹을 삭제하시겠습니까?')) {
      try {
        await deleteDailyGroup(groupId);
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
      } catch (e) {
        alert('삭제 실패');
      }
    }
  };

  // 진행률 계산
  const calculateProgress = () => {
    let totalChecks = 0;
    let checkedCount = 0;
    groups.forEach((group) => {
      if (group.isSkipped) return;
      const { config, rows } = group;
      // config가 null일 경우 대비
      if (!config) return;

      const activeBools: ('b1' | 'b2')[] = [];
      if (config.b1_label) activeBools.push('b1');
      if (config.b2_label) activeBools.push('b2');
      if (activeBools.length === 0) return;

      rows.forEach((row) => {
        activeBools.forEach((key) => {
          if (row.disabledCells?.includes(key)) return;
          if (row[key] !== null) {
            totalChecks++;
            if (row[key] === true) checkedCount++;
          }
        });
      });
    });
    if (totalChecks === 0) return 0;
    return Math.round((checkedCount / totalChecks) * 100);
  };
  const progress = calculateProgress();

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Header Area */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#37352f]">데일리 체크</h1>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-600 shadow-sm">
              <button
                onClick={() => handleDateChange(-1)}
                className="p-1 hover:text-[#2eaadc]"
              >
                <FaChevronLeft />
              </button>
              <div className="mx-2 flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                <span>{currentDate}</span>
              </div>
              <button
                onClick={() => handleDateChange(1)}
                className="p-1 hover:text-[#2eaadc]"
              >
                <FaChevronRight />
              </button>
            </div>
            <p className="text-sm text-gray-500">루틴 업무 관리</p>
          </div>
        </div>

        {/* Progress Card */}
        <div className="flex items-center gap-6 rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm">
          <div>
            <div className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Today's Progress
            </div>
            <div className="text-2xl font-bold text-[#2eaadc]">{progress}%</div>
          </div>
          <div className="relative h-12 w-12">
            <svg className="h-full w-full -rotate-90 transform">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#f3f4f6"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#2eaadc"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * progress) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-gray-400">데이터 로딩 중...</div>
      ) : (
        /* Cards Layout */
        <div className="flex flex-wrap items-start gap-6 pb-20">
          {groups.map((group) => (
            <div
              key={group.id}
              className={cn(
                'w-full max-w-full transition-all duration-300 md:w-fit'
              )}
            >
              <DailyCheckGroup
                group={group}
                onUpdate={handleGroupUpdate}
                onDelete={handleDeleteGroup}
              />
            </div>
          ))}

          <button
            onClick={handleAddGroup}
            className="group flex min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-all hover:border-[#2eaadc] hover:bg-blue-50 hover:text-[#2eaadc] md:w-[300px]"
          >
            <div className="rounded-full bg-white p-3 shadow-sm transition-transform group-hover:scale-110">
              <FaPlus />
            </div>
            <span className="text-sm font-medium">새 그룹 추가</span>
          </button>
        </div>
      )}
    </div>
  );
}
