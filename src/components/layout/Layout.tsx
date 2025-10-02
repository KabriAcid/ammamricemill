import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { UIProvider } from "../../contexts/UIContext";

export const Layout: React.FC = () => {
  return (
    <UIProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-80">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 px-6 py-8 mt-16">
            <Outlet />
          </main>
        </div>
      </div>
    </UIProvider>
  );
};
