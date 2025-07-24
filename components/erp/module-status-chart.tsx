"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Module {
  code: string;
  name: string;
  domain: string;
  status: 'active' | 'development' | 'template';
}

interface ModuleStatusChartProps {
  modules: Module[];
}

const COLORS = {
  active: '#10B981',      // Green
  development: '#F59E0B', // Yellow
  template: '#6B7280'     // Gray
};

export function ModuleStatusChart({ modules }: ModuleStatusChartProps) {
  // Calculate status distribution
  const statusCounts = modules.reduce((acc, module) => {
    acc[module.status] = (acc[module.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: COLORS[status as keyof typeof COLORS]
  }));

  // Calculate domain distribution
  const domainCounts = modules.reduce((acc, module) => {
    if (!acc[module.domain]) {
      acc[module.domain] = { 
        domain: module.domain,
        active: 0, 
        development: 0, 
        template: 0,
        total: 0
      };
    }
    acc[module.domain][module.status]++;
    acc[module.domain].total++;
    return acc;
  }, {} as Record<string, any>);

  const barData = Object.values(domainCounts).map((domain: any) => ({
    ...domain,
    domain: domain.domain.replace('-', ' & ').replace(/\b\w/g, (l: string) => l.toUpperCase())
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Module Status Overview
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution Pie Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Overall Status Distribution
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain Status Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Status by Business Domain
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="domain" 
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend />
                <Bar dataKey="active" stackId="a" fill={COLORS.active} name="Active" />
                <Bar dataKey="development" stackId="a" fill={COLORS.development} name="Development" />
                <Bar dataKey="template" stackId="a" fill={COLORS.template} name="Template" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {statusCounts.active || 0}
            </div>
            <div className="text-sm text-gray-500">Active Modules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {statusCounts.development || 0}
            </div>
            <div className="text-sm text-gray-500">In Development</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {statusCounts.template || 0}
            </div>
            <div className="text-sm text-gray-500">Templates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {Math.round(((statusCounts.active || 0) / modules.length) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}