import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface BreadcrumbNavigationProps {
  customItems?: BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
  className?: string;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  customItems,
  showHome = true,
  homeHref = '/restaurant',
  className = ''
}) => {
  const pathname = usePathname();

  // Generate breadcrumbs from URL path if no custom items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) {
      return customItems;
    }

    const pathParts = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Add home if requested
    if (showHome) {
      breadcrumbs.push({
        label: 'Dashboard',
        href: homeHref,
        icon: <Home className="w-4 h-4" />
      });
    }

    // Build breadcrumbs from path
    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      
      // Skip the first part if it's 'restaurant' and we already have home
      if (part === 'restaurant' && showHome) {
        return;
      }

      // Convert path part to readable label
      const label = part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Map specific paths to better labels
      const labelMap: { [key: string]: string } = {
        'products': 'Product Catalog',
        'orders': 'Order Management',
        'customers': 'Customer Management',
        'kitchen': 'Kitchen Display',
        'analytics': 'Analytics Dashboard',
        'payments': 'Payment Processing',
        'financials': 'Financial Accounting',
        'inventory': 'Inventory Management',
        'staff': 'Staff Management',
        'marketing': 'Marketing & Campaigns'
      };

      breadcrumbs.push({
        label: labelMap[part] || label,
        href: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs if there's only one item (just home)
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 mb-4 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              )}
              
              {isLast ? (
                <span className="flex items-center gap-1 font-medium text-gray-900">
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  {item.icon}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Pre-configured breadcrumb components for common pages
export const ProductsBreadcrumb = () => (
  <BreadcrumbNavigation
    customItems={[
      { label: 'Dashboard', href: '/restaurant', icon: <Home className="w-4 h-4" /> },
      { label: 'Product Catalog', href: '/restaurant/products' }
    ]}
  />
);

export const OrdersBreadcrumb = () => (
  <BreadcrumbNavigation
    customItems={[
      { label: 'Dashboard', href: '/restaurant', icon: <Home className="w-4 h-4" /> },
      { label: 'Order Management', href: '/restaurant/orders' }
    ]}
  />
);

export const CustomersBreadcrumb = () => (
  <BreadcrumbNavigation
    customItems={[
      { label: 'Dashboard', href: '/restaurant', icon: <Home className="w-4 h-4" /> },
      { label: 'Customer Management', href: '/restaurant/customers' }
    ]}
  />
);

export const KitchenBreadcrumb = () => (
  <BreadcrumbNavigation
    customItems={[
      { label: 'Dashboard', href: '/restaurant', icon: <Home className="w-4 h-4" /> },
      { label: 'Kitchen Display', href: '/restaurant/kitchen' }
    ]}
  />
);

export const AnalyticsBreadcrumb = () => (
  <BreadcrumbNavigation
    customItems={[
      { label: 'Dashboard', href: '/restaurant', icon: <Home className="w-4 h-4" /> },
      { label: 'Analytics Dashboard', href: '/restaurant/analytics' }
    ]}
  />
);

export default BreadcrumbNavigation;