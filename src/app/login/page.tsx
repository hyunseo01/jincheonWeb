'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, pw);
    if (!success) setError('아이디 또는 비밀번호를 확인해주세요.');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f7f5]">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#37352f]">❄️ JINCHEON</h1>
          <p className="mt-2 text-sm text-gray-500">Cold Storage Center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              EMAIL
            </label>
            {/* [수정] className 추가됨 */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2eaadc] focus:outline-none"
              placeholder="email@jincheoncenter.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              PASSWORD
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#2eaadc] focus:outline-none"
              placeholder="1234"
            />
          </div>

          {error && <p className="text-xs font-bold text-red-500">{error}</p>}

          <button
            type="submit"
            className="mt-4 w-full rounded bg-[#2eaadc] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2589b0]"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
