/**
 * HERA Universal - Search Input Component
 * 
 * Professional search input with theme-aware design
 */

'use client';

import { Search, X } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({ 
  placeholder = "Search...", 
  value, 
  onChange, 
  className = "" 
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>
      
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full pl-10 pr-10 py-2 
          bg-white dark:bg-gray-700 
          border border-gray-300 dark:border-gray-600 
          rounded-md 
          text-gray-900 dark:text-gray-100 
          placeholder-gray-400 dark:placeholder-gray-500
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-200
        "
      />
      
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}