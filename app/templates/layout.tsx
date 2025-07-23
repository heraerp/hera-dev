import React from 'react';
import { Sparkles } from 'lucide-react';

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-800">
      {/* Templates-specific header */}
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <Sparkles className="h-8 w-8 text-teal-400 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-white">HERA Templates System</h1>
              <p className="text-sm text-gray-400">Deploy complete ERP systems in 2 minutes</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Templates navigation tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            <a 
              href="/templates" 
              className="border-b-2 border-teal-500 text-teal-400 py-4 px-1 text-sm font-medium"
            >
              Marketplace
            </a>
            <a 
              href="/templates/deployments" 
              className="border-b-2 border-transparent text-gray-300 hover:text-white hover:border-gray-300 py-4 px-1 text-sm font-medium transition-colors"
            >
              My Deployments
            </a>
            <a 
              href="/templates/analytics" 
              className="border-b-2 border-transparent text-gray-300 hover:text-white hover:border-gray-300 py-4 px-1 text-sm font-medium transition-colors"
            >
              Analytics
            </a>
            <a 
              href="/templates/create" 
              className="border-b-2 border-transparent text-gray-300 hover:text-white hover:border-gray-300 py-4 px-1 text-sm font-medium transition-colors"
            >
              Create Template
            </a>
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
}