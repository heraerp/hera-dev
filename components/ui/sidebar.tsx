"use client";

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, Bars3Icon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  current?: boolean;
  children?: { name: string; href: string }[];
}

interface SidebarProps {
  navigation: NavigationItem[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title: string;
  domain: string;
}

export function Sidebar({ navigation, sidebarOpen, setSidebarOpen, title, domain }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (item: NavigationItem) => {
    if (pathname === item.href) return true;
    return item.children?.some(child => pathname === child.href) || false;
  };

  const isChildActive = (childHref: string) => pathname === childHref;

  const NavItem = ({ item }: { item: NavigationItem }) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li>
        <div className="flex items-center">
          <Link
            href={item.href}
            className={cn(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md flex-1',
              isActive
                ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 flex-shrink-0 h-5 w-5',
                isActive 
                  ? 'text-teal-600 dark:text-teal-400' 
                  : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
              )}
            />
            {item.name}
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.name)}
              className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}
        </div>
        
        {hasChildren && (isExpanded || isActive) && (
          <ul className="mt-1 space-y-1 ml-8">
            {item.children?.map((child) => (
              <li key={child.name}>
                <Link
                  href={child.href}
                  className={cn(
                    'group flex items-center px-2 py-1 text-sm rounded-md',
                    isChildActive(child.href)
                      ? 'bg-teal-50 dark:bg-teal-900/10 text-teal-600 dark:text-teal-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-2">
                  <div className="flex h-16 shrink-0 items-center border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h1>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-2">
                      {navigation.map((item) => (
                        <NavItem key={item.name} item={item} />
                      ))}
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            <div className="ml-auto">
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                domain === 'finance' && 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
                domain === 'operations' && 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
                domain === 'sales-marketing' && 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
                domain === 'human-resources' && 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
                !['finance', 'operations', 'sales-marketing', 'human-resources'].includes(domain) && 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
              )}>
                {domain}
              </span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white dark:bg-gray-800 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
          {title}
        </div>
      </div>
    </>
  );
}