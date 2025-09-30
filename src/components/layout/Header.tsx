import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            icon={Menu}
            onClick={onMenuToggle}
            className="lg:hidden mr-4"
          />
          <div className="hidden lg:block">
            <nav className="flex space-x-8">
              {/* Breadcrumbs or additional navigation could go here */}
            </nav>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon={Bell}
            className="relative"
          />
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={User}
              className="rounded-full p-2"
            />
          </div>
        </div>
      </div>
    </header>
  );
};