import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  User, 
  LogOut, 
  ChevronDown,
  Home,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUI();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      icon: User,
      label: 'Profile',
      onClick: () => navigate(`/user/${user?.id}`),
    },
    {
      icon: Lock,
      label: 'Change Password',
      onClick: () => navigate(`/user/${user?.id}/password`),
    },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <nav className="bg-white ml-3 shadow-lg border-b border-gray-200 rounded z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            
           
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    Hi, {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-500 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                  >
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.onClick();
                          setDropdownOpen(false);
                        }}
                        className={`
                          w-full flex items-center space-x-3 px-4 py-2 text-left text-sm
                          transition-colors duration-200
                          ${item.danger 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};