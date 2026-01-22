import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar'; // [중요] 사이드바 임포트
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '물류 통합 시스템',
  description: 'Logistics Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* 1. AuthProvider로 전체를 감쌉니다 (로그인 정보 공유) */}
        <AuthProvider>
          {/* 2. 레이아웃 구조 잡기 (Flex로 좌측 사이드바 + 우측 메인) */}
          <div className="flex h-screen w-screen overflow-hidden">
            {/* 3. 사이드바 배치 (로그인 안하면 내부에서 알아서 null 리턴해서 숨겨짐) */}
            <Sidebar />

            {/* 4. 메인 콘텐츠 영역 */}
            <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-[#f7f7f5]">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
