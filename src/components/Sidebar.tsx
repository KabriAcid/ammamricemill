import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
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
  ChevronRight,
} from "lucide-react";
import { NavigationItem } from "../types";

const navigationData: NavigationItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: "home",
    link: "/dashboard",
  },
  {
    id: "settings",
    title: "Settings",
    icon: "settings",
    children: [
      {
        id: "general-settings",
        title: "General Settings",
        icon: "sliders",
        link: "/settings/general",
      },
      {
        id: "silo-setting",
        title: "Silo Setting",
        icon: "warehouse",
        link: "/settings/silo",
      },
      {
        id: "godown-setting",
        title: "Godown Setting",
        icon: "building-2",
        link: "/godown",
      },
    ],
  },
  {
    id: "hr",
    title: "Human Resource",
    icon: "users",
    children: [
      {
        id: "designation",
        title: "Designation List",
        icon: "badge",
        link: "/designation",
      },
      {
        id: "employee",
        title: "Employee List",
        icon: "user",
        link: "/employee",
      },
      {
        id: "attendance",
        title: "Daily Attendance",
        icon: "calendar-days",
        link: "/attendance",
      },
      {
        id: "monthly-attendance",
        title: "Monthly Attendance",
        icon: "calendar-check",
        link: "/attendance/monthly",
      },
      { id: "salary", title: "Salary Sheet", icon: "wallet", link: "/salary" },
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    icon: "credit-card",
    children: [
      {
        id: "income-head",
        title: "Income Head",
        icon: "arrow-down-circle",
        link: "/head-income",
      },
      {
        id: "expense-head",
        title: "Expense Head",
        icon: "arrow-up-circle",
        link: "/head-expense",
      },
      {
        id: "bank-head",
        title: "Bank Head",
        icon: "banknote",
        link: "/head-bank",
      },
      {
        id: "others-head",
        title: "Others Head",
        icon: "list",
        link: "/head-others",
      },
      {
        id: "transactions",
        title: "All Transactions",
        icon: "repeat",
        link: "/transactions",
      },
    ],
  },
  {
    id: "party",
    title: "Party",
    icon: "users",
    children: [
      {
        id: "party-types",
        title: "Party Type",
        icon: "layers",
        link: "/party-types",
      },
      {
        id: "parties",
        title: "Party List",
        icon: "user-group",
        link: "/parties",
      },
      {
        id: "party-payments",
        title: "Party Payments",
        icon: "credit-card",
        link: "/parties/payments",
      },
      {
        id: "party-due",
        title: "Party Due",
        icon: "alert-circle",
        link: "/parties/due",
      },
      {
        id: "party-debts",
        title: "Party Debts",
        icon: "alert-triangle",
        link: "/parties/debts",
      },
    ],
  },
  {
    id: "products",
    title: "Products",
    icon: "package",
    children: [
      { id: "category", title: "Category", icon: "tag", link: "/category" },
      {
        id: "products-list",
        title: "Products",
        icon: "package",
        link: "/products",
      },
    ],
  },
  {
    id: "empty-bags",
    title: "Empty Bags",
    icon: "shopping-bag",
    children: [
      {
        id: "emptybag-purchase",
        title: "Purchase",
        icon: "shopping-cart",
        link: "/emptybag-purchase",
      },
      {
        id: "emptybag-sales",
        title: "Sales",
        icon: "shopping-bag",
        link: "/emptybag-sales",
      },
      {
        id: "emptybag-receive",
        title: "Receive",
        icon: "download",
        link: "/emptybag-receive",
      },
      {
        id: "emptybag-payment",
        title: "Payment",
        icon: "credit-card",
        link: "/emptybag-payment",
      },
      {
        id: "emptybag-stocks",
        title: "Stocks",
        icon: "boxes",
        link: "/emptybag-stocks",
      },
    ],
  },
  {
    id: "purchase",
    title: "Purchase",
    icon: "shopping-cart",
    children: [
      {
        id: "paddy-purchase",
        title: "Paddy Purchase",
        icon: "leaf",
        link: "/purchases",
      },
      {
        id: "paddy-ledger",
        title: "Paddy Purchase Ledger",
        icon: "book-open",
        link: "/purchase/ledger",
      },
      {
        id: "rice-purchase",
        title: "Rice Purchase",
        icon: "wheat",
        link: "/rice-purchase",
      },
      {
        id: "rice-ledger",
        title: "Rice Purchase Ledger",
        icon: "book-open",
        link: "/ricepurchase/ledger",
      },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    icon: "trending-up",
    children: [
      {
        id: "sales-list",
        title: "Sales List",
        icon: "list",
        link: "/sales",
      },
      {
        id: "sales-ledger",
        title: "Sales Ledger",
        icon: "book-open",
        link: "/sale/ledger",
      },
    ],
  },
  {
    id: "production",
    title: "Production",
    icon: "cog",
    children: [
      {
        id: "production-order",
        title: "Production Order",
        icon: "clipboard-list",
        link: "/productions",
      },
      {
        id: "production-details",
        title: "Production Details",
        icon: "info",
        link: "/production/details",
      },
    ],
  },
  // Group all stocks-related links under a main nav
  {
    id: "stocks",
    title: "Stocks",
    icon: "boxes",
    children: [
      {
        id: "main-stocks",
        title: "Main Stocks",
        icon: "box",
        link: "/stocks",
      },
      {
        id: "godown-stocks",
        title: "Godown Stocks",
        icon: "warehouse",
        link: "/stocks-godown",
      },
      {
        id: "stock-register",
        title: "Stock Register",
        icon: "book",
        link: "/stocks/details",
      },
      {
        id: "add-stocks",
        title: "Add Stocks",
        icon: "plus-square",
        link: "/addstocks",
      },
      {
        id: "production-stocks-list",
        title: "Production Stocks",
        icon: "layers",
        link: "/production-stocks",
      },
      {
        id: "production-stocks-details",
        title: "Production Stocks Details",
        icon: "info",
        link: "/production-stock/details",
      },
      {
        id: "emptybag-stocks",
        title: "Empty Bag Stocks",
        icon: "shopping-bag",
        link: "/emptybag-stocks",
      },
    ],
  },
  {
    id: "reporting",
    title: "Reporting",
    icon: "bar-chart-3",
    children: [
      {
        id: "daily-report",
        title: "Daily Report",
        icon: "calendar",
        link: "/dailyreport",
      },
      {
        id: "financial-statement",
        title: "Financial Statement",
        icon: "file-text",
        link: "/financial-statement",
      },
    ],
  },
  {
    id: "sms",
    title: "SMS Service",
    icon: "message-square",
    children: [
      {
        id: "sms-templates",
        title: "SMS Template",
        icon: "file-text",
        link: "/sms-templates",
      },
      {
        id: "send-sms",
        title: "Send SMS",
        icon: "send",
        link: "/sendsms",
      },
    ],
  },
  {
    id: "backup",
    title: "Database Backup",
    icon: "database",
    link: "/backup",
  },
];

// Add new icons to the iconMap as used above
import {
  Sliders,
  Warehouse,
  Building2,
  Badge,
  User,
  CalendarDays,
  CalendarCheck,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  List,
  Repeat,
  Layers,
  UserPlus,
  AlertCircle,
  AlertTriangle,
  Tag,
  Download,
  Boxes,
  Box,
  BookOpen,
  Wheat,
  ClipboardList,
  Info,
  PlusSquare,
  Calendar,
  FileText,
  Send,
} from "lucide-react";

const iconMap = {
  home: Home,
  settings: Settings,
  users: Users,
  "credit-card": CreditCard,
  package: Package,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingCart,
  "trending-up": TrendingUp,
  cog: Cog,
  plus: Plus,
  book: Book,
  "bar-chart-3": BarChart3,
  "message-square": MessageSquare,
  database: Database,
  sliders: Sliders,
  warehouse: Warehouse,
  "building-2": Building2,
  badge: Badge,
  user: User,
  "calendar-days": CalendarDays,
  "calendar-check": CalendarCheck,
  wallet: Wallet,
  "arrow-down-circle": ArrowDownCircle,
  "arrow-up-circle": ArrowUpCircle,
  banknote: Banknote,
  list: List,
  repeat: Repeat,
  layers: Layers,
  "user-group": UserPlus,
  "alert-circle": AlertCircle,
  "alert-triangle": AlertTriangle,
  tag: Tag,
  download: Download,
  boxes: Boxes,
  box: Box,
  "book-open": BookOpen,
  wheat: Wheat,
  "clipboard-list": ClipboardList,
  info: Info,
  "plus-square": PlusSquare,
  calendar: Calendar,
  "file-text": FileText,
  send: Send,
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
  const isParentActive = item.children?.some(
    (child) => location.pathname === child.link
  );

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
          ${
            isActive || isParentActive
              ? "bg-primary-500 text-white shadow-md"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }
          ${level > 0 ? "ml-6 pl-8" : ""}
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
            animate={{ height: "auto", opacity: 1 }}
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
  // Always visible, fixed on LG screens, no scrollbar
  return (
    <aside
      className="
        hidden lg:block
        lg:fixed lg:left-0 lg:h-[calc(100vh-4rem)] lg:w-80 lg:bg-white lg:shadow-none lg:z-50
        lg:flex lg:flex-col
      "
    >
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <img
            src="/favicon.png"
            alt="favicon"
            className="w-8 h-8 object-cover"
          />
        </div>
        <h1 className="text-xl sm:text-base font-bold text-gray-900 hidden sm:block tracking-tight digit">
          AMMAM RICE MILL LTD.
        </h1>
      </div>
      <div className="p-4 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
        <nav className="space-y-1 flex-1">
          {navigationData.map((item) => (
            <SidebarItem key={item.id} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
};
