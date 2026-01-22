// 'use client';
//
// import { useEffect, useState } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import {
//   createUser,
//   deleteUser,
//   getAllGroups,
//   getAllTeams,
//   getAllUsers,
//   updateUserByAdmin,
// } from '@/lib/auth-api';
// import { Group, Team, User } from '@/types/auth';
// import { FaEdit, FaSearch, FaTrash, FaUserPlus } from 'react-icons/fa';
// import UserFormModal from '@/components/features/admin/UserFormModal';
//
// export default function TeamManagementPage() {
//   const { user } = useAuth();
//
//   // 데이터 상태
//   const [members, setMembers] = useState<User[]>([]);
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [teams, setTeams] = useState<Team[]>([]);
//   const [search, setSearch] = useState('');
//
//   // 모달 상태
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editTarget, setEditTarget] = useState<User | null>(null);
//
//   // 데이터 로드
//   const fetchData = async () => {
//     if (!user) return;
//     const [u, g, t] = await Promise.all([
//       getAllUsers(),
//       getAllGroups(),
//       getAllTeams(),
//     ]);
//
//     // [중요] 내 팀원만 필터링 (Admin은 모든 유저 볼 수 있게 하려면 조건 변경)
//     const myTeamMembers = u.filter((member) => member.teamId === user.teamId);
//     setMembers(myTeamMembers);
//
//     setGroups(g);
//     setTeams(t);
//   };
//
//   useEffect(() => {
//     fetchData();
//   }, [user]);
//
//   // --- CRUD Handlers ---
//   const handleCreate = async (data: any) => {
//     // 팀 관리 페이지에선 자동으로 내 팀으로 생성하도록 강제할 수도 있음
//     await createUser(data);
//     await fetchData();
//     setIsModalOpen(false);
//   };
//
//   const handleUpdate = async (data: any) => {
//     if (editTarget) {
//       // [수정 2] updateUser -> updateUserByAdmin 사용
//       await updateUserByAdmin(editTarget.id, data);
//       await fetchData();
//       setIsModalOpen(false);
//     }
//   };
//
//   const handleDelete = async (id: string) => {
//     if (confirm('정말로 팀에서 내보내시겠습니까?')) {
//       await deleteUser(id);
//       await fetchData();
//     }
//   };
//
//   const openCreateModal = () => {
//     setEditTarget(null);
//     setIsModalOpen(true);
//   };
//
//   const openEditModal = (target: User) => {
//     setEditTarget(target);
//     setIsModalOpen(true);
//   };
//
//   if (!user) return null;
//
//   return (
//     <div className="h-full overflow-y-auto p-8">
//       {/* Header */}
//       <div className="mb-6 flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-[#37352f]">
//             {user.teamName} 팀원 관리
//           </h1>
//           <p className="mt-1 text-sm text-gray-500">{user.groupName} 소속</p>
//         </div>
//         <button
//           onClick={openCreateModal}
//           className="flex items-center gap-2 rounded-lg bg-[#2eaadc] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#2589b0]"
//         >
//           <FaUserPlus /> 팀원 등록
//         </button>
//       </div>
//
//       {/* Search */}
//       <div className="mb-6 flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
//         <div className="relative flex-1">
//           <FaSearch className="absolute top-3 left-3 text-gray-400" />
//           <input
//             type="text"
//             placeholder="이름 또는 이메일로 검색"
//             className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pr-4 pl-10 focus:ring-1 focus:ring-[#2eaadc] focus:outline-none"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//       </div>
//
//       {/* List Table */}
//       <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
//         <table className="w-full text-left text-sm">
//           <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase">
//             <tr>
//               <th className="px-6 py-3 font-bold">이름 / 이메일</th>
//               <th className="px-6 py-3 font-bold">휴대전화</th>
//               <th className="px-6 py-3 font-bold">사무실전화</th>
//               <th className="px-6 py-3 text-center font-bold">직책</th>
//               <th className="px-6 py-3 text-center font-bold">관리</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {members
//               .filter(
//                 (m) => m.name.includes(search) || m.email.includes(search) // [수정 3] username -> email
//               )
//               .map((member) => (
//                 <tr
//                   key={member.id}
//                   className="transition-colors hover:bg-gray-50"
//                 >
//                   <td className="flex items-center gap-3 px-6 py-4">
//                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
//                       {member.name.charAt(0)}
//                     </div>
//                     <div>
//                       <div className="font-bold text-gray-800">
//                         {member.name}
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         {member.email} {/* [수정 4] username -> email */}
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-gray-600">
//                     {member.mobilePhone || '-'}{' '}
//                     {/* [수정 4] phone -> mobilePhone */}
//                   </td>
//                   <td className="px-6 py-4 text-gray-600">
//                     {member.officePhone || '-'} {/* [추가] 사무실 전화 표시 */}
//                   </td>
//                   <td className="px-6 py-4 text-center">
//                     <span
//                       className={`inline-block rounded px-2 py-1 text-xs font-bold uppercase ${
//                         member.role === 'manager'
//                           ? 'bg-indigo-100 text-indigo-700'
//                           : 'bg-gray-100 text-gray-600'
//                       }`}
//                     >
//                       {member.role}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-center">
//                     <div className="flex justify-center gap-3">
//                       <button
//                         onClick={() => openEditModal(member)}
//                         className="text-gray-400 hover:text-blue-500"
//                       >
//                         <FaEdit />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(member.id)}
//                         className="text-gray-400 hover:text-red-500"
//                       >
//                         <FaTrash />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//           </tbody>
//         </table>
//         {members.length === 0 && (
//           <div className="p-8 text-center text-gray-400">
//             등록된 팀원이 없습니다.
//           </div>
//         )}
//       </div>
//
//       {/* User Create/Edit Modal */}
//       <UserFormModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSubmit={editTarget ? handleUpdate : handleCreate}
//         initialData={editTarget}
//         groups={groups}
//         teams={teams}
//       />
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
// [수정] auth-api에서 가져올 것들 (그룹, 팀, 생성, 수정)
import {
  createUser,
  getAllGroups,
  getAllTeams,
  updateUserByAdmin,
} from '@/lib/auth-api';
// [수정] user-api에서 가져올 것들 (유저 목록 조회, 삭제) -> 새로 만든 파일에서 가져옴
import { deleteUser, getAllUsers } from '@/lib/user-api';

