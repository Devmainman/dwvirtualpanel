import { DollarSign, Users, ShoppingCart, CreditCard, ArrowUp, ArrowDown } from "lucide-react";

export default function StatCard({ icon, title, value, change, trend }) {
  const getIcon = () => {
    switch (icon) {
      case "dollar": return <DollarSign className="text-[#1BB394]" />;
      case "users": return <Users className="text-[#1BB394]" />;
      case "cart": return <ShoppingCart className="text-[#1BB394]" />;
      case "card": return <CreditCard className="text-[#1BB394]" />;
      default: return <DollarSign className="text-[#1BB394]" />;
    }
  };

  return (
    <div className="bg-[#282F36] rounded-lg shadow">
    {/* Top Section */}
    <div className="flex justify-between p-4">
      <div className="w-15 h-15 rounded-sm bg-[#2B333C] flex items-center justify-center">
        <div className="text-teal-400">
          {getIcon()}
        </div>
      </div>
     
      <div className="flex flex-col items-end"> 
        <div className="flex item-end">
      <div className="text-[#aab8c5] text-sm">{title}</div>
      </div>
      <p className="text-3xl font-semibold text-[#aab8c5]">{value}</p>
      </div>
    </div>
  
    
  
    {/* Footer Section with separate background */}
    <div className="bg-[#2B333C] px-4 py-4 flex items-center justify-between">
      <div className={`flex items-center text-xs ${
        trend === "up" ? "text-teal-400" : "text-red-500"
      }`}>
        {trend === "up" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        <span className="ml-1">{change}</span>
        <span className="text-xs text-gray-400 ml-1 hover:text-gray-300 cursor-pointer">Last Month</span>
      </div>
      <span className="text-xs text-gray-400 hover:text-gray-300 cursor-pointer">View More</span>
    </div>
  </div>
  
  );
}