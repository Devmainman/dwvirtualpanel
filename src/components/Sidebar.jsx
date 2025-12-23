import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  X, Home, User, MessageSquare, Repeat, Package, 
  AlertCircle, FileText, DollarSign, Clipboard,
  LifeBuoy, Settings, ChevronDown, ChevronRight, 
  CreditCard, CheckCircle, MapPin, UserCheck, History, Image,
  Cpu, Drill, Zap, Award, Users, BarChart, Copy,
} from "lucide-react";

const SidebarItem = ({ icon, text, to, hasChildren = false, expanded = false, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  return (
    <div className="w-full">
      {hasChildren ? (
        <button 
          className={`flex items-center rounded-lg justify-between w-55 px-3 py-2 text-sm mb-1 transition-all duration-200 ${
            isActive
              ? "bg-[#303943] text-white" 
              : "text-[#A5AFC4] hover:bg-[#303943] hover:text-white"
          }`}
          onClick={onClick}
        >
          <div className="flex items-center">
            <span className="mr-2">{icon}</span>
            <span className="font-medium">{text}</span>
          </div>
          <span className="text-[#A5AFC4]">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>
      ) : (
        <Link 
          to={to} 
          className={`flex items-center rounded-lg px-3 py-2 text-sm mb-1 transition-all duration-200 ${
            isActive
              ? "bg-[#303943] text-white font-medium" 
              : "text-[#A5AFC4] hover:bg-[#303943] hover:text-white"
          }`}
        >
          <span className="mr-2">{icon}</span>
          <span className="font-medium">{text}</span>
        </Link>
      )}
    </div>
  );
};

const NestedItem = ({ text, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center pl-10 py-1.5 text-xs mb-1 ${
        isActive 
          ? "text-white font-medium" 
          : "text-[#A5AFC4] hover:text-white"
      }`}
    >
      <span>{text}</span>
    </Link>
  );
};

export default function Sidebar({ sidebarOpen, toggleSidebar }) {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = (menuName) => {
    if (expandedMenu === menuName) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(menuName);
    }
  };

  const isMenuExpanded = (menuName) => expandedMenu === menuName;

  return (
    <aside 
      className={`fixed lg:relative border-r border-blue-600/40 top-0 left-0 z-30 w-64 h-screen bg-[#282F36] transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 h-[65px] flex-shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-2">
            <div className="w-4 h-4 bg-indigo-600 rounded-sm"></div>
          </div>
          <span className="text-lg font-bold text-white">VisualPanel</span>
        </div>
        <button className="text-white lg:hidden" onClick={toggleSidebar}>
          <X size={18} />
        </button>
      </div>
      
      <div className="ml-[12px] max-w-[calc(100%-30px)] border-b border-gray-700"/>

      {/* Scrollable Content */}
      <div className="h-[calc(100vh-65px)] overflow-y-auto px-3 custom-scrollbar">
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
           
        <nav className="space-y-1 py-2">
          <SidebarItem 
            icon={<Home size={16} />} 
            text="Dashboard" 
            to="/"
          />
          
          <SidebarItem 
            icon={<User size={16} />} 
            text="Manage Users" 
            to="/users"
          />
          
          <SidebarItem 
            icon={<UserCheck size={16} />} 
            text="Verification" 
            to="/verification"
            hasChildren={true}
            expanded={isMenuExpanded("verification")}
            onClick={() => toggleMenu("verification")}
          />
          {isMenuExpanded("verification") && (
            <div className="ml-1 mt-1 pl-2 border-l border-gray-700">
              <NestedItem text="ID Verification" to="/verification/id" />
              <NestedItem text="Facial Verification" to="/verification/facial" />
              <NestedItem text="Address Verification" to="/verification/address" />
            </div>
          )}
          
          <SidebarItem 
            icon={<MessageSquare size={16} />} 
            text="Messaging" 
            to="/messaging"
          />

          <SidebarItem 
            icon={<History size={16} />} 
            text="Browsing History" 
            to="/browsinghistory"
          />

          <SidebarItem 
            icon={<Image size={16} />} 
            text="NFT Trading" 
            to="/nfttrading"  // ✅ Lowercase to match App.jsx
            hasChildren={true}
            expanded={isMenuExpanded("nfttrading")}  // ✅ Match with route key
            onClick={() => toggleMenu("nfttrading")}  // ✅ Match with route key
          />
          {isMenuExpanded("nfttrading") && (
            <div className="ml-1 mt-1 pl-2 border-l border-gray-700">
              <NestedItem text="NFT Store" to="/nfttrading/nftStores" />  {/* ✅ Lowercase base path */}
              <NestedItem text="NFT Settings" to="/nfttrading/nftSettings" />  {/* ✅ Lowercase base path */}
            </div>
          )}


          
          
          <SidebarItem 
            icon={<Repeat size={16} />} 
            text="Trades" 
            to="/trades"
            hasChildren={true}
            expanded={isMenuExpanded("trades")}
            onClick={() => toggleMenu("trades")}
          />
          {isMenuExpanded("trades") && (
            <div className="ml-1 mt-1 pl-2 border-l border-gray-700">
              <NestedItem text="Active Trades" to="/trades/active" />
              <NestedItem text="Trade Setting" to="/trades/settings" />
            </div>
          )}

          <SidebarItem 
            icon={<CreditCard size={16} />} 
            text="Cards" 
            to="/cards"
            hasChildren={true}
            expanded={isMenuExpanded("cards")}
            onClick={() => toggleMenu("cards")}
          />
          {isMenuExpanded("cards") && (
            <div className="ml-1 mt-1 pl-2 border-l border-gray-700">
              <NestedItem text="Cards Settings" to="/cards/cardssettings" />
              <NestedItem text="Purchased Cards" to="/cards/purchasedcards" />
            </div>
          )}
          
          <SidebarItem 
            icon={<Package size={16} />} 
            text="Accounts Package" 
            to="/accounts-package"
          />
          
          <SidebarItem 
            icon={<AlertCircle size={16} />} 
            text="Popup" 
            to="/popup"
            hasChildren={true}
            expanded={isMenuExpanded("popup")}
            onClick={() => toggleMenu("popup")}
          />
          {isMenuExpanded("popup") && (
            <div className="ml-1 mt-1 pl-2 border-l border-gray-700">
              <NestedItem text="Form" to="/popup/form" />
              <NestedItem text="Invoice" to="/popup/invoice" />
              <NestedItem text="Popup Messages" to="/popup/messages" />
            </div>
          )}
          
          <SidebarItem 
            icon={<CreditCard size={16} />} 
            text="Transactions" 
            to="/transactions"
            hasChildren={true}
            expanded={isMenuExpanded("transactions")}
            onClick={() => toggleMenu("transactions")}
          />
          {isMenuExpanded("transactions") && (
            <div className="ml-1 mt-1 pl-2 border-l border-gray-700">
              <NestedItem text="Deposit" to="/transactions/deposit" />
              <NestedItem text="Withdrawal" to="/transactions/withdrawal" />
              <NestedItem text="Upgrade Invoice" to="/transactions/upgrade-invoice" />
              <NestedItem text="Other Invoice" to="/transactions/other-invoice" />
              <NestedItem text="Bot Invoice" to="/transactions/bot-invoice" />
              <NestedItem text="Signal Invoice" to="/transactions/signal-invoice" />
              <NestedItem text="Card Invoice" to="/transactions/card-invoice" />
            </div>
          )}
          
          <SidebarItem 
            icon={<Clipboard size={16} />} 
            text="Manage Assignments" 
            to="/assignments"
            hasChildren={true}
            expanded={isMenuExpanded("assignments")}
            onClick={() => toggleMenu("assignments")}
          />
          {isMenuExpanded("assignments") && (
            <div className="ml-1 mt-1 pl-2 border-l border-gray-700">
              <NestedItem text="Popup" to="/assignments/popup" />
              <NestedItem text="Forms" to="/assignments/forms" />
              <NestedItem text="Invoice" to="/assignments/invoice" />
            </div>
          )}
          
          <SidebarItem 
            icon={<DollarSign size={16} />} 
            text="Withdrawal Token" 
            to="/withdrawal-token"
          />
          
          <SidebarItem 
            icon={<LifeBuoy size={16} />} 
            text="Support" 
            to="/support"
          />

          <SidebarItem 
            icon={<Cpu size={16} />} 
            text="Mining" 
            to="/mining"
            hasChildren={true}
            expanded={isMenuExpanded("mining")}
            onClick={() => toggleMenu("mining")}
          />
          {isMenuExpanded("mining") && (
            <div className="ml-1 mt-1 pl-2 border-l border-gray-700">
              <NestedItem text="Overview" to="/mining/overview" />
              <NestedItem text="Pools" to="/mining/pools" />
              <NestedItem text="Equipment" to="/mining/equipment" />
              <NestedItem text="Sessions" to="/mining/sessions" />
              <NestedItem text="Rewards" to="/mining/rewards" />
              <NestedItem text="Boosters" to="/mining/boosters" />
              <NestedItem text="Analytics" to="/mining/analytics" />
              <NestedItem text="User Stats" to="/mining/user-stats" />
            </div>
          )}

          <SidebarItem 
  icon={<Copy size={16} />} 
  text="Copy Trading" 
  to="/copy-trading"
/>
          
          <SidebarItem 
            icon={<Settings size={16} />} 
            text="Settings" 
            to="/settings"
            hasChildren={true}
            expanded={isMenuExpanded("settings")}
            onClick={() => toggleMenu("settings")}
          />
          {isMenuExpanded("settings") && (
            <div className="ml-1 mt-1 pl-2 border-l border-gray-700">
              <NestedItem text="Deposit Settings" to="/settings/depositsettings" />
              <NestedItem text="Withdrawal Settings" to="/settings/withdrawalsettings" />
              <NestedItem text="Currency Settings" to="/settings/currency" />
              <NestedItem text="Site Settings" to="/settings/sitesettings" />
              <NestedItem text="Trading Mode" to="/settings/trading-mode" />

            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}