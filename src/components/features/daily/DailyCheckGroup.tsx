'use client';

import { useEffect, useMemo, useState } from 'react';
import { DailyGroup, DailyGroupConfig, DailyRow } from '@/types/daily';
import { cn } from '@/lib/utils';
import { FaCheck, FaCog, FaLock, FaPlus, FaTimes, FaTrash, } from 'react-icons/fa';
import DailyGroupConfigurator from './DailyGroupConfigurator';
import { createDailyRow, deleteDailyRow, updateDailyGroup, updateDailyRow, } from '@/lib/daily-api';

interface Props {
  group: DailyGroup;
  onUpdate: (updatedGroup: DailyGroup) => void;
  onDelete: (groupId: string) => void;
}

export default function DailyCheckGroup({ group, onUpdate, onDelete }: Props) {
  const { config } = group;
  const [isEditing, setIsEditing] = useState(!group.title);

  // [추가] 편집 중 draft (입력 즉시 UI 반영 + 저장은 완료 버튼에서만)
  const [draft, setDraft] = useState<DailyGroup>(group);

  // 그룹이 바뀌면 draft도 동기화 (다른 그룹 렌더링/새로고침 대응)
  useEffect(() => {
    setDraft(group);
  }, [group.id]);

  const activeColumns = useMemo(() => {
    const safeConfig = (draft.config || {}) as DailyGroupConfig;

    const cols = [
      { key: 't1', label: safeConfig.t1_label, type: 'text' },
      { key: 't2', label: safeConfig.t2_label, type: 'text' },
      { key: 't3', label: safeConfig.t3_label, type: 'text' },
      { key: 't4', label: safeConfig.t4_label, type: 'text' },
      { key: 'b1', label: safeConfig.b1_label, type: 'bool' },
      { key: 'b2', label: safeConfig.b2_label, type: 'bool' },
    ] as const;

    return cols.filter((c) => !!c.label);
  }, [draft.config]);

  // 1. 텍스트 변경 (State만 변경, Blur 시 저장)
  const handleTextChange = (
    rowId: string,
    key: keyof DailyRow,
    value: string
  ) => {
    const updatedRows = draft.rows.map((row) =>
      row.id === rowId ? { ...row, [key]: value } : row
    );
    const next = { ...draft, rows: updatedRows };
    setDraft(next);
    onUpdate(next);
  };

  // 2. 텍스트 저장 (Blur 시점 API 호출)
  const handleTextBlur = async (
    rowId: string,
    key: keyof DailyRow,
    value: string
  ) => {
    const row = draft.rows.find((r) => r.id === rowId);
    if (!row) return;
    await updateDailyRow({ ...row, [key]: value });
  };

  // 3. 토글 (Bool / Locked) - API 즉시 호출 (여긴 입력이 아니라 클릭이므로 즉시 저장 OK)
  const toggleBool = async (rowId: string, key: string) => {
    const rowToUpdate = draft.rows.find((r) => r.id === rowId);
    if (!rowToUpdate) return;

    let updatedRow = { ...rowToUpdate };

    if (isEditing) {
      const isDisabled = updatedRow.disabledCells?.includes(key);
      let newDisabledCells = updatedRow.disabledCells || [];
      if (isDisabled)
        newDisabledCells = newDisabledCells.filter((k) => k !== key);
      else newDisabledCells = [...newDisabledCells, key];
      updatedRow.disabledCells = newDisabledCells;
    } else {
      if (updatedRow.disabledCells?.includes(key)) return;

      const current = updatedRow[key as keyof DailyRow] as boolean | null;
      let next: boolean | null = null;
      if (current === null) next = true;
      else if (current === true) next = false;
      else next = null;

      updatedRow = { ...updatedRow, [key]: next };
    }

    const updatedRows = draft.rows.map((r) =>
      r.id === rowId ? updatedRow : r
    );
    const nextGroup = { ...draft, rows: updatedRows };
    setDraft(nextGroup);
    onUpdate(nextGroup);

    await updateDailyRow(updatedRow);
  };

  // 4. 행 추가
  const handleAddRow = async () => {
    const newRow = await createDailyRow(draft.id);
    const next = { ...draft, rows: [...draft.rows, newRow] };
    setDraft(next);
    onUpdate(next);
  };

  // 5. 행 삭제
  const handleDeleteRow = async (rowId: string) => {
    await deleteDailyRow(rowId);
    const next = { ...draft, rows: draft.rows.filter((r) => r.id !== rowId) };
    setDraft(next);
    onUpdate(next);
  };

  // 6. 그룹 스킵 토글 (여긴 클릭이므로 즉시 저장 OK)
  const toggleGroupSkip = async () => {
    const next = { ...draft, isSkipped: !draft.isSkipped };
    setDraft(next);
    onUpdate(next);
    await updateDailyGroup(next);
  };

  // 7. 설정/제목 업데이트: 입력 즉시 UI 반영만 (API 호출 X)
  const handleUpdateConfig = (newConfig: DailyGroupConfig) => {
    const next = { ...draft, config: newConfig };
    setDraft(next);
    onUpdate(next);
  };

  const handleUpdateTitle = (newTitle: string) => {
    const next = { ...draft, title: newTitle };
    setDraft(next);
    onUpdate(next);
  };

  // [추가] 설정 완료: 여기서만 저장 (PATCH 1번)
  const handleSaveSettings = async () => {
    try {
      await updateDailyGroup(draft);
      setIsEditing(false);
    } catch (e) {
      alert('저장 실패');
    }
  };

  // --- 렌더링 함수에서 group 대신 draft 사용 ---
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
        {draft.rows.map((row) => (
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
        draft.isSkipped
          ? 'border-gray-200 bg-gray-50 opacity-70'
          : 'border-gray-200'
      )}
    >
      <div className="flex items-center justify-between rounded-t-xl border-b border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <h3
            className={cn(
              'text-lg font-bold whitespace-nowrap text-gray-800',
              draft.isSkipped && 'text-gray-400 line-through'
            )}
          >
            {draft.title || '새 그룹'}
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
            draft.isSkipped
              ? 'border-gray-300 bg-gray-200 text-gray-500'
              : 'border-transparent text-gray-300 hover:bg-gray-100'
          )}
        >
          {draft.isSkipped ? '업무 없음' : 'N/A'}
        </button>
      </div>

      {isEditing ? (
        <div className="flex min-w-[300px] flex-1 flex-col p-4">
          <DailyGroupConfigurator
            group={draft}
            onUpdateConfig={handleUpdateConfig}
            onUpdateTitle={handleUpdateTitle}
          />

          <div className="mt-4 mb-2 rounded bg-blue-50 p-2 text-xs text-blue-600">
            팁: 버튼을 클릭하면 잠금(사용 안 함) 처리됩니다. 행 이름도 여기서
            미리 입력하세요.
          </div>

          <div className="mb-4 overflow-x-auto rounded border border-gray-200 bg-white opacity-90">
            {renderTableBody()}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              onClick={() => onDelete(draft.id)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-600"
            >
              <FaTrash /> 그룹 삭제
            </button>

            {/* [변경] 여기서만 서버 저장 */}
            <button
              onClick={handleSaveSettings}
              className="rounded bg-[#2eaadc] px-4 py-2 text-xs font-bold text-white hover:bg-[#2589b0]"
            >
              설정 완료
            </button>
          </div>
        </div>
      ) : !draft.isSkipped ? (
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
