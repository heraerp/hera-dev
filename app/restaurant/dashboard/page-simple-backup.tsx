"use client";

import React from 'react';

const SimpleDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Restaurant Dashboard - Simple Test
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg text-gray-700">
            Dashboard is loading successfully! 🎉
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This means the core routing and layout are working.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;