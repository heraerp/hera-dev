"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function ERPRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push('/app-erp');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full text-center p-8">
        <div className="flex items-center justify-center mb-8">
          <SparklesIcon className="w-16 h-16 text-teal-600 dark:text-teal-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          HERA ERP System
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The ERP system has been reorganized and moved to a dedicated structure.
          You will be redirected automatically.
        </p>

        <div className="space-y-4">
          <Link
            href="/app-erp"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200"
          >
            Go to HERA ERP
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Link>
          
          <div className="text-sm text-gray-500">
            Auto-redirecting in 3 seconds...
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Quick Access
          </h3>
          <div className="space-y-2 text-sm">
            <Link
              href="/app-erp/finance"
              className="block text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
            >
              → Finance Module
            </Link>
            <Link
              href="/app-erp/operations"
              className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              → Operations Module
            </Link>
            <Link
              href="/app-erp/overview"
              className="block text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
            >
              → System Overview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}