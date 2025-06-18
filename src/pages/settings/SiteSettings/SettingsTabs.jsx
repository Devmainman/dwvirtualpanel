import React from 'react';
import { Settings, Image, Mail } from 'lucide-react';

const SettingsTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'Dashboard', icon: <Settings className="h-4 w-4 mr-2" /> },
    { id: 'Logo', icon: <Image className="h-4 w-4 mr-2" /> },
    { id: 'Icon', icon: <Image className="h-4 w-4 mr-2" /> },
    { id: 'System', icon: <Settings className="h-4 w-4 mr-2" /> },
    { id: 'Email', icon: <Mail className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="flex mb-6 overflow-x-auto border-b border-[#2F3944]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 font-medium flex items-center ${
            activeTab === tab.id 
              ? 'text-blue-400 border-b-2 border-blue-400' 
              : 'text-[#A5AFC4] hover:text-blue-300'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon}
          {tab.id}
        </button>
      ))}
    </div>
  );
};

export default SettingsTabs;