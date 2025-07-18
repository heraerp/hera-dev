"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';
import { useProcurementRequest } from '@/hooks/useProcurementRequest';

// My Procurement Requests - List and Management Interface
export default function MyRequestsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const {
    requests,
    isLoading,
    error,
    getRequests,
    deleteRequest,
    formatCurrency,
    formatDate,
    getUrgencyColor,
    getStatusColor
  } = useProcurementRequest();

  // Load requests on component mount
  useEffect(() => {
    loadRequests();
  }, [selectedStatus]);

  const loadRequests = async () => {
    try {
      const filters = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      await getRequests(filters);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  // Filter requests based on search query
  const filteredRequests = requests.filter(request => 
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.natural_language_input.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.creator_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusOptions = [
    { value: 'all', label: 'All Requests', count: requests.length, color: 'bg-gray-100 text-gray-800' },
    { value: 'draft', label: 'Draft', count: requests.filter(r => r.status === 'draft').length, color: 'bg-gray-100 text-gray-800' },
    { value: 'pending_approval', label: 'Pending', count: requests.filter(r => r.status === 'pending_approval').length, color: 'bg-amber-100 text-amber-800' },
    { value: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length, color: 'bg-green-100 text-green-800' },
    { value: 'auto_approved', label: 'Auto-Approved', count: requests.filter(r => r.status === 'auto_approved').length, color: 'bg-blue-100 text-blue-800' },
    { value: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length, color: 'bg-red-100 text-red-800' },
  ];

  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await deleteRequest(requestId);
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      draft: '📝',
      pending_approval: '⏳',
      approved: '✅',
      rejected: '❌',
      auto_approved: '🤖',
      cancelled: '🚫',
      completed: '🎉'
    };
    return icons[status as keyof typeof icons] || '📋';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        className="bg-white shadow-sm sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionConfig.spring.swift}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <span className="text-xl">←</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight">My Procurement Requests</h1>
                  <p className="text-sm text-gray-600">📊 Track and manage your submissions</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => window.location.href = '/procurement/request'}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <span className="text-lg mr-1">🆕</span>
                New Request
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="p-4 space-y-6">
        {/* Status Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
          className="flex items-center space-x-2 overflow-x-auto pb-2"
        >
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant={selectedStatus === status.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(status.value)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <span>{status.label}</span>
              {status.count > 0 && (
                <Badge className={cn("text-xs", status.color)}>
                  {status.count}
                </Badge>
              )}
            </Button>
          ))}
        </motion.div>

        {/* Search and View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredRequests.length} of {requests.length} requests
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <span className="text-lg">⊞</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <span className="text-lg">☰</span>
            </Button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <Card className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-4xl mb-4"
              >
                🔄
              </motion.div>
              <p className="text-gray-600">Loading your requests...</p>
            </Card>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h3 className="font-semibold text-red-800">Error Loading Requests</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-20"
          >
            <Card className="p-12 text-center max-w-md">
              <div className="text-6xl mb-6">📋</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {searchQuery ? 'No Matching Requests' : 'No Requests Yet'}
              </h2>
              <p className="text-gray-600 mb-8">
                {searchQuery 
                  ? 'Try adjusting your search terms or filter criteria.'
                  : 'Create your first procurement request to get started with AI-powered purchasing.'
                }
              </p>
              <Button 
                onClick={() => window.location.href = '/procurement/request'}
                className="bg-blue-500 hover:bg-blue-600"
              >
                🆕 Create First Request
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Requests Grid/List */}
        {!isLoading && !error && filteredRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...motionConfig.spring.swift, delay: 0.2 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request, index) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    index={index}
                    onDelete={handleDeleteRequest}
                    onSelect={setSelectedRequest}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getUrgencyColor={getUrgencyColor}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request, index) => (
                  <RequestListItem
                    key={request.id}
                    request={request}
                    index={index}
                    onDelete={handleDeleteRequest}
                    onSelect={setSelectedRequest}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getUrgencyColor={getUrgencyColor}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Request Card Component for Grid View
interface RequestCardProps {
  request: any;
  index: number;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  getUrgencyColor: (urgency: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

function RequestCard({ 
  request, 
  index, 
  onDelete, 
  onSelect, 
  formatCurrency, 
  formatDate, 
  getUrgencyColor, 
  getStatusColor, 
  getStatusIcon 
}: RequestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...motionConfig.spring.bounce, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <Card 
        variant="glass" 
        className="p-6 cursor-pointer transition-all duration-300 hover:shadow-lg"
        onClick={() => onSelect(request.id)}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{getStatusIcon(request.status)}</span>
              <Badge className={cn("text-xs", getStatusColor(request.status))}>
                {request.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <Badge className={cn("text-xs", getUrgencyColor(request.urgency))}>
              {request.urgency.toUpperCase()}
            </Badge>
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
              {request.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-3">
              {request.natural_language_input}
            </p>
          </div>

          {/* Items Preview */}
          {request.parsed_items && request.parsed_items.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">Items ({request.parsed_items.length}):</div>
              <div className="space-y-1">
                {request.parsed_items.slice(0, 2).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{item.item_name}</span>
                    <span className="font-medium">×{item.quantity}</span>
                  </div>
                ))}
                {request.parsed_items.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{request.parsed_items.length - 2} more items
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Budget and Date */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-600">Budget: </span>
              <span className="font-semibold">
                {request.estimated_budget ? formatCurrency(request.estimated_budget) : 'TBD'}
              </span>
            </div>
            <div className="text-gray-500 text-xs">
              {formatDate(request.created_at)}
            </div>
          </div>

          {/* AI Confidence */}
          {request.ai_confidence && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">AI Confidence:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${request.ai_confidence * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium">{Math.round(request.ai_confidence * 100)}%</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              📄 View Details
            </Button>
            {request.status === 'draft' && (
              <Button size="sm" variant="outline" className="text-xs">
                ✏️ Edit
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(request.id);
              }}
            >
              🗑️
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Request List Item Component for List View
function RequestListItem({ 
  request, 
  index, 
  onDelete, 
  onSelect, 
  formatCurrency, 
  formatDate, 
  getUrgencyColor, 
  getStatusColor, 
  getStatusIcon 
}: RequestCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...motionConfig.spring.swift, delay: index * 0.05 }}
    >
      <Card 
        variant="glass" 
        className="p-4 cursor-pointer transition-all duration-300 hover:shadow-md"
        onClick={() => onSelect(request.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{getStatusIcon(request.status)}</span>
              <Badge className={cn("text-xs", getStatusColor(request.status))}>
                {request.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {request.title}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {request.natural_language_input}
              </p>
            </div>

            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="text-gray-600">Items</div>
                <div className="font-semibold">{request.parsed_items?.length || 0}</div>
              </div>
              
              <div className="text-center">
                <div className="text-gray-600">Budget</div>
                <div className="font-semibold">
                  {request.estimated_budget ? formatCurrency(request.estimated_budget) : 'TBD'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-gray-600">Urgency</div>
                <Badge className={cn("text-xs", getUrgencyColor(request.urgency))}>
                  {request.urgency.toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-gray-600">Created</div>
                <div className="text-xs">{formatDate(request.created_at)}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="text-xs">
              📄 View
            </Button>
            {request.status === 'draft' && (
              <Button size="sm" variant="outline" className="text-xs">
                ✏️ Edit
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(request.id);
              }}
            >
              🗑️
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}