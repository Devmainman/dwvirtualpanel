import React from 'react';
import { Server, Mail, MessageSquare, CheckCircle, User, Home, Bell, Share2 } from 'lucide-react';
import SettingCard from './SettingCard';

const SystemSettings = ({ settings, handleInputChange, handleSave }) => {
  // Fixed toggle handler that properly uses the current state from settings
  const handleToggle = (name) => {
    handleInputChange({
      target: {
        name,
        type: 'checkbox',
        checked: !settings[name] // Use the current state from settings
      }
    });
  };

  return (
    <div className="space-y-6">
      <SettingCard title="System Status" icon={<Server className="h-5 w-5 text-blue-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('systemStatus')} // Pass the name directly
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.systemStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.systemStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              System Status
            </label>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('translationStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.translationStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.translationStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              Translation Status
            </label>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('withdrawalStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.withdrawalStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.withdrawalStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              Withdrawal Status
            </label>
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Verification Status" icon={<CheckCircle className="h-5 w-5 text-green-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('textedVerificationStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.textedVerificationStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.textedVerificationStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              Texted Verification
            </label>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('idVerificationStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.idVerificationStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.idVerificationStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              ID Verification
            </label>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('emailVerificationStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.emailVerificationStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailVerificationStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              Email Verification
            </label>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('phoneVerificationStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.phoneVerificationStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.phoneVerificationStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              Phone Verification
            </label>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('addressVerificationStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.addressVerificationStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.addressVerificationStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              Address Verification
            </label>
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Notification Status" icon={<Bell className="h-5 w-5 text-yellow-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('emailNotificationStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.emailNotificationStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailNotificationStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              Email Notification
            </label>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('smsNotificationStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.smsNotificationStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.smsNotificationStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              SMS Notification
            </label>
          </div>
        </div>
      </SettingCard>

      <SettingCard title="Other Status" icon={<Share2 className="h-5 w-5 text-purple-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('trackStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.trackStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.trackStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              Track Status
            </label>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('compleStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.compleStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.compleStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              Comple Status
            </label>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleToggle('referralStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.referralStatus ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.referralStatus ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
            <label className="ml-2 block text-sm text-[#A5AFC4]">
              Referral Status
            </label>
          </div>
        </div>
      </SettingCard>

      
    </div>
  );
};

export default SystemSettings;