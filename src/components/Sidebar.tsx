import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Settings,
  Users,
  CreditCard,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Cog,
  Plus,
  Book,
  BarChart3,
  MessageSquare,
  Database,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { NavigationItem } from '../types';

const navigationData: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'home',
    link: '/dashboard',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    children: [
      { id: 'general-setting', title: 'General Setting', icon: 'settings', link: '/setting' },
      { id: 'silo-setting', title: 'Silo Setting', icon: 'settings', link: '/dayar' },
      { id: 'godown-setting', title: 'Godown Setting', icon: 'settings', link: '/godown' },
    ],
  },
  {
    id: 'hr',
    title: 'Human Resource',
    icon: 'users',
    children: [
      { id: 'designation', title: 'Designation List', icon: 'users', link: '/designation' },
      { id: 'employee', title: 'Employee List', icon: 'users', link: '/employee' },
      { id: 'attendance', title: 'Daily Attendance', icon: 'users', link: '/attendance' },
      { id: 'monthly-attendance', title: 'Monthly Attendance', icon: 'users', link: '/attendance/monthly' },
      { id: 'salary', title: 'Salary Sheet', icon: 'users', link: '/salary' },
    ],
  },
  {
    id: 'accounts',
    title: 'Accounts',
    icon: 'credit-card',
    children: [
      { id: 'income-head', title: 'Income Head', icon: 'credit-card', link: '/head-income' },
      { id: 'expense-head', title: 'Expense Head', icon: 'credit-card', link: '/head-expense' },
      { id: 'bank-head', title: 'Bank Head', icon: 'credit-card', link: '/head-bank' },
      { id: 'others-head', title: 'Others Head', icon: 'credit-card', link: '/head-others' },
      { id: 'transactions', title: 'All Transactions', icon: 'credit-card', link: '/transactions' },
    ],
  },
  {
    id: 'party',
    title: 'Party',
    icon: 'users',
    children: [
      { id: 'party-types', title: 'Party Type', icon: 'users', link: '/party-types' },
      { id: 'parties', title: 'Party List', icon: 'users', link: '/parties' },
      { id: 'party-payments', title: 'Party Payments', icon: 'users', link: '/parties/payments' },
      { id: 'party-due', title: 'Party Due', icon: 'users', link: '/parties/due' },
      { id: 'party-debts', title: 'Party Debts', icon: 'users', link: '/parties/debts' },
    ],
  },
  {
    id: 'products',
    title: 'Products',
    icon: 'package',
    children: [
      { id: 'category', title: 'Category', icon: 'package', link: '/category' },
      { id: 'products-list', title: 'Products', icon: 'package', link: '/products' },
    ],
  },
  {
    id: 'empty-bags',
    title: 'Empty Bags',
    icon: 'shopping-bag',
    children: [
      { id: 'emptybag-purchase', title: 'Purchase', icon: 'shopping-bag', link: '/emptybag-purchase' },
      { id: 'emptybag-sales', title: 'Sales', icon: 'shopping-bag', link: '/emptybag-sales' },
      { id: 'emptybag-receive', title: 'Receive', icon: 'shopping-bag', link: '/emptybag-receive' },
      { id: 'emptybag-payment', title: 'Payment', icon: 'shopping-bag', link: '/emptybag-payment' },
      { id: 'emptybag-stocks', title: 'Stocks', icon: 'shopping-bag', link: '/emptybag-stocks' },
    ],
  },
  {
    id: 'purchase',
    title: 'Purchase',
    icon: 'shopping-cart',
    children: [
      { id: 'paddy-purchase', title: 'Paddy Purchase', icon: 'shopping-cart', link: '/purchases' },
      { id: 'paddy-ledger', title: 'Paddy Purchase Ledger', icon: 'shopping-cart', link: '/purchase/ledger' },
      { id: 'rice-purchase', title: 'Rice Purchase', icon: 'shopping-cart', link: '/rice-purchase' },
      { id: 'rice-ledger', title: 'Rice Purchase Ledger', icon: 'shopping-cart', link: '/ricepurchase/ledger' },
    ],
  },
  {
    id: 'sales',
    title: 'Sales',
    icon: 'trending-up',
    children: [
      { id: 'sales-list', title: 'Sales List', icon: 'trending-up', link: '/sales' },
      { id: 'sales-ledger', title: 'Sales Ledger', icon: 'trending-up', link: '/sale/ledger' },
    ],
  },
  {
    id: 'production',
    title: 'Production',
    icon: 'cog',
    children: [
      { id: 'production-order', title: 'Production Order', icon: 'cog', link: '/productions' },
      { id: 'production-details', title: 'Production Details', icon: 'cog', link: '/production/details' },
    ],
  },
  {
    id: 'production-stocks',
    title: 'Production Stocks',
    icon: 'plus',
    children: [
      { id: 'production-stocks-list', title: 'Production Stocks', icon: 'plus', link: '/production-stocks' },
      { id: 'production-stocks-details', title: 'Production Stocks Details', icon: 'plus', link: '/production-stock/details' },
    ],
  },
  {
    id: 'add-stocks',
    title: 'Add Stocks',
    icon: 'plus',
    link: '/addstocks',
  },
  {
    id: 'stocks',
    title: 'Stocks',
    icon: 'book',
    link: '/stocks',
  },
  {
    id: 'godown-stocks',
    title: 'Godown Stocks',
    icon: 'home',
    link: '/stocks-godown',
  },
  {
    id: 'stock-register',
    title: 'Stock Register',
    icon: 'book',
    link: '/stocks/details',
  },
  {
    id: 'reporting',
    title: 'Reporting',
    icon: 'bar-chart-3',
    children: [
      { id: 'daily-report', title: 'Daily Report', icon: 'bar-chart-3', link: '/dailyreport' },
      { id: 'financial-statement', title: 'Financial Statement', icon: 'bar-chart-3', link: '/financial-statement' },
    ],
  },
  {
    id: 'sms',
    title: 'SMS Service',
    icon: 'message-square',
    children: [
      { id: 'sms-templates', title: 'SMS Template', icon: 'message-square', link: '/sms-templates' },
      { id: 'send-sms', title: 'Send SMS', icon: 'message-square', link: '/sendsms' },
    ],
  },
  {
    id: 'backup',
    title: 'Database Backup',
    icon: 'database',
    link: '/backup',
  },
];

