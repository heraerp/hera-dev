/**
 * HERA Universal - PO Approval Dashboard
 * 
 * Mario's Restaurant PO Approval & Workflow Management
 * Professional dashboard matching orange theme and established patterns
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  DollarSign, 
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Package,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCard } from '@/components/ui/MetricsCard';
import { SearchInput } from '@/components/ui/SearchInput';

interface ApprovalDashboardProps {
  organizationId: string;
}

interface PendingPO {
  id: string;
  poNumber: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  approvalLevel: string;
  currentApprover: string;
  supplierInfo: {
    supplierId: string;
    supplierName: string;
  };
  items: any[];
  approvalHistory: {
    tier1?: {
      approvedBy?: string;
      approvalDate?: string;
      notes?: string;
    };
    tier2?: {
      approvedBy?: string;
      approvalDate?: string;
      notes?: string;
    };
  };
  rejectionInfo?: {
    rejectedBy: string;
    rejectionDate: string;
    reason: string;
  };
  modificationInfo?: {
    requestedBy: string;
    requestDate: string;
    requests: string;
    notes: string;
  };
}

interface ApprovalMetrics {
  total: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  modificationRequested: number;
  totalValue: number;
}

export function ApprovalDashboard({ organizationId }: ApprovalDashboardProps) {
  const [pendingPOs, setPendingPOs] = useState<PendingPO[]>([]);
  const [metrics, setMetrics] = useState<ApprovalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPO, setSelectedPO] = useState<PendingPO | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<{poId: string, action: string} | null>(null);

  // Fetch pending approvals
  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/purchasing/purchase-orders/approve?organizationId=${organizationId}&status=${statusFilter}`);
      
      if (response.ok) {
        const data = await response.json();
        setPendingPOs(data.data || []);
        setMetrics(data.summary || null);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, [organizationId, statusFilter]);

  // Filter POs based on search
  const filteredPOs = pendingPOs.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplierInfo.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Handle approval action with better error handling
  const handleApprovalAction = async (poId: string, action: 'approve' | 'reject' | 'request_modification', notes?: string) => {
    try {
      console.log(`🚀 Starting ${action} action for PO ${poId}`);
      
      // Set loading state for this specific action
      setProcessingAction({ poId, action });
      
      const requestData = {
        poId,
        organizationId,
        action,
        approverId: '00000001-0000-0000-0000-000000000002', // Chef Mario for demo
        approverName: 'Chef Mario',
        notes
      };

      console.log('📝 Request data:', requestData);

      const response = await fetch('/api/purchasing/purchase-orders/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('📡 Response status:', response.status);
      
      const responseData = await response.json();
      console.log('📊 Response data:', responseData);

      if (response.ok && responseData.success) {
        console.log(`✅ PO ${action} action completed successfully`);
        await fetchPendingApprovals(); // Refresh data
        setShowApprovalModal(false);
        setSelectedPO(null);
        
        // Show success feedback to user
        alert(`Purchase Order ${responseData.data?.poNumber || poId} ${action}d successfully!`);
      } else {
        const errorMessage = responseData.error || 'Failed to process approval action';
        console.error('❌ Approval failed:', errorMessage);
        alert(`Failed to ${action} purchase order: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Error processing approval:', error);
      alert(`Error occurred while trying to ${action} purchase order. Check console for details.`);
    } finally {
      // Clear loading state
      setProcessingAction(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'modification_requested': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalLevelBadge = (level: string) => {
    switch (level) {
      case 'auto_approved': return <Badge className="bg-green-100 text-green-800">Auto</Badge>;
      case 'tier_1': return <Badge className="bg-blue-100 text-blue-800">Tier 1</Badge>;
      case 'tier_2': return <Badge className="bg-purple-100 text-purple-800">Tier 2</Badge>;
      case 'tier_3': return <Badge className="bg-red-100 text-red-800">Tier 3</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Clock className="mr-3 h-8 w-8 text-orange-600" />
            PO Approval Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Mario's Restaurant - Purchase Order Approval Workflow
          </p>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricsCard
            title="Pending Approval"
            value={metrics.pendingApproval.toString()}
            icon={Clock}
            trend={metrics.pendingApproval > 0 ? "Requires attention" : "All caught up"}
            color={metrics.pendingApproval > 0 ? "orange" : "green"}
          />
          <MetricsCard
            title="Approved Today"
            value={metrics.approved.toString()}
            icon={CheckCircle}
            trend="+15% from yesterday"
            color="green"
          />
          <MetricsCard
            title="Total Value"
            value={`$${metrics.totalValue.toLocaleString()}`}
            icon={DollarSign}
            trend="Pending approvals"
            color="blue"
          />
          <MetricsCard
            title="Modification Requests"
            value={metrics.modificationRequested.toString()}
            icon={Edit3}
            trend={metrics.modificationRequested > 0 ? "Needs revision" : "All clear"}
            color={metrics.modificationRequested > 0 ? "yellow" : "green"}
          />
        </div>
      )}

      {/* Actions Bar */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <SearchInput
                placeholder="Search POs or suppliers..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-full sm:w-64"
              />
              
              <div className="flex items-center space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="modification_requested">Modification Requested</option>
                </select>
                
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending POs List */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Purchase Orders ({filteredPOs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPOs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No purchase orders found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'All caught up! No pending approvals.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPOs.map((po) => (
                <div
                  key={po.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {po.poNumber}
                      </h3>
                      {getApprovalLevelBadge(po.approvalLevel)}
                      <Badge className={getStatusColor(po.status)}>
                        {po.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPO(po);
                          setShowApprovalModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      {po.status === 'pending_approval' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprovalAction(po.id, 'approve')}
                            disabled={processingAction?.poId === po.id}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            {processingAction?.poId === po.id && processingAction.action === 'approve' ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Approving...
                              </>
                            ) : (
                              <>
                                <ThumbsUp className="w-4 h-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprovalAction(po.id, 'reject', 'Rejected via dashboard')}
                            disabled={processingAction?.poId === po.id}
                            className="text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {processingAction?.poId === po.id && processingAction.action === 'reject' ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                Reject
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Supplier:</span>
                      <p className="font-medium">{po.supplierInfo.supplierName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                      <p className="font-medium text-lg">${po.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Current Approver:</span>
                      <p className="font-medium">{po.currentApprover || 'System'}</p>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Submitted: {new Date(po.date).toLocaleDateString()}
                    </span>
                  </div>

                  {po.items && po.items.length > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Items: </span>
                      <span className="font-medium">
                        {po.items.slice(0, 2).map(item => item.itemName || item.productName).join(', ')}
                        {po.items.length > 2 && ` +${po.items.length - 2} more`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal */}
      {showApprovalModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Review Purchase Order: {selectedPO.poNumber}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ${selectedPO.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Approval Level</label>
                  <p>{getApprovalLevelBadge(selectedPO.approvalLevel)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                <p className="text-gray-900 dark:text-gray-100">{selectedPO.supplierInfo.supplierName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Items ({selectedPO.items.length})</label>
                <div className="mt-2 space-y-2">
                  {selectedPO.items.slice(0, 5).map((item, index) => (
                    <div key={index} className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      {item.itemName || item.productName} - Qty: {item.quantity} × ${item.unitPrice}
                    </div>
                  ))}
                  {selectedPO.items.length > 5 && (
                    <p className="text-sm text-gray-500">+{selectedPO.items.length - 5} more items</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedPO(null);
                }}
              >
                Close
              </Button>
              {selectedPO.status === 'pending_approval' && (
                <>
                  <Button
                    onClick={() => handleApprovalAction(selectedPO.id, 'reject', 'Rejected after review')}
                    disabled={processingAction?.poId === selectedPO.id}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {processingAction?.poId === selectedPO.id && processingAction.action === 'reject' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleApprovalAction(selectedPO.id, 'approve')}
                    disabled={processingAction?.poId === selectedPO.id}
                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                  >
                    {processingAction?.poId === selectedPO.id && processingAction.action === 'approve' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Approving...
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}