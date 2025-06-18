import React from 'react';

const SettingCard = ({ title, icon, children }) => (
  <div className="bg-[#282F36] rounded-lg shadow-md p-6 mb-6 border border-[#2F3944]">
    <h3 className="text-lg font-medium text-[#aab8c5] mb-4 flex items-center">
      {icon}
      <span className="ml-2">{title}</span>
    </h3>
    {children}
  </div>
);

export default SettingCard;