'use client';

import { DailyGroup, DailyGroupConfig } from '@/types/daily';
import { cn } from '@/lib/utils';

interface Props {
  group: DailyGroup;
  onUpdateConfig: (newConfig: DailyGroupConfig) => void;
  onUpdateTitle: (newTitle: string) => void;
}

export default function DailyGroupConfigurator({
  group,
  onUpdateConfig,
  onUpdateTitle,
}: Props) {
  const { config } = group;

  const handleConfigChange = (key: keyof DailyGroupConfig, value: string) => {
    onUpdateConfig({ ...config, [key]: value });
  };

  const toggleSlot = (
    labelKey: keyof DailyGroupConfig,
    defaultLabel: string
  ) => {
    const currentLabel = config[labelKey];

    // [수정 1] 단순히 값이 있는지(Truthiness)가 아니라, null/undefined가 아닌지를 확인해야 함
    // 빈 문자열("")인 상태에서 체크박스를 누르면 꺼져야(undefined) 하므로 이 로직이 필요
    const isActive = currentLabel !== undefined && currentLabel !== null;

    const newValue = isActive ? undefined : defaultLabel;
    onUpdateConfig({ ...config, [labelKey]: newValue });
  };

  return (
    <div className="animate-fade-in-down space-y-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      {/* 1. 그룹 이름 */}
      <div>
        <label className="mb-1 block text-xs font-bold text-gray-500 uppercase">
          그룹 이름
        </label>
        <input
          type="text"
          value={group.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          className="w-full border-b-2 border-gray-300 bg-transparent py-1 text-lg font-bold focus:border-[#2eaadc] focus:outline-none"
          placeholder="그룹명 입력"
        />
      </div>

      {/* 2. 컬럼 설정 */}
      <div>
        <label className="mb-3 block text-xs font-bold text-gray-500 uppercase">
          사용할 열 선택 및 이름
        </label>

        <div className="space-y-4">
          {/* T1~T4 */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-400">
              텍스트 입력 (기본 정보)
            </div>
            {['t1', 't2', 't3', 't4'].map((slot, idx) => {
              const labelKey = `${slot}_label` as keyof DailyGroupConfig;

              // [수정 2] 빈 문자열("")도 활성화된 상태로 간주 (!! 연산자 제거)
              const isActive =
                config[labelKey] !== undefined && config[labelKey] !== null;

              return (
                <div key={slot} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleSlot(labelKey, `항목 ${idx + 1}`)}
                    className="h-4 w-4 cursor-pointer accent-[#2eaadc]"
                  />
                  <input
                    type="text"
                    // 값이 undefined일 때 빈 문자열로 처리
                    value={config[labelKey] ?? ''}
                    onChange={(e) =>
                      handleConfigChange(labelKey, e.target.value)
                    }
                    disabled={!isActive}
                    placeholder={`${slot.toUpperCase()} 열 이름`}
                    className={cn(
                      'flex-1 rounded border px-2 py-1.5 text-sm transition-colors focus:border-[#2eaadc] focus:outline-none',
                      isActive
                        ? 'border-gray-300 bg-white'
                        : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                    )}
                  />
                </div>
              );
            })}
          </div>

          <hr className="border-gray-200" />

          {/* B1~B2 */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-400">확인 버튼</div>
            {['b1', 'b2'].map((slot, idx) => {
              const labelKey = `${slot}_label` as keyof DailyGroupConfig;

              // [수정 3] 여기도 동일하게 수정 (빈 문자열 허용)
              const isActive =
                config[labelKey] !== undefined && config[labelKey] !== null;

              return (
                <div key={slot} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleSlot(labelKey, `확인 ${idx + 1}`)}
                    className="h-4 w-4 cursor-pointer accent-[#2eaadc]"
                  />
                  <input
                    type="text"
                    value={config[labelKey] ?? ''}
                    onChange={(e) =>
                      handleConfigChange(labelKey, e.target.value)
                    }
                    disabled={!isActive}
                    placeholder={`${slot.toUpperCase()} 열 이름`}
                    className={cn(
                      'flex-1 rounded border px-2 py-1.5 text-sm transition-colors focus:border-[#2eaadc] focus:outline-none',
                      isActive
                        ? 'border-gray-300 bg-white'
                        : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
