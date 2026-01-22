'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile } from '@/lib/auth-api';
import { FaCamera, FaSave, FaUserCircle } from 'react-icons/fa';

export default function MyPage() {
  const { user, refreshUser } = useAuth();

  // [수정] 상태 키값을 DB 컬럼과 일치시킴
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobilePhone: '', // 휴대전화
    officePhone: '', // 사무실전화
    password: '',
    confirmPassword: '',
  });

  // 초기 데이터 로드
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name,
        email: user.email || '',
        mobilePhone: user.mobilePhone || '',
        officePhone: user.officePhone || '',
        password: '',
        confirmPassword: '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password && form.password !== form.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (user) {
      try {
        // [수정] 분리된 필드 그대로 전송
        await updateProfile({
          name: form.name,
          mobilePhone: form.mobilePhone,
          officePhone: form.officePhone,
          password: form.password || undefined,
        });

        await refreshUser();
        alert('정보가 성공적으로 수정되었습니다.');
        setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      } catch (error) {
        console.error(error);
        alert('수정 중 오류가 발생했습니다.');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-full justify-center overflow-y-auto p-8">
      <div className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-8 text-2xl font-bold text-[#37352f]">마이페이지</h1>

        <div className="flex flex-col gap-10 md:flex-row">
          {/* 왼쪽: 프로필 이미지 */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaUserCircle className="text-7xl text-gray-300" />
              )}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100">
                <FaCamera size={24} />
                <input type="file" className="hidden" />
              </label>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold">{user.name}</span>
              <span className="text-sm text-gray-500">
                {user.groupName} / {user.teamName}
              </span>
              <span className="mx-auto mt-2 block w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 uppercase">
                {user.role}
              </span>
            </div>
          </div>

          {/* 오른쪽: 입력 폼 */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">
                  아이디 (변경불가)
                </label>
                <input
                  type="text"
                  value={user.email}
                  disabled
                  className="w-full cursor-not-allowed rounded border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">
                  이름
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#2eaadc] focus:ring-1 focus:ring-[#2eaadc]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-500">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#2eaadc] focus:ring-1 focus:ring-[#2eaadc]"
              />
            </div>

            {/* [수정] 연락처 필드 2개로 분리 */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">
                  휴대전화
                </label>
                <input
                  type="tel"
                  name="mobilePhone"
                  value={form.mobilePhone}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#2eaadc] focus:ring-1 focus:ring-[#2eaadc]"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">
                  사무실 전화
                </label>
                <input
                  type="tel"
                  name="officePhone"
                  value={form.officePhone}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#2eaadc] focus:ring-1 focus:ring-[#2eaadc]"
                  placeholder="내선번호"
                />
              </div>
            </div>

            <div className="my-6 h-px bg-gray-100" />

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700">비밀번호 변경</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="새 비밀번호"
                  className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#2eaadc] focus:ring-1 focus:ring-[#2eaadc]"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호 확인"
                  className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#2eaadc] focus:ring-1 focus:ring-[#2eaadc]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-[#2eaadc] px-6 py-2.5 font-bold text-white transition-colors hover:bg-[#2589b0]"
              >
                <FaSave /> 저장하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
