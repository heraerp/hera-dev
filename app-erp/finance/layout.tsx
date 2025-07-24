"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { CurrencyDollarIcon, BookOpenIcon, ArrowDownCircleIcon, ArrowUpCircleIcon, ViewfinderCircleIcon, BanknotesIcon, CpuChipIcon } from '@heroicons/react/24/outline';

const financeNavigation = [
  {
    name: 'Finance Overview',
    href: '/app-erp/finance',
    icon: CurrencyDollarIcon,
    current: false,
  },
  {
    name: 'General Ledger',
    href: '/app-erp/finance/gl',
    icon: BookOpenIcon,
    current: false,
    children: [
      { name: 'Chart of Accounts', href: '/app-erp/finance/gl/accounts' },
      { name: 'Journal Entries', href: '/app-erp/finance/gl/transactions' },
      { name: 'GL Intelligence', href: '/app-erp/finance/gl/intelligence' },
    ],
  },
  {
    name: 'Accounts Receivable',
    href: '/app-erp/finance/ar',
    icon: ArrowDownCircleIcon,
    current: false,
    children: [
      { name: 'Customer Invoices', href: '/app-erp/finance/ar/invoices' },
      { name: 'Payments', href: '/app-erp/finance/ar/payments' },
      { name: 'Aging Analysis', href: '/app-erp/finance/ar/aging' },
    ],
  },
  {
    name: 'Accounts Payable',
    href: '/app-erp/finance/ap',
    icon: ArrowUpCircleIcon,
    current: false,
    children: [
      { name: 'Vendor Bills', href: '/app-erp/finance/ap/bills' },
      { name: 'Payments', href: '/app-erp/finance/ap/payments' },
      { name: 'Approvals', href: '/app-erp/finance/ap/approvals' },
    ],
  },
  {
    name: 'Budget Control',
    href: '/app-erp/finance/budget',
    icon: ViewfinderCircleIcon,
    current: false,
  },
  {
    name: 'Cash Management',
    href: '/app-erp/finance/cash',
    icon: BanknotesIcon,
    current: false,
  },
  {
    name: 'Digital Accountant',
    href: '/app-erp/finance/digital-accountant',
    icon: CpuChipIcon,
    current: false,
  },
];

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        navigation={financeNavigation}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        title="Financial Management"
        domain="finance"
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}