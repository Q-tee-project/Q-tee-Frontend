export default function ClassDetailLoading() {
  return (
    <div className="flex flex-col p-5 gap-5">
      {/* 헤더 스켈레톤 */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>

      {/* 메인 카드 스켈레톤 */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-6">
          {/* 제목 영역 */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
          </div>

          {/* 탭 영역 */}
          <div className="border-b border-gray-200">
            <div className="flex gap-6">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
