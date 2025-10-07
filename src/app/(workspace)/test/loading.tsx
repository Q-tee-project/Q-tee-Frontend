export default function TestLoading() {
  return (
    <div className="flex flex-col p-5 gap-5 min-h-screen">
      {/* 헤더 스켈레톤 */}
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>

      {/* 탭 스켈레톤 */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-20"></div>
        </div>
      </div>

      {/* 메인 컨텐츠 스켈레톤 */}
      <div className="flex gap-6 flex-1">
        {/* 사이드바 스켈레톤 */}
        <div className="w-1/4 bg-white rounded-lg shadow-sm p-4 animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* 메인 컨텐츠 스켈레톤 */}
        <div className="w-3/4 bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
              <div className="h-10 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
