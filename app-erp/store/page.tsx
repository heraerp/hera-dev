"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function StoreRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 2 seconds
    const timer = setTimeout(() => {
      router.push('/app-erp/store');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full text-center p-8">
        <div className="flex items-center justify-center mb-8">
          <SparklesIcon className="w-16 h-16 text-teal-600 dark:text-teal-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🏪 HERA App Store
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The app store has been moved to the main app directory for better Next.js compatibility.
          You will be redirected automatically.
        </p>

        <div className="space-y-4">
          <Link
            href="/app-erp/store"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200"
          >
            Go to App Store
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
          
          <div className="text-sm text-gray-500">
            Auto-redirecting in 2 seconds...
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Features Available
          </h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <div>🔍 Search across 27 ERP modules</div>
            <div>📱 Mobile-responsive design</div>
            <div>🎨 Modern app store interface</div>
            <div>⚡ Live vs Coming Soon indicators</div>
          </div>
        </div>
      </div>
    </div>
  );
}