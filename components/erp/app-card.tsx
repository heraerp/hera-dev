"use client";

import Link from 'next/link';
import { 
  StarIcon, 
  ArrowDownTrayIcon, 
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface App {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  categoryName: string;
  status: 'live' | 'coming-soon';
  href: string;
  features: string[];
  downloads: string;
  rating: number;
  size: string;
  lastUpdated: string;
  developer: string;
  screenshots: number;
  tags: string[];
}

interface AppCardProps {
  app: App;
}

export function AppCard({ app }: AppCardProps) {
  const Icon = app.icon;
  
  // Category color configuration
  const categoryColors = {
    'finance': {
      gradient: 'from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500',
      badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      tags: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    },
    'operations': {
      gradient: 'from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500',
      badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      tags: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    },
    'sales-marketing': {
      gradient: 'from-purple-500 to-pink-600 dark:from-purple-400 dark:to-pink-500',
      badge: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      tags: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    },
    'human-resources': {
      gradient: 'from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500',
      badge: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      tags: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    },
    'projects': {
      gradient: 'from-cyan-500 to-teal-600 dark:from-cyan-400 dark:to-teal-500',
      badge: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      tags: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
    },
    'analytics': {
      gradient: 'from-violet-500 to-purple-600 dark:from-violet-400 dark:to-purple-500',
      badge: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      tags: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800'
    },
    'admin': {
      gradient: 'from-gray-500 to-slate-600 dark:from-gray-400 dark:to-slate-500',
      badge: 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
      tags: 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    }
  };

  const colors = categoryColors[app.category as keyof typeof categoryColors] || categoryColors.admin;
  
  // Status configuration
  const statusConfig = {
    live: {
      icon: CheckCircleIcon,
      text: 'Live',
      textColor: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    'coming-soon': {
      icon: ClockIcon,
      text: 'Coming Soon',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    }
  };

  const status = statusConfig[app.status];
  
  // Generate star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="w-4 h-4 text-yellow-400" />
          <StarIconSolid 
            className="w-4 h-4 text-yellow-400 absolute top-0 left-0" 
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      );
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
      );
    }
    
    return stars;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden relative group">
      {/* Category color accent stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
      {/* App Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {app.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {app.developer}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
            <status.icon className="w-3 h-3 mr-1" />
            {status.text}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {app.description}
        </p>

        {/* Rating and Stats (only for live apps) */}
        {app.status === 'live' && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              {renderStars(app.rating)}
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                {app.rating}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
                {app.downloads}
              </div>
              <div>{app.size}</div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {app.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {feature}
              </span>
            ))}
            {app.features.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                +{app.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {app.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${colors.tags} border`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* App Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Updated {app.lastUpdated}
          </div>
          
          {/* Action Button */}
          <div>
            {app.status === 'live' ? (
              <Link
                href={app.href}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r ${colors.gradient} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 shadow-sm hover:shadow-md`}
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Open
              </Link>
            ) : (
              <div className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 cursor-not-allowed">
                <ClockIcon className="w-4 h-4 mr-2" />
                Coming Soon
              </div>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="mt-2 flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colors.badge} border`}>
            {app.categoryName}
          </span>
          
          {app.screenshots > 0 && (
            <span className="text-xs text-gray-500">
              {app.screenshots} screenshots
            </span>
          )}
        </div>
      </div>
    </div>
  );
}