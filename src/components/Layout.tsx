import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-80 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="p-3 sm:p-6 mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
