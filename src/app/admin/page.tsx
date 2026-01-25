'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  createGroup,
  createTeam,
  createUser,
  deleteGroup,
  deleteTeam,
  getAllGroups,
  getAllTeams,
  updateGroup,
  updateTeam,
  updateUserByAdmin,
} from '@/lib/auth-api';
import { deleteUser, getAllUsers } from '@/lib/user-api';

import { Group, Team, User } from '@/types/auth';
import { cn } from '@/lib/utils';
import {
  FaBuilding,
  FaCalendarAlt,
  FaEdit,
  FaEnvelope,
  FaMobileAlt,
  FaPhone,
  FaPlus,
  FaTrash,
  FaUserCog,
  FaUsers,
} from 'react-icons/fa';
import UserFormModal from '@/components/features/admin/UserFormModal';

type Tab = 'USERS' | 'TEAMS' | 'GROUPS';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('USERS');

  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUserTarget, setEditUserTarget] = useState<User | null>(null);

  // 데이터 로딩
  const loadData = async () => {
    // 1. 유저 목록
    try {
      const u = await getAllUsers();
      setUsers(u);
    } catch (e) {
      console.error('❌ 유저 목록 로딩 실패:', e);
    }

    // 2. 그룹 목록
    try {
      const g = await getAllGroups();
      setGroups(g);
    } catch (e) {
      setGroups([]);
    }

    // 3. 팀 목록
    try {
      const t = await getAllTeams();
      setTeams(t);
    } catch (e) {
      setTeams([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- 날짜 포맷팅 함수 ---
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // --- 핸들러 ---
  const handleUserSave = async (data: any) => {
    try {
      if (editUserTarget) {
        await updateUserByAdmin(editUserTarget.id, data);
        alert('사용자 정보가 수정되었습니다.');
      } else {
        await createUser(data);
        alert('새 사용자가 등록되었습니다.');
      }
      await loadData();
      setIsUserModalOpen(false);
    } catch (error: any) {
      console.error(error);
      const msg = error.message || '작업 중 오류가 발생했습니다.';
      alert(`실패: ${msg}`);
    }
  };

  const handleUserDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await deleteUser(id);
      await loadData();
    } catch (e) {
      alert('삭제 실패');
    }
  };

  // --- 그룹/팀 핸들러 (생략 없이 유지) ---
  const handleGroupAdd = async () => {
    const name = prompt('새 그룹(회사) 이름:');
    if (!name) return;
    try {
      await createGroup(name);
      await loadData();
    } catch (e) {
      alert('실패');
    }
  };
  const handleGroupEdit = async (group: Group) => {
    const name = prompt('그룹 이름 수정:', group.name);
    if (!name) return;
    try {
      await updateGroup(group.id, name);
      await loadData();
    } catch (e) {
      alert('실패');
    }
  };
  const handleGroupDelete = async (id: string) => {
    if (!confirm('삭제 시 하위 팀/유저 문제가 생길 수 있습니다.')) return;
    try {
      await deleteGroup(id);
      await loadData();
    } catch (e) {
      alert('실패');
    }
  };
  const handleTeamAdd = async () => {
    const name = prompt('새 팀 이름:');
    if (name && groups.length > 0) {
      try {
        await createTeam(name, groups[0].id);
        await loadData();
      } catch (e) {
        alert('실패');
      }
    }
  };
  const handleTeamEdit = async (team: Team) => {
    const name = prompt('팀 이름 수정:', team.name);
    if (!name) return;
    try {
      await updateTeam(team.id, name);
      await loadData();
    } catch (e) {
      alert('실패');
    }
  };
  const handleTeamDelete = async (id: string) => {
    if (!confirm('삭제?')) return;
    try {
      await deleteTeam(id);
      await loadData();
    } catch (e) {
      alert('실패');
    }
  };

  // 접근 제어 (페이지 진입)
  if (!user || (user.role !== 'admin' && user.role !== 'developer')) {
    return (
      <div className="p-8 font-bold text-red-500">접근 권한이 없습니다.</div>
    );
  }

  const meRole = user.role;
  const isMeDeveloper = meRole === 'developer';
  const isMeAdmin = meRole === 'admin';

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#37352f]">
          시스템 관리 (Admin)
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          진천냉장센터 통합 마스터 관리
        </p>
      </div>

      {/* 탭 메뉴 */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <TabButton
          active={activeTab === 'USERS'}
          onClick={() => setActiveTab('USERS')}
          icon={FaUserCog}
          label="사용자 관리"
        />
        <TabButton
          active={activeTab === 'TEAMS'}
          onClick={() => setActiveTab('TEAMS')}
          icon={FaUsers}
          label="팀 관리"
        />
        <TabButton
          active={activeTab === 'GROUPS'}
          onClick={() => setActiveTab('GROUPS')}
          icon={FaBuilding}
          label="그룹 관리"
        />
      </div>

      {/* 탭 1: 사용자 관리 */}
      {activeTab === 'USERS' && (
        <div className="animate-fade-in-up">
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                setEditUserTarget(null);
                setIsUserModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-[#2eaadc] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#2589b0]"
            >
              <FaPlus /> 사용자 등록
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 font-bold text-gray-500">
                <tr>
                  <th className="px-6 py-3">프로필</th>
                  <th className="px-6 py-3">소속 (그룹 &gt; 팀)</th>
                  <th className="px-6 py-3">연락처</th>
                  <th className="px-6 py-3 text-center">권한</th>
                  <th className="px-6 py-3 text-center">가입일</th>
                  <th className="px-6 py-3 text-right">관리</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const isTargetAdminOrDev =
                    u.role === 'admin' || u.role === 'developer';

                  // 규칙:
                  // - developer: 모든 사용자 수정/삭제 가능
                  // - admin: admin/developer 계정은 수정/삭제 불가
                  const canManageTarget =
                    isMeDeveloper || (isMeAdmin && !isTargetAdminOrDev);

                  const isSelf = u.id === user.id;
                  const canManageTargetFinal = canManageTarget && !isSelf;
                  // const canManageTargetFinal = canManageTarget;

                  const editBtnClass = cn(
                    'rounded p-2 text-gray-400',
                    canManageTargetFinal
                      ? 'hover:bg-blue-50 hover:text-blue-500'
                      : 'cursor-not-allowed opacity-40'
                  );

                  const deleteBtnClass = cn(
                    'rounded p-2 text-gray-400',
                    canManageTargetFinal
                      ? 'hover:bg-red-50 hover:text-red-500'
                      : 'cursor-not-allowed opacity-40'
                  );

                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      {/* 1. 프로필 (이름/이메일) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">
                              {u.name}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <FaEnvelope size={10} /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. 소속 (그룹 > 팀) */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700">
                            {u.groupName || '-'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {u.teamName ? `> ${u.teamName}` : '소속 팀 없음'}
                          </span>
                        </div>
                      </td>

                      {/* 3. 연락처 (모바일/내선) */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-gray-600">
                          {u.mobilePhone ? (
                            <div className="flex items-center gap-2">
                              <FaMobileAlt className="text-gray-400" />
                              {u.mobilePhone}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}

                          {u.officePhone ? (
                            <div className="flex items-center gap-2 text-gray-400">
                              <FaPhone size={10} />
                              {u.officePhone}
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* 4. 권한 */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            'inline-block min-w-[80px] rounded px-2 py-1 text-xs font-bold uppercase shadow-sm',
                            u.role === 'admin' || u.role === 'developer'
                              ? 'border border-red-100 bg-red-50 text-red-600'
                              : u.role === 'manager'
                                ? 'border border-blue-100 bg-blue-50 text-blue-600'
                                : 'border border-gray-200 bg-gray-50 text-gray-500'
                          )}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* 5. 가입일 */}
                      <td className="px-6 py-4 text-center text-xs text-gray-500">
                        <div className="flex items-center justify-center gap-1">
                          <FaCalendarAlt className="text-gray-300" />
                          {formatDate((u as any).createdAt)}
                        </div>
                      </td>

                      {/* 6. 관리 버튼 */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              if (!canManageTargetFinal) return;
                              setEditUserTarget(u);
                              setIsUserModalOpen(true);
                            }}
                            disabled={!canManageTargetFinal}
                            className={editBtnClass}
                            title={canManageTargetFinal ? '수정' : '권한 없음'}
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() => {
                              if (!canManageTargetFinal) return;
                              handleUserDelete(u.id);
                            }}
                            disabled={!canManageTargetFinal}
                            className={deleteBtnClass}
                            title={canManageTargetFinal ? '삭제' : '권한 없음'}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                사용자가 없거나 로딩 중입니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 탭 2: 팀 관리 */}
      {activeTab === 'TEAMS' && (
        <div className="animate-fade-in-up">
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleTeamAdd}
              className="flex items-center gap-2 rounded-lg bg-[#2eaadc] px-4 py-2 text-sm font-bold text-white hover:bg-[#2589b0]"
            >
              <FaPlus /> 팀 추가
            </button>
          </div>

          {teams.length === 0 ? (
            <div className="p-8 text-center text-gray-400">정보 없음</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <div className="mb-1 text-xs font-bold text-gray-400">
                      {groups.find((g) => g.id === t.groupId)?.name}
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {t.name}
                    </div>
                  </div>
                  <div className="flex gap-2 text-gray-300">
                    <button
                      onClick={() => handleTeamEdit(t)}
                      className="hover:text-blue-500"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleTeamDelete(t.id)}
                      className="hover:text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 탭 3: 그룹 관리 */}
      {activeTab === 'GROUPS' && (
        <div className="animate-fade-in-up">
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleGroupAdd}
              className="flex items-center gap-2 rounded-lg bg-[#2eaadc] px-4 py-2 text-sm font-bold text-white hover:bg-[#2589b0]"
            >
              <FaPlus /> 그룹 추가
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="p-8 text-center text-gray-400">정보 없음</div>
          ) : (
            <div className="space-y-3">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xl">
                      🏢
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{g.name}</div>
                      <div className="text-xs text-gray-400">ID: {g.id}</div>
                    </div>
                  </div>
                  <div className="flex gap-3 text-gray-400">
                    <button
                      onClick={() => handleGroupEdit(g)}
                      className="hover:text-blue-500"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleGroupDelete(g.id)}
                      className="hover:text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 공통 유저 폼 모달 */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleUserSave}
        initialData={editUserTarget}
        groups={groups}
        teams={teams}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all',
        active
          ? 'border-[#2eaadc] text-[#2eaadc]'
          : 'border-transparent text-gray-400 hover:border-gray-200 hover:text-gray-600'
      )}
    >
      <Icon /> {label}
    </button>
  );
}
