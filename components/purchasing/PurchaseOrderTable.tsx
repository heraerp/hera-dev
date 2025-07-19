/**
 * HERA Universal - Purchase Order Table
 * 
 * Professional table with theme-aware design and actions
 */

'use client';

import { useState } from 'react';
import { Eye, Edit, Trash2, MoreHorizontal, CheckCircle, XCircle, Package, Truck } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { PurchaseOrderEditForm } from './PurchaseOrderEditForm';
import { GoodsReceiptForm } from './GoodsReceiptForm';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  totalAmount: number;
  status: string; // Allow any status value to handle API variations
  createdAt: string;
  requestedDeliveryDate?: string;
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  organizationId: string;
  onRefresh: () => void;
}

export function PurchaseOrderTable({ orders, organizationId, onRefresh }: PurchaseOrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGoodsReceiptModal, setShowGoodsReceiptModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleApprove = async (orderId: string) => {
    try {
      const response = await fetch(`/api/purchasing/purchase-orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' })
      });
      
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error approving order:', error);
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      const response = await fetch(`/api/purchasing/purchase-orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  const handleView = (order: PurchaseOrder) => {
    setViewingOrder(order);
    setShowViewModal(true);
  };

  const handleEdit = (order: PurchaseOrder) => {
    setViewingOrder(order);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setViewingOrder(null);
    onRefresh();
  };

  const handleGoodsReceipt = (order: PurchaseOrder) => {
    setViewingOrder(order);
    setShowGoodsReceiptModal(true);
  };

  const handleGoodsReceiptSuccess = (grNumber?: string) => {
    setShowGoodsReceiptModal(false);
    setViewingOrder(null);
    onRefresh();
    if (grNumber) {
      console.log(`✅ Goods Receipt Created: ${grNumber}`);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        const response = await fetch(`/api/purchasing/purchase-orders?id=${orderId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          onRefresh();
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                PO Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order) => (
              <tr 
                key={order.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {order.poNumber}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {order.supplierName}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(order.totalAmount)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={order.status} />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(order.createdAt)}
                  </div>
                  {order.requestedDeliveryDate && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Delivery: {formatDate(order.requestedDeliveryDate)}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {order.items?.length || 0} items
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {order.status === 'pending_approval' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleApprove(order.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReject(order.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'approved' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleGoodsReceipt(order)}
                        title="Process goods receipt"
                        className="bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200"
                      >
                        <Package className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleView(order)}
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(order)}
                      title="Edit order"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(order.id)}
                      title="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showViewModal && viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Purchase Order Details - {viewingOrder.poNumber}
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">PO Number:</span> {viewingOrder.poNumber}</div>
                    <div><span className="font-medium">Supplier:</span> {viewingOrder.supplierName}</div>
                    <div><span className="font-medium">Status:</span> <StatusBadge status={viewingOrder.status} /></div>
                    <div><span className="font-medium">Total Amount:</span> {formatCurrency(viewingOrder.totalAmount)}</div>
                    <div><span className="font-medium">Created:</span> {formatDate(viewingOrder.createdAt)}</div>
                    {viewingOrder.requestedDeliveryDate && (
                      <div><span className="font-medium">Delivery Date:</span> {formatDate(viewingOrder.requestedDeliveryDate)}</div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Items ({viewingOrder.items?.length || 0})
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Unit Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {viewingOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.itemName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && viewingOrder && (
        <PurchaseOrderEditForm
          order={viewingOrder}
          organizationId={organizationId}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Goods Receipt Modal */}
      {showGoodsReceiptModal && viewingOrder && (
        <GoodsReceiptForm
          organizationId={organizationId}
          poId={viewingOrder.id}
          poNumber={viewingOrder.poNumber}
          onClose={() => setShowGoodsReceiptModal(false)}
          onSuccess={handleGoodsReceiptSuccess}
        />
      )}
    </div>
  );
}