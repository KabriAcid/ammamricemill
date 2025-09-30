import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { useUI } from "../../contexts/UIContext";
import { NavigationItem } from "../../config/types";
import { navigationData } from "../../config/navigationData";
import {
  Home, Settings, Users, CreditCard, Package, ShoppingBag, ShoppingCart, TrendingUp, Cog, Plus, Book, BarChart3, MessageSquare, Database, Sliders, Warehouse, Building2, Badge, User, CalendarDays, CalendarCheck, Wallet, ArrowDownCircle, ArrowUpCircle, Banknote, List, Repeat, Layers, UserPlus, AlertCircle, AlertTriangle, Tag, Download, Boxes, Box, BookOpen, Wheat, ClipboardList, Info, PlusSquare, Calendar, FileText, Send,
} from "lucide-react";

const iconMap = {
  home: Home, settings: Settings, users: Users, "credit-card": CreditCard, package: Package, "shopping-bag": ShoppingBag, "shopping-cart": ShoppingCart, "trending-up": TrendingUp, cog: Cog, plus: Plus, book: Book, "bar-chart-3": BarChart3, "message-square": MessageSquare, database: Database, sliders: Sliders, warehouse: Warehouse, "building-2": Building2, badge: Badge, user: User, "calendar-days": CalendarDays, "calendar-check": CalendarCheck, wallet: Wallet, "arrow-down-circle": ArrowDownCircle, "arrow-up-circle": ArrowUpCircle, banknote: Banknote, list: List, repeat: Repeat, layers: Layers, "user-group": UserPlus, "alert-circle": AlertCircle, "alert-triangle": AlertTriangle, tag: Tag, download: Download, boxes: Boxes, box: Box, "book-open": BookOpen, wheat: Wheat, "clipboard-list": ClipboardList, info: Info, "plus-square": PlusSquare, calendar: Calendar, "file-text": FileText, send: Send,
};

interface SidebarItemProps {
  item: NavigationItem;
  level?: number;
  expandedItems: string[];
  toggleExpanded: (id: string) => void;
  closeSidebar?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, level = 0, expandedItems, toggleExpanded, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.link && location.pathname === item.link;
  const isParentActive = item.children?.some(child => location.pathname === child.link);
  const isExpanded = expandedItems.includes(item.id);
  const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Package;

  const handleClick = () => {
    if (hasChildren) {
      toggleExpanded(item.id);
    } else if (item.link) {
      navigate(item.link);
      if (closeSidebar) closeSidebar();
    }
  };

  return (
    <div>
      <motion.button
        onClick={handleClick}
        className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm font-medium rounded-md transition-all duration-200 mx-1 mb-1
          ${isActive || isParentActive ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500 shadow' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
          ${level > 0 ? 'ml-6 pl-6' : ''}`}
        whileHover={{ x: level === 0 ? 4 : 2 }}
        whileTap={{ scale: 0.98 }}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <div className="flex items-center space-x-3">
          <IconComponent size={18} />
          <span>{item.title}</span>
        </div>
        {hasChildren && (
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={16} />
          </motion.div>
        )}
      </motion.button>
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {item.children?.map(child => (
              <SidebarItem key={child.id} item={child} level={level + 1} expandedItems={expandedItems} toggleExpanded={toggleExpanded} closeSidebar={closeSidebar} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { sidebarOpen, closeSidebar } = useUI();
  const [expandedItems, setExpandedItems] = useState<string[]>(["settings"]);
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:fixed lg:left-0 lg:h-[calc(100vh-4rem)] lg:w-80 lg:bg-white lg:shadow-none lg:z-50 lg:flex lg:flex-col">
        <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <img src="/favicon.png" alt="favicon" className="w-8 h-8 object-cover" />
          </div>
          <h1 className="text-xl sm:text-base font-bold text-gray-900 hidden sm:block tracking-tight digit">AMMAM RICE MILL LTD.</h1>
        </div>
        <div className="p-4 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
          <nav className="space-y-1 flex-1">
            {navigationData.map(item => (
              <SidebarItem key={item.id} item={item} expandedItems={expandedItems} toggleExpanded={toggleExpanded} />
            ))}
          </nav>
        </div>
      </aside>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 bg-white shadow-lg flex flex-col h-full">
            <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
              <div className="flex items-center justify-center">
                <img src="/favicon.png" alt="favicon" className="w-8 h-8 object-cover" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight digit">AMMAM RICE MILL LTD.</h1>
              <button className="ml-auto text-gray-400 hover:text-gray-700" onClick={closeSidebar} aria-label="Close sidebar">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 flex-1 flex flex-col overflow-y-auto scrollbar-hide">
              <nav className="space-y-1 flex-1">
                {navigationData.map(item => (
                  <SidebarItem key={item.id} item={item} expandedItems={expandedItems} toggleExpanded={toggleExpanded} closeSidebar={closeSidebar} />
                ))}
              </nav>
            </div>
          </div>
          <div className="flex-1 bg-black/30" onClick={closeSidebar} />
        </div>
      )}
    </>
  );
};
