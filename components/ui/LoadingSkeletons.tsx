/**
 * HERA Universal - Loading Skeletons
 * 
 * Theme-aware loading skeletons with proper depth hierarchy
 */

interface LoadingSkeletonsProps {
  type: 'purchaseOrders' | 'inventory' | 'dashboard' | 'table' | 'cards';
  count?: number;
}

export function LoadingSkeletons({ type, count = 3 }: LoadingSkeletonsProps) {
  const skeletonBase = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";
  
  switch (type) {
    case 'purchaseOrders':
      return (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-3">
                <div className={`${skeletonBase} h-4 w-20`} />
                <div className={`${skeletonBase} h-8 w-16`} />
                <div className={`${skeletonBase} h-3 w-24`} />
              </div>
            ))}
          </div>
          
          {/* Table */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className={`${skeletonBase} h-6 w-48`} />
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6 flex items-center space-x-4">
                  <div className={`${skeletonBase} h-4 w-24`} />
                  <div className={`${skeletonBase} h-4 w-32`} />
                  <div className={`${skeletonBase} h-4 w-20`} />
                  <div className={`${skeletonBase} h-4 w-16`} />
                  <div className={`${skeletonBase} h-8 w-20 rounded-full`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
      
    case 'inventory':
      return (
        <div className="space-y-6">
          {/* Alert Banner */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className={`${skeletonBase} h-5 w-64`} />
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-3">
                <div className={`${skeletonBase} h-4 w-20`} />
                <div className={`${skeletonBase} h-8 w-16`} />
                <div className={`${skeletonBase} h-3 w-32`} />
              </div>
            ))}
          </div>
          
          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`${skeletonBase} h-5 w-32`} />
                  <div className={`${skeletonBase} h-6 w-16 rounded-full`} />
                </div>
                <div className={`${skeletonBase} h-4 w-24`} />
                <div className="space-y-2">
                  <div className={`${skeletonBase} h-3 w-20`} />
                  <div className={`${skeletonBase} h-3 w-28`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      
    case 'table':
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className={`${skeletonBase} h-6 w-48`} />
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="p-6 flex items-center space-x-4">
                <div className={`${skeletonBase} h-4 w-24`} />
                <div className={`${skeletonBase} h-4 w-32`} />
                <div className={`${skeletonBase} h-4 w-20`} />
                <div className={`${skeletonBase} h-4 w-16`} />
              </div>
            ))}
          </div>
        </div>
      );
      
    case 'cards':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
              <div className={`${skeletonBase} h-5 w-32`} />
              <div className={`${skeletonBase} h-4 w-24`} />
              <div className="space-y-2">
                <div className={`${skeletonBase} h-3 w-full`} />
                <div className={`${skeletonBase} h-3 w-3/4`} />
              </div>
            </div>
          ))}
        </div>
      );
      
    default:
      return (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={`${skeletonBase} h-12 w-full`} />
          ))}
        </div>
      );
  }
}