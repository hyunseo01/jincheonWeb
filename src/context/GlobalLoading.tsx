'use client';

import React, { useEffect, useState } from 'react';
import { subscribeLoading } from '@/lib/loading-bus';

export function GlobalLoading({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    return subscribeLoading((delta) => {
      setCount((prev) => Math.max(0, prev + delta));
    });
  }, []);

  const isLoading = count > 0;

  return (
    <>
      {children}
      {isLoading ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
          <div className="rounded-lg bg-white px-4 py-3 text-sm shadow">
            Loading...
          </div>
        </div>
      ) : null}
    </>
  );
}
