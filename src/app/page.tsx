export default function Home() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      {/* 대형 로고/텍스트 */}
      <h1 className="text-5xl font-extrabold tracking-tight text-[#37352f] md:text-7xl">
        ❄️ 진천냉장센터 v1.2.1
      </h1>

      <p className="mt-6 text-xl font-medium text-gray-400">
        업무를 보다 편하게
      </p>

      {/* 안내 문구 */}
      <div className="mt-12 rounded-xl border border-gray-200 bg-white px-8 py-6 shadow-sm">
        <p className="text-sm text-gray-500">
          👈 좌측 사이드바에서 <strong>메뉴</strong>를 선택하여 시작하세요.
        </p>
      </div>
      <div className="pt-10">대부분의 기능은 구현중/예정 입니다.</div>
      <div className="pt-3">없는 기능은 404가 뜨는게 맞습니다.</div>
    </div>
  );
}
