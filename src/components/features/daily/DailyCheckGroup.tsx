'use client';

import { useMemo, useState } from 'react';
import { DailyGroup, DailyGroupConfig, DailyRow } from '@/types/daily';
import { cn } from '@/lib/utils';
import {
  FaCheck,
  FaCog,
  FaLock,
  FaPlus,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import DailyGroupConfigurator from './DailyGroupConfigurator';
// [New] API Import
import {
  createDailyRow,
  deleteDailyRow,
  updateDailyGroup,
  updateDailyRow,
} from '@/lib/daily-api';

interface Props {
  group: DailyGroup;
  onUpdate: (updatedGroup: DailyGroup) => void;
  onDelete: (groupId: string) => void;
}

export default function DailyCheckGroup({ group, onUpdate, onDelete }: Props) {
  const { config } = group;
  const [isEditing, setIsEditing] = useState(!group.title);

  const activeColumns = useMemo(() => {
    // config가 undefined일 경우 방어코드
    const safeConfig = config || {};
    const cols = [
      { key: 't1', label: safeConfig.t1_label, type: 'text' },
      { key: 't2', label: safeConfig.t2_label, type: 'text' },
      { key: 't3', label: safeConfig.t3_label, type: 'text' },
      { key: 't4', label: safeConfig.t4_label, type: 'text' },
      { key: 'b1', label: safeConfig.b1_label, type: 'bool' },
      { key: 'b2', label: safeConfig.b2_label, type: 'bool' },
    ] as const;
    return cols.filter((c) => !!c.label);
  }, [config]);

  // 1. 텍스트 변경 (State만 변경, Blur 시 저장)
  const handleTextChange = (
    rowId: string,
    key: keyof DailyRow,
    value: string
  ) => {
    const updatedRows = group.rows.map((row) =>
      row.id === rowId ? { ...row, [key]: value } : row
    );
    onUpdate({ ...group, rows: updatedRows });
  };

  // 2. 텍스트 저장 (Blur 시점 API 호출)
  const handleTextBlur = async (
    rowId: string,
    key: keyof DailyRow,
    value: string
  ) => {
    const row = group.rows.find((r) => r.id === rowId);
    if (row) {
      await updateDailyRow({ ...row, [key]: value });
    }
  };

  // 3. 토글 (Bool / Locked) - API 즉시 호출
  const toggleBool = async (rowId: string, key: string) => {
    const rowToUpdate = group.rows.find((r) => r.id === rowId);
    if (!rowToUpdate) return;

    let updatedRow = { ...rowToUpdate };

    // [A] 수정 모드: 잠금 토글
    if (isEditing) {
      const isDisabled = updatedRow.disabledCells?.includes(key);
      let newDisabledCells = updatedRow.disabledCells || [];
      if (isDisabled) {
        newDisabledCells = newDisabledCells.filter((k) => k !== key);
      } else {
        newDisabledCells = [...newDisabledCells, key];
      }
      updatedRow.disabledCells = newDisabledCells;
    }
    // [B] 일반 모드: 값 토글
    else {
      if (updatedRow.disabledCells?.includes(key)) return;

      const current = updatedRow[key as keyof DailyRow] as boolean | null;
      let next: boolean | null = null;
      // Null -> True(O) -> False(X) -> Null
      if (current === null) next = true;
      else if (current === true) next = false;
      else if (current === false) next = null;

      updatedRow = { ...updatedRow, [key]: next };
    }

    // UI 업데이트
    const updatedRows = group.rows.map((r) =>
      r.id === rowId ? updatedRow : r
    );
    onUpdate({ ...group, rows: updatedRows });

    // API 호출
    await updateDailyRow(updatedRow);
  };

  // 4. 행 추가
  const handleAddRow = async () => {
    try {
      const newRow = await createDailyRow(group.id);
      onUpdate({ ...group, rows: [...group.rows, newRow] });
    } catch (e) {
      console.error(e);
    }
  };

  // 5. 행 삭제
  const handleDeleteRow = async (rowId: string) => {
    try {
      await deleteDailyRow(rowId);
      onUpdate({ ...group, rows: group.rows.filter((r) => r.id !== rowId) });
    } catch (e) {
      console.error(e);
    }
  };

  // 6. 그룹 스킵 토글
  const toggleGroupSkip = async () => {
    const updatedGroup = { ...group, isSkipped: !group.isSkipped };
    onUpdate(updatedGroup);
    await updateDailyGroup(updatedGroup);
  };

  // 7. 설정/제목 업데이트 (UI만, 완료 버튼 누를때 API 호출이 좋지만 여기선 즉시 반영)
  // 편의상 DailyGroupConfigurator에서 완료 시 저장하거나, 개별 변경 시 저장할 수 있음.
  const handleUpdateConfig = async (newConfig: DailyGroupConfig) => {
    const updatedGroup = { ...group, config: newConfig };
    // 여기서는 onUpdate만 하고, 실제 저장은 '설정 완료' 버튼이나 Blur 등에서 처리하는게 좋으나
    // 요청대로 즉시성을 위해 API 호출을 넣겠습니다.
    onUpdate(updatedGroup);
    // Config 필드가 별도 컬럼으로 퍼져있으므로 매핑해서 보내야 함 (daily-api에서 처리됨)
    await updateDailyGroup(updatedGroup);
  };

  const handleUpdateTitle = async (newTitle: string) => {
    const updatedGroup = { ...group, title: newTitle };
    onUpdate(updatedGroup);
    await updateDailyGroup(updatedGroup); // Debounce 처리가 좋지만 일단 직관적으로 구현
  };

  // --- 렌더링 로직 (기존과 동일) ---
  const renderTableBody = () => (
    <table className="w-full table-auto border-collapse text-left text-sm">
      <thead>
        <tr className="bg-gray-50 text-xs tracking-wider uppercase">
          {activeColumns.map((col: any) => (
            <th
              key={col.key}
              className={cn(
                'border-b border-gray-100 py-2 font-bold whitespace-nowrap text-gray-500',
                col.type === 'bool' ? 'px-2 text-center' : 'px-3 text-left',
                col.width ||
                  (col.type === 'bool' ? 'w-[60px]' : 'min-w-[140px]')
              )}
            >
              {col.label}
            </th>
          ))}
          <th className="w-[40px] border-b border-gray-100"></th>
        </tr>
      </thead>
      <tbody>
        {group.rows.map((row) => (
          <tr
            key={row.id}
            className="group/row transition-colors hover:bg-gray-50/50"
          >
            {activeColumns.map((col: any) => {
              const isDisabled = row.disabledCells?.includes(col.key);
              return (
                <td
                  key={col.key}
                  className={cn(
                    'border-b border-gray-50 p-1',
                    col.type === 'bool' && 'text-center'
                  )}
                >
                  {col.type === 'text' ? (
                    <input
                      value={(row[col.key] as string) || ''}
                      onChange={(e) =>
                        handleTextChange(row.id, col.key, e.target.value)
                      }
                      onBlur={(e) =>
                        handleTextBlur(row.id, col.key, e.target.value)
                      }
                      className={cn(
                        'w-full truncate rounded bg-transparent px-2 py-1.5 text-left text-sm transition-all focus:outline-none',
                        'hover:bg-gray-50 focus:bg-white focus:text-clip focus:ring-1 focus:ring-[#2eaadc]'
                      )}
                      placeholder="..."
                    />
                  ) : (
                    <button
                      onClick={() => toggleBool(row.id, col.key)}
                      className={cn(
                        'flex h-[32px] w-full items-center justify-center rounded border text-sm font-bold shadow-sm transition-all',
                        isEditing &&
                          isDisabled &&
                          'border-gray-300 bg-gray-200 text-gray-400',
                        isEditing &&
                          !isDisabled &&
                          'border-gray-200 bg-white text-gray-400 hover:border-blue-400 hover:text-blue-500',
                        !isEditing &&
                          isDisabled &&
                          'cursor-not-allowed border-gray-100 bg-gray-100 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#e5e7eb_5px,#e5e7eb_10px)] opacity-50',
                        !isEditing &&
                          !isDisabled &&
                          row[col.key] === true &&
                          'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100',
                        !isEditing &&
                          !isDisabled &&
                          row[col.key] === false &&
                          'border-red-200 bg-red-50 text-red-500 hover:bg-red-100',
                        !isEditing &&
                          !isDisabled &&
                          row[col.key] === null &&
                          'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'
                      )}
                    >
                      {isEditing ? (
                        isDisabled ? (
                          <FaLock size={12} />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-gray-300" />
                        )
                      ) : (
                        <>
                          {!isDisabled && row[col.key] === true && 'O'}
                          {!isDisabled && row[col.key] === false && <FaTimes />}
                          {!isDisabled && row[col.key] === null && '-'}
                        </>
                      )}
                    </button>
                  )}
                </td>
              );
            })}
            <td className="border-b border-gray-50 text-center">
              <button
                onClick={() => handleDeleteRow(row.id)}
                className="p-2 text-gray-300 opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-red-500"
              >
                <FaTrash size={12} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={100} className="p-0">
            <button
              onClick={handleAddRow}
              className="flex w-full items-center justify-center gap-2 border-t border-gray-100 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-blue-50 hover:text-[#2eaadc]"
            >
              <FaPlus size={12} /> 행 추가하기
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-xl border bg-white shadow-sm transition-all',
        group.isSkipped
          ? 'border-gray-200 bg-gray-50 opacity-70'
          : 'border-gray-200'
      )}
    >
      <div className="flex items-center justify-between rounded-t-xl border-b border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <h3
            className={cn(
              'text-lg font-bold whitespace-nowrap text-gray-800',
              group.isSkipped && 'text-gray-400 line-through'
            )}
          >
            {group.title || '새 그룹'}
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              'rounded-full p-1.5 transition-colors',
              isEditing
                ? 'bg-gray-200 text-gray-600'
                : 'text-gray-300 hover:bg-gray-50 hover:text-gray-500'
            )}
          >
            {isEditing ? <FaCheck size={12} /> : <FaCog size={14} />}
          </button>
        </div>
        <button
          onClick={toggleGroupSkip}
          className={cn(
            'ml-2 flex-shrink-0 rounded border px-2 py-1 text-xs font-bold transition-colors',
            group.isSkipped
              ? 'border-gray-300 bg-gray-200 text-gray-500'
              : 'border-transparent text-gray-300 hover:bg-gray-100'
          )}
        >
          {group.isSkipped ? '업무 없음' : 'N/A'}
        </button>
      </div>

      {isEditing ? (
        <div className="flex min-w-[300px] flex-1 flex-col p-4">
          <DailyGroupConfigurator
            group={group}
            onUpdateConfig={handleUpdateConfig}
            onUpdateTitle={handleUpdateTitle}
          />
          <div className="mt-4 mb-2 rounded bg-blue-50 p-2 text-xs text-blue-600">
            💡 팁: 버튼을 클릭하면 <strong>잠금(사용 안 함)</strong> 처리됩니다.
            행 이름도 여기서 미리 입력하세요.
          </div>

          <div className="mb-4 overflow-x-auto rounded border border-gray-200 bg-white opacity-90">
            {renderTableBody()}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              onClick={() => onDelete(group.id)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-600"
            >
              <FaTrash /> 그룹 삭제
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="rounded bg-[#2eaadc] px-4 py-2 text-xs font-bold text-white hover:bg-[#2589b0]"
            >
              설정 완료
            </button>
          </div>
        </div>
      ) : !group.isSkipped ? (
        <div className="flex flex-1 flex-col">
          <div className="w-full overflow-x-auto">{renderTableBody()}</div>
        </div>
      ) : (
        <div className="flex min-w-[200px] flex-1 items-center justify-center p-8 text-sm text-gray-400 italic">
          오늘 예정된 업무가 없습니다.
        </div>
      )}
    </div>
  );
}