import { Group, Team, User } from '@/types/auth';
import { FaEdit, FaSearch, FaTrash, FaUserPlus } from 'react-icons/fa';
import UserFormModal from '@/components/features/admin/UserFormModal';

export default function TeamManagementPage() {
  const { user } = useAuth();

  // 데이터 상태
  const [members, setMembers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);

  // 데이터 로드
  const fetchData = async () => {
    if (!user) return;
    try {
      const [u, g, t] = await Promise.all([
        getAllUsers(),
        getAllGroups(),
        getAllTeams(),
      ]);

      // [중요] 내 팀원만 필터링
      const myTeamMembers = u.filter((member) => member.teamId === user.teamId);
      setMembers(myTeamMembers);

      setGroups(g);
      setTeams(t);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // --- CRUD Handlers ---
  const handleCreate = async (data: any) => {
    try {
      await createUser(data);
      await fetchData();
      setIsModalOpen(false);
      alert('팀원이 등록되었습니다.');
    } catch (e) {
      alert('팀원 등록 실패');
    }
  };

  const handleUpdate = async (data: any) => {
    if (editTarget) {
      try {
        await updateUserByAdmin(editTarget.id, data);
        await fetchData();
        setIsModalOpen(false);
        alert('정보가 수정되었습니다.');
      } catch (e) {
        alert('수정 실패');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 팀에서 내보내시겠습니까?')) {
      try {
        await deleteUser(id);
        await fetchData();
      } catch (e) {
        alert('삭제 실패');
      }
    }
  };

  const openCreateModal = () => {
    setEditTarget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (target: User) => {
    setEditTarget(target);
    setIsModalOpen(true);
  };

  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#37352f]">
            {user.teamName} 팀원 관리
          </h1>
          <p className="mt-1 text-sm text-gray-500">{user.groupName} 소속</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-[#2eaadc] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#2589b0]"
        >
          <FaUserPlus /> 팀원 등록
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="이름 또는 이메일로 검색"
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pr-4 pl-10 focus:ring-1 focus:ring-[#2eaadc] focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3 font-bold">이름 / 이메일</th>
              <th className="px-6 py-3 font-bold">휴대전화</th>
              <th className="px-6 py-3 font-bold">사무실전화</th>
              <th className="px-6 py-3 text-center font-bold">직책</th>
              <th className="px-6 py-3 text-center font-bold">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members
              .filter(
                (m) => m.name.includes(search) || m.email.includes(search)
              )
              .map((member) => (
                <tr
                  key={member.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="flex items-center gap-3 px-6 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">
                        {member.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {member.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.mobilePhone || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {member.officePhone || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-bold uppercase ${
                        member.role === 'manager'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openEditModal(member)}
                        className="text-gray-400 hover:text-blue-500"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {members.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            등록된 팀원이 없습니다.
          </div>
        )}
      </div>

      {/* User Create/Edit Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editTarget ? handleUpdate : handleCreate}
        initialData={editTarget}
        groups={groups}
        teams={teams}
      />
    </div>
  );
}
