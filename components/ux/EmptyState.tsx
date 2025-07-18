import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  helpText?: string;
  helpLink?: string;
  showQuickTips?: boolean;
  quickTips?: string[];
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  emoji,
  title,
  description,
  primaryAction,
  secondaryAction,
  helpText,
  helpLink,
  showQuickTips = false,
  quickTips = []
}) => {
  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardContent className="flex flex-col items-center justify-center py-12 px-8 text-center">
        {/* Icon/Emoji */}
        <div className="mb-6">
          {emoji ? (
            <div className="text-6xl mb-2">{emoji}</div>
          ) : icon ? (
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              {icon}
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Title and Description */}
        <div className="mb-6 max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {primaryAction && (
            <>
              {primaryAction.href ? (
                <Link href={primaryAction.href}>
                  <Button className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    {primaryAction.label}
                  </Button>
                </Link>
              ) : (
                <Button 
                  onClick={primaryAction.onClick}
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {primaryAction.label}
                </Button>
              )}
            </>
          )}

          {secondaryAction && (
            <>
              {secondaryAction.href ? (
                <Link href={secondaryAction.href}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    {secondaryAction.label}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline"
                  onClick={secondaryAction.onClick}
                  className="w-full sm:w-auto"
                >
                  {secondaryAction.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* Help Text */}
        {helpText && (
          <div className="text-sm text-gray-500 mb-4">
            {helpLink ? (
              <Link href={helpLink} className="text-blue-600 hover:text-blue-800 underline">
                {helpText}
              </Link>
            ) : (
              helpText
            )}
          </div>
        )}

        {/* Quick Tips */}
        {showQuickTips && quickTips.length > 0 && (
          <Card className="w-full max-w-md bg-blue-50 border-blue-200 mt-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Quick Tips
                </span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                {quickTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

// Pre-configured empty states for common scenarios
export const ProductsEmptyState = () => (
  <EmptyState
    emoji="☕"
    title="No products in your menu yet"
    description="Start building your menu by adding your first product. You can add teas, pastries, meals, or any items you serve."
    primaryAction={{
      label: "Add Your First Product",
      href: "/restaurant/products/new"
    }}
    secondaryAction={{
      label: "Import from Template",
      href: "/restaurant/products/templates"
    }}
    helpText="Need help setting up your menu?"
    helpLink="/help/products"
    showQuickTips={true}
    quickTips={[
      "Start with your most popular items",
      "Include clear descriptions and prices",
      "Add photos to increase sales"
    ]}
  />
);

export const OrdersEmptyState = () => (
  <EmptyState
    emoji="🛒"
    title="No orders yet"
    description="Once customers start placing orders, they'll appear here. You can also create test orders to see how the system works."
    primaryAction={{
      label: "Create Test Order",
      href: "/restaurant/orders/new"
    }}
    secondaryAction={{
      label: "View Kitchen Display",
      href: "/restaurant/kitchen"
    }}
    helpText="Learn about order management"
    helpLink="/help/orders"
    showQuickTips={true}
    quickTips={[
      "Orders flow from Pending → Ready → Completed",
      "Use the kitchen display to track preparation",
      "Process payments when orders are ready"
    ]}
  />
);

export const CustomersEmptyState = () => (
  <EmptyState
    emoji="👥"
    title="No customers in your database"
    description="As customers place orders, their information will be stored here. You can also manually add regular customers."
    primaryAction={{
      label: "Add Customer",
      href: "/restaurant/customers/new"
    }}
    secondaryAction={{
      label: "Import Customers",
      href: "/restaurant/customers/import"
    }}
    helpText="Learn about customer management"
    helpLink="/help/customers"
  />
);

export const AnalyticsEmptyState = () => (
  <EmptyState
    emoji="📊"
    title="Analytics will appear here"
    description="Once you have some orders and customer data, you'll see detailed analytics and insights about your restaurant performance."
    primaryAction={{
      label: "Create Sample Data",
      href: "/restaurant/demo-data"
    }}
    secondaryAction={{
      label: "View Reports",
      href: "/restaurant/reports"
    }}
    helpText="Learn about restaurant analytics"
    helpLink="/help/analytics"
    showQuickTips={true}
    quickTips={[
      "Revenue trends show daily, weekly, monthly patterns",
      "Customer insights help improve service",
      "Menu analytics show your best-selling items"
    ]}
  />
);

export default EmptyState;