'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { getMe, loginApi, logoutApi } from '@/lib/auth-api';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (id: string, pw: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 1. 앱 시작 시 세션 확인
  useEffect(() => {
    const initAuth = async () => {
      try {
        const me = await getMe();
        if (me) setUser(me);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // 2. 리다이렉트 로직
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.replace('/login');
    }
    if (!isLoading && user && pathname === '/login') {
      router.replace('/');
    }
  }, [user, isLoading, pathname, router]);

  // [수정] 로그인 함수 로직 개선
  const login = async (id: string, pw: string) => {
    try {
      const foundUser = await loginApi(id, pw);
      if (foundUser) {
        // 1. 유저 상태 먼저 업데이트
        setUser(foundUser);

        // 2. 페이지 이동 (성공 리턴)
        router.push('/');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login Error:', e);
      return false;
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      router.replace('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const me = await getMe();
      if (me) setUser(me);
    } catch (e) {
      console.error('Failed to refresh user');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, refreshUser, isLoading }}
    >
      {isLoading ? (
        <div className="flex h-screen items-center justify-center bg-[#f7f7f5]">
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
