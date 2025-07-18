'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package,
  Truck,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  FileText,
  Upload,
  Download,
  Plus,
  Eye
} from 'lucide-react';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';

interface SupplierPortalProps {
  supplierId: string;
  supplierName: string;
}

interface PurchaseOrder {
  id: string;
  restaurantName: string;
  orderDate: Date;
  requestedDelivery: Date;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'invoiced';
  items: OrderItem[];
  total: number;
  priority: 'standard' | 'urgent';
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  poNumber: string;
  amount: number;
  status: 'draft' | 'submitted' | 'approved' | 'paid';
  dueDate: Date;
  submittedDate?: Date;
}

const SupplierPortal: React.FC<SupplierPortalProps> = ({ supplierId, supplierName }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'deliveries' | 'invoices' | 'payments'>('orders');

  // Mock data
  const purchaseOrders: PurchaseOrder[] = [
    {
      id: 'PO-2024-001',
      restaurantName: 'First Floor Restaurant',
      orderDate: new Date(),
      requestedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'urgent',
      items: [
        { id: '1', name: 'Basmati Rice', quantity: 50, unit: 'kg', unitPrice: 4.50, total: 225 },
        { id: '2', name: 'Paneer', quantity: 20, unit: 'kg', unitPrice: 8.00, total: 160 },
        { id: '3', name: 'Tomatoes', quantity: 30, unit: 'kg', unitPrice: 2.50, total: 75 }
      ],
      total: 460
    },
    {
      id: 'PO-2024-002',
      restaurantName: 'First Floor Restaurant',
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      requestedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'confirmed',
      priority: 'standard',
      items: [
        { id: '1', name: 'Chicken', quantity: 25, unit: 'kg', unitPrice: 12.00, total: 300 },
        { id: '2', name: 'Onions', quantity: 40, unit: 'kg', unitPrice: 1.50, total: 60 }
      ],
      total: 360
    }
  ];

  const invoices: Invoice[] = [
    {
      id: 'INV-001',
      poNumber: 'PO-2024-001',
      amount: 460,
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'INV-002',
      poNumber: 'PO-2023-998',
      amount: 720,
      status: 'paid',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  ];

  const summary = {
    pending_orders: purchaseOrders.filter(po => po.status === 'pending').length,
    urgent_deliveries: purchaseOrders.filter(po => po.priority === 'urgent').length,
    pending_invoices: invoices.filter(inv => inv.status === 'draft').length,
    outstanding_payments: invoices.filter(inv => inv.status === 'submitted' || inv.status === 'approved').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'invoiced': return 'bg-slate-100 text-slate-800';
      case 'draft': return 'bg-orange-100 text-orange-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'paid': return <DollarSign className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Supplier Portal</h1>
            <p className="text-slate-600">{supplierName} • Supplier Dashboard</p>
          </div>
          
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload Invoice
          </Button>
        </header>

        {/* Steve Krug: Key metrics at a glance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Pending Orders"
            value={summary.pending_orders}
            icon={<Package className="w-6 h-6" />}
            urgent={summary.pending_orders > 0}
          />
          <SummaryCard
            title="Urgent Deliveries"
            value={summary.urgent_deliveries}
            icon={<Truck className="w-6 h-6" />}
            urgent={summary.urgent_deliveries > 0}
          />
          <SummaryCard
            title="Pending Invoices"
            value={summary.pending_invoices}
            icon={<FileText className="w-6 h-6" />}
            urgent={summary.pending_invoices > 3}
          />
          <SummaryCard
            title="Outstanding Payments"
            value={summary.outstanding_payments}
            icon={<DollarSign className="w-6 h-6" />}
            urgent={false}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border p-1">
          <div className="flex space-x-1">
            {[
              { id: 'orders', label: 'Purchase Orders', icon: <Package className="w-4 h-4" /> },
              { id: 'deliveries', label: 'Deliveries', icon: <Truck className="w-4 h-4" /> },
              { id: 'invoices', label: 'Invoices', icon: <FileText className="w-4 h-4" /> },
              { id: 'payments', label: 'Payments', icon: <DollarSign className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Purchase Orders</h2>
              <div className="flex space-x-2">
                <Button variant="outline" leftIcon={<Eye className="w-4 h-4" />}>
                  View All
                </Button>
                <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                  Export
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {purchaseOrders.map(order => (
                <PurchaseOrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Invoices</h2>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {invoices.map(invoice => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
          
          <div className="grid md:grid-cols-4 gap-4">
            <QuickActionButton
              icon={<CheckCircle className="w-5 h-5" />}
              title="Confirm Order"
              subtitle="Acknowledge new PO"
              urgent={summary.pending_orders > 0}
            />
            <QuickActionButton
              icon={<Truck className="w-5 h-5" />}
              title="Schedule Delivery"
              subtitle="Set delivery time"
            />
            <QuickActionButton
              icon={<Upload className="w-5 h-5" />}
              title="Submit Invoice"
              subtitle="Upload completed invoice"
            />
            <QuickActionButton
              icon={<DollarSign className="w-5 h-5" />}
              title="Check Payments"
              subtitle="View payment status"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

// Steve Krug: Each card shows status clearly with color coding
const PurchaseOrderCard: React.FC<{ order: PurchaseOrder }> = ({ order }) => (
  <Card className={`p-6 border-l-4 ${
    order.priority === 'urgent' ? 'border-red-500 bg-red-50' : 'border-blue-500'
  }`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{order.id}</h3>
          <p className="text-slate-600">{order.restaurantName}</p>
        </div>
        {order.priority === 'urgent' && (
          <Badge className="bg-red-100 text-red-800">URGENT</Badge>
        )}
      </div>
      
      <div className="text-right">
        <div className="text-2xl font-bold text-slate-800">${order.total}</div>
        <Badge className={getStatusColor(order.status)}>
          {order.status.toUpperCase()}
        </Badge>
      </div>
    </div>
    
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <div>
        <h4 className="font-medium text-slate-700 mb-2">Order Details</h4>
        <div className="space-y-1 text-sm">
          <div>Order Date: {order.orderDate.toLocaleDateString()}</div>
          <div>Delivery: {order.requestedDelivery.toLocaleDateString()}</div>
          <div>Items: {order.items.length}</div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium text-slate-700 mb-2">Items</h4>
        <div className="space-y-1 text-sm">
          {order.items.slice(0, 3).map(item => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name}</span>
              <span>{item.quantity} {item.unit}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="text-slate-500">+{order.items.length - 3} more items</div>
          )}
        </div>
      </div>
    </div>
    
    <div className="flex space-x-3">
      {order.status === 'pending' && (
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirm Order
        </Button>
      )}
      {order.status === 'confirmed' && (
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Truck className="w-4 h-4 mr-2" />
          Mark Shipped
        </Button>
      )}
      <Button variant="outline">
        <Eye className="w-4 h-4 mr-2" />
        View Details
      </Button>
    </div>
  </Card>
);

const InvoiceCard: React.FC<{ invoice: Invoice }> = ({ invoice }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-bold text-slate-800">{invoice.id}</h3>
        <p className="text-slate-600">PO: {invoice.poNumber}</p>
      </div>
      <Badge className={getStatusColor(invoice.status)}>
        {invoice.status.toUpperCase()}
      </Badge>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="flex justify-between">
        <span className="text-slate-600">Amount</span>
        <span className="font-bold text-slate-800">${invoice.amount}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Due Date</span>
        <span className="text-slate-800">{invoice.dueDate.toLocaleDateString()}</span>
      </div>
      {invoice.submittedDate && (
        <div className="flex justify-between">
          <span className="text-slate-600">Submitted</span>
          <span className="text-slate-800">{invoice.submittedDate.toLocaleDateString()}</span>
        </div>
      )}
    </div>
    
    <div className="flex space-x-2">
      {invoice.status === 'draft' && (
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Submit
        </Button>
      )}
      <Button variant="outline" className="flex-1">
        <Eye className="w-4 h-4 mr-2" />
        View
      </Button>
    </div>
  </Card>
);

const SummaryCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  urgent?: boolean;
}> = ({ title, value, icon, urgent }) => (
  <Card className={`p-4 ${urgent ? 'border-l-4 border-red-500 bg-red-50' : ''}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-600">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={urgent ? 'text-red-600' : 'text-slate-600'}>
        {icon}
      </div>
    </div>
  </Card>
);

const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  urgent?: boolean;
}> = ({ icon, title, subtitle, urgent }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`p-4 rounded-lg border-2 text-left transition-colors ${
      urgent 
        ? 'border-red-200 bg-red-50 hover:bg-red-100' 
        : 'border-slate-200 bg-white hover:bg-slate-50'
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className={urgent ? 'text-red-600' : 'text-slate-600'}>
        {icon}
      </div>
      <div>
        <h4 className={`font-medium ${urgent ? 'text-red-800' : 'text-slate-800'}`}>
          {title}
        </h4>
        <p className={`text-sm ${urgent ? 'text-red-600' : 'text-slate-500'}`}>
          {subtitle}
        </p>
      </div>
    </div>
  </motion.button>
);

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'shipped': return 'bg-purple-100 text-purple-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'invoiced': return 'bg-slate-100 text-slate-800';
    case 'draft': return 'bg-orange-100 text-orange-800';
    case 'submitted': return 'bg-blue-100 text-blue-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'paid': return 'bg-emerald-100 text-emerald-800';
    default: return 'bg-slate-100 text-slate-800';
  }
}

export default SupplierPortal;