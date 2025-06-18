import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Bell, MessageSquare, Search } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[#22282e]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[rgba(222,226,230,0.4)] z-20 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-blue-600/40 bg-[#282f36] shadow-sm py-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="text-gray-500 focus:outline-none lg:hidden mr-4" 
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>

            {/* Search - hidden on mobile */}
            <div className="relative hidden lg:block">
              <Search className="h-4 w-4 absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-1 text-sm border border-[#aab8c5] rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme / Notification / User */}
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <Bell size={15} />
            </button>
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <MessageSquare size={15} />
            </button>
            <div className="h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
              VP
            </div>
          </div>
        </header>

        {/* Main Content Area with modern scrollbar - Outlet for React Router */}
        <main className="flex flex-1 overflow-hidden">
          <div className="w-full h-full overflow-y-auto custom-scrollbar">
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: rgba(75, 85, 99, 0.3);
                border-radius: 20px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: rgba(75, 85, 99, 0.5);
              }
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: rgba(75, 85, 99, 0.3) transparent;
              }
            `}</style>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}