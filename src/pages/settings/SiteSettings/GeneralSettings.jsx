import React from 'react';
import { useState, useEffect } from 'react';
import { Globe, Link, Mail, Signal, Settings } from 'lucide-react';
import SettingCard from './SettingCard';

const GeneralSettings = ({ settings, handleInputChange }) => {
  const validateAdminPath = (value) => {
    if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
      return 'Admin Path must contain only letters, numbers, hyphens, or underscores';
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <SettingCard title="Website Settings" icon={<Globe className="h-5 w-5 text-blue-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Website Title</label>
            <input
              type="text"
              name="websiteName"
              value={settings.websiteName || ''}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Frontend URL</label>
            <input
              type="text"
              name="frontendURL"
              value={settings.frontendURL || 'https://www.website.com'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Admin Path</label>
            <input
              type="text"
              name="websiteUrl"
              value={settings.websiteUrl || ''}
              onChange={(e) => {
                handleInputChange(e);
                
              }}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., secret-admin-123"
            />
            <p className="text-xs text-[#6B7280] mt-1">Enter a custom path for the admin panel (letters, numbers, hyphens, underscores only).</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Logout URL</label>
            <input
              type="text"
              name="logoutUrl"
              value={settings.logoutUrl || 'Enter Your LogoutUrl'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Other Settings" icon={<Settings className="h-5 w-5 text-purple-500" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="">
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Admin Email</label>
            <input
              type="email"
              name="adminEmail"
              value={settings.adminEmail || 'nojigpotal@gmail.com'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="">
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Signal Strength Limit</label>
            <input
              type="text"
              name="signalStrengthLimit"
              value={settings.signalStrengthLimit || 'Signal strength Limit'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Referral Commission</label>
            <input
              type="number"
              name="referralCommission"
              value={settings.referralCommission || '0'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1">Default Max. Threshold</label>
            <input
              type="number"
              name="defaultThreshold"
              value={settings.defaultThreshold || '0'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </SettingCard>
    </div>
  );
};

export default GeneralSettings;