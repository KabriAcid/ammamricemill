import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useUI } from '../contexts/UIContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen } = useUI();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main 
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'lg:ml-80' : 'lg:ml-80'}
          `}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};