const iconMap = {
  home: Home,
  settings: Settings,
  users: Users,
  'credit-card': CreditCard,
  package: Package,
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  'trending-up': TrendingUp,
  cog: Cog,
  plus: Plus,
  book: Book,
  'bar-chart-3': BarChart3,
  'message-square': MessageSquare,
  database: Database,
};

interface SidebarItemProps {
  item: NavigationItem;
  level?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, level = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Package;
  const hasChildren = item.children && item.children.length > 0;
  const isActive = location.pathname === item.link;
  const isParentActive = item.children?.some(child => location.pathname === child.link);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <div>
      <motion.button
        onClick={handleClick}
        className={`
          w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium
          transition-all duration-200 rounded-lg mx-2 mb-1
          ${isActive || isParentActive
            ? 'bg-primary-500 text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
          ${level > 0 ? 'ml-6 pl-8' : ''}
        `}
        whileHover={{ x: level === 0 ? 4 : 2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-3">
          <IconComponent size={18} />
          <span>{item.title}</span>
        </div>
        {hasChildren && (
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={16} />
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {item.children?.map((child) => (
              <SidebarItem key={child.id} item={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { sidebarOpen, closeSidebar } = useUI();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white shadow-sidebar z-50
          overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
          lg:translate-x-0 lg:static lg:z-30
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4">
          {/* Mobile close button */}
          <div className="flex justify-end mb-4 lg:hidden">
            <button
              onClick={closeSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="space-y-1">
            {navigationData.map((item) => (
              <SidebarItem key={item.id} item={item} />
            ))}
          </nav>
        </div>
      </motion.aside>
    </>
  );
};