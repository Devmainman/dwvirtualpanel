// src/components/ActivityTimeline.jsx
import { User, ShoppingCart, Package, Activity } from "lucide-react";

export default function ActivityTimeline() {
  const activities = [
    { 
      icon: "user", 
      title: "New user registered", 
      time: "2 min ago", 
      description: "Jane Cooper has registered as a new user." 
    },
    { 
      icon: "cart", 
      title: "New order placed", 
      time: "45 min ago", 
      description: "Order #RK-1234 has been placed by John Doe." 
    },
    { 
      icon: "package", 
      title: "Product shipped", 
      time: "3 hours ago", 
      description: "Order #RK-1230 has been shipped to Emma Wilson." 
    },
    { 
      icon: "activity", 
      title: "Server issues detected", 
      time: "5 hours ago", 
      description: "Backend server is experiencing high CPU usage." 
    }
  ];

  return (
    <div className="bg-[#282F36] rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-[#A5B8C5]">Recent Activity</h2>
        <button className="text-sm text-indigo-600 hover:text-indigo-700">View All</button>
      </div>
      
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <ActivityItem 
            key={index}
            icon={activity.icon}
            title={activity.title}
            time={activity.time}
            description={activity.description}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, time, description }) {
  const getIcon = () => {
    switch (icon) {
      case "user": return <User className="text-blue-500" />;
      case "cart": return <ShoppingCart className="text-green-500" />;
      case "package": return <Package className="text-orange-500" />;
      case "activity": return <Activity className="text-red-500" />;
      default: return <Activity className="text-gray-500" />;
    }
  };

  return (
    <div className="flex">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2B333C] flex items-center justify-center mr-4">
        {getIcon()}
      </div>
      <div>
        <div className="flex items-center mb-1">
          <h4 className="text-sm font-medium text-[#A5B8C5] mr-2">{title}</h4>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}