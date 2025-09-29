import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useUI } from "../contexts/UIContext";

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
          <div className="p-6 mt-16">{children}</div>
        </main>
      </div>
    </div>
  );
};
