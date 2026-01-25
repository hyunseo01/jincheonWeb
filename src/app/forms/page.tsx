'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormItem } from '@/types/forms';
import { getForms } from '@/lib/forms-api';
import FormCard from '@/components/features/forms/FormCard';
import { FaFileAlt, FaSearch } from 'react-icons/fa';
import { cn } from '@/lib/utils';

// 탭 목록 정의
const TABS = ['전체', '입출고', '배차'];

export default function FormsPage() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getForms();
        setForms(data);
      } catch (e) {
        console.error('Failed to fetch forms', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredForms = useMemo(() => {
    let result = forms;
    if (activeTab !== '전체') {
      result = result.filter((form) => form.category === activeTab);
    }
    if (searchTerm) {
      result = result.filter((form) =>
        form.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [forms, activeTab, searchTerm]);

  return (
    <div className="h-full overflow-y-auto bg-gray-50/30 p-8">
      {/* Header Area */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#37352f]">업무 양식</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <FaFileAlt className="text-gray-400" />
          <p>구현중인 기능, 작동안함(더미데이터)</p>
        </div>
      </div>

      {/* 🔍 Tabs & Search Area */}
      <div className="mb-6 flex w-full items-end justify-between border-b border-gray-200">
        {/* Left: Tabs */}
        <div className="flex flex-nowrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative -mb-[1px] border-b-2 px-4 py-2 text-sm font-bold whitespace-nowrap transition-all',
                activeTab === tab
                  ? 'border-[#2eaadc] text-[#2eaadc]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right: Search Bar - Flex Row 적용 */}
        <div className="mb-2 flex h-9 w-[240px] items-center gap-3 rounded-md border border-gray-200 bg-white px-3 transition-all focus-within:border-[#2eaadc] focus-within:ring-2 focus-within:ring-[#2eaadc]/10">
          <FaSearch className="shrink-0 text-gray-400" size={13} />
          <input
            type="text"
            placeholder="양식명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-gray-400">데이터 로딩 중...</div>
      ) : filteredForms.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 pb-20 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((item) => (
            <FormCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FaSearch size={48} className="mb-4 opacity-20" />
          <p>
            {searchTerm
              ? `'${searchTerm}'에 대한 검색 결과가 없습니다.`
              : '해당 카테고리에 등록된 양식이 없습니다.'}
          </p>
        </div>
      )}
    </div>
  );
}
