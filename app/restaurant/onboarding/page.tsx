'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Store, Users, Package, Loader2 } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

export default function RestaurantOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'supplier',
      title: 'Add Your First Supplier',
      description: 'Add a supplier to start managing your inventory and purchases',
      icon: Store,
      completed: false
    },
    {
      id: 'menu',
      title: 'Create a Menu Item',
      description: 'Add your first menu item to track recipes and costs',
      icon: Package,
      completed: false
    },
    {
      id: 'team',
      title: 'Invite Your Team',
      description: 'Add team members and assign their roles',
      icon: Users,
      completed: false
    }
  ]);

  const handleStepComplete = () => {
    const newSteps = [...steps];
    newSteps[currentStep].completed = true;
    setSteps(newSteps);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    router.push('/restaurant/dashboard');
  };

  const handleComplete = async () => {
    setIsLoading(true);
    // Mark onboarding as complete in the database
    // For now, just redirect to dashboard
    setTimeout(() => {
      router.push('/restaurant/dashboard');
    }, 1000);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'supplier':
        return <SupplierStep onComplete={handleStepComplete} />;
      case 'menu':
        return <MenuItemStep onComplete={handleStepComplete} />;
      case 'team':
        return <TeamStep onComplete={handleStepComplete} />;
      default:
        return null;
    }
  };

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Your Restaurant!</h1>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Skip Setup →
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Quick Setup</span>
            <span className="text-sm font-medium text-gray-900">
              {completedSteps} of {steps.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = step.completed;

              return (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index < steps.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-center ${
                  index === currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                <p className="text-sm font-medium">{step.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepContent()}
      </div>

      {/* Footer Actions */}
      {completedSteps === steps.length && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  🎉 Setup Complete!
                </h3>
                <p className="text-sm text-gray-600">
                  Your restaurant is ready to go
                </p>
              </div>
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Loading...
                  </>
                ) : (
                  <>
                    Go to Dashboard
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Supplier Step Component
function SupplierStep({ onComplete }: { onComplete: () => void }) {
  const [supplierName, setSupplierName] = useState('');
  const [category, setCategory] = useState('produce');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 1500);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Add Your First Supplier
      </h2>
      <p className="text-gray-600 mb-6">
        Suppliers are your vendors for ingredients, supplies, and services
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier Name
          </label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Fresh Valley Farms"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="produce">Produce</option>
            <option value="meat">Meat & Seafood</option>
            <option value="dairy">Dairy</option>
            <option value="dry_goods">Dry Goods</option>
            <option value="beverages">Beverages</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !supplierName.trim()}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Adding Supplier...
            </>
          ) : (
            'Add Supplier'
          )}
        </button>
      </form>
    </div>
  );
}

// Menu Item Step Component
function MenuItemStep({ onComplete }: { onComplete: () => void }) {
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !price) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 1500);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Create Your First Menu Item
      </h2>
      <p className="text-gray-600 mb-6">
        Add a popular dish from your menu to track ingredients and costs
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Menu Item Name
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Margherita Pizza"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !itemName.trim() || !price}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Creating Menu Item...
            </>
          ) : (
            'Create Menu Item'
          )}
        </button>
      </form>
    </div>
  );
}

// Team Step Component
function TeamStep({ onComplete }: { onComplete: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('waiter');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 1500);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Invite Your First Team Member
      </h2>
      <p className="text-gray-600 mb-6">
        Add team members to help manage your restaurant
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Member Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="staff@restaurant.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="manager">Manager</option>
            <option value="chef">Chef</option>
            <option value="waiter">Waiter</option>
            <option value="cashier">Cashier</option>
            <option value="host">Host</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Sending Invitation...
            </>
          ) : (
            'Send Invitation'
          )}
        </button>
      </form>

      <div className="mt-4 p-4 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          Team members will receive an email invitation to join your restaurant
        </p>
      </div>
    </div>
  );
}