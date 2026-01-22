'use client';

import { useEffect, useState } from 'react';
import { Group, Role, Team, User } from '@/types/auth';
import { FaSave, FaTimes } from 'react-icons/fa';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: User | null;
  groups: Group[];
  teams: Team[];
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  groups,
  teams,
}: Props) {
  // [수정] 상태 구조 변경
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'staff' as Role,
    groupId: '',
    teamId: '',
    mobilePhone: '', // 휴대전화
    officePhone: '', // 사무실전화
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email,
        password: '',
        name: initialData.name,
        role: initialData.role,
        groupId: initialData.groupId || groups[0]?.id || '',
        teamId: initialData.teamId || '',
        mobilePhone: initialData.mobilePhone || '',
        officePhone: initialData.officePhone || '',
      });
    } else {
      const defaultGroup = groups[0]?.id || '';
      const defaultTeam =
        teams.find((t) => t.groupId === defaultGroup)?.id || '';

      setFormData({
        email: '',
        password: '1234',
        name: '',
        role: 'staff',
        groupId: defaultGroup,
        teamId: defaultTeam,
        mobilePhone: '',
        officePhone: '',
      });
    }
  }, [initialData, groups, teams, isOpen]);

  const filteredTeams = teams.filter((t) => t.groupId === formData.groupId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="animate-fade-in-up w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? '사용자 정보 수정' : '새 사용자 등록'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500">
                이메일 (ID)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded border p-2 text-sm outline-none focus:border-[#2eaadc]"
                placeholder="user@jincheon.com"
                disabled={!!initialData}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500">
                비밀번호
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={initialData ? '변경 시 입력' : '1234'}
                className="w-full rounded border p-2 text-sm outline-none focus:border-[#2eaadc]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-500">
              이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded border p-2 text-sm outline-none focus:border-[#2eaadc]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500">
                소속 그룹
              </label>
              <select
                value={formData.groupId}
                onChange={(e) => {
                  const newGroupId = e.target.value;
                  const firstTeam = teams.find((t) => t.groupId === newGroupId);
                  setFormData({
                    ...formData,
                    groupId: newGroupId,
                    teamId: firstTeam?.id || '',
                  });
                }}
                className="w-full rounded border p-2 text-sm outline-none focus:border-[#2eaadc]"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500">
                소속 팀
              </label>
              <select
                value={formData.teamId}
                onChange={(e) =>
                  setFormData({ ...formData, teamId: e.target.value })
                }
                className="w-full rounded border p-2 text-sm outline-none focus:border-[#2eaadc]"
              >
                {filteredTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                {filteredTeams.length === 0 && (
                  <option value="">팀 없음</option>
                )}
              </select>
            </div>
          </div>

          {/* [수정] 연락처 필드 2개로 분리 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500">
                휴대전화
              </label>
              <input
                type="text"
                value={formData.mobilePhone}
                onChange={(e) =>
                  setFormData({ ...formData, mobilePhone: e.target.value })
                }
                className="w-full rounded border p-2 text-sm outline-none focus:border-[#2eaadc]"
                placeholder="010-0000-0000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500">
                사무실 전화
              </label>
              <input
                type="text"
                value={formData.officePhone}
                onChange={(e) =>
                  setFormData({ ...formData, officePhone: e.target.value })
                }
                className="w-full rounded border p-2 text-sm outline-none focus:border-[#2eaadc]"
                placeholder="내선번호"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-500">
              권한 (Role)
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as Role })
              }
              className="w-full rounded border p-2 text-sm outline-none focus:border-[#2eaadc]"
            >
              <option value="staff">Staff (일반 사원)</option>
              <option value="manager">Manager (팀장)</option>
              <option value="admin">Admin (관리자)</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-gray-500 hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={() => onSubmit(formData)}
            className="flex items-center gap-2 rounded bg-[#2eaadc] px-6 py-2 text-sm font-bold text-white hover:bg-[#2589b0]"
          >
            <FaSave /> 저장
          </button>
        </div>
      </div>
    </div>
  );
}
