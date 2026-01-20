import React from 'react';
import { Server, CheckCircle, Bell, Share2 } from 'lucide-react';
import SettingCard from './SettingCard';

const SystemSettings = ({ settings, handleInputChange }) => {
  // Toggle a boolean setting
  const handleToggle = (name) => {
    handleInputChange({
      target: {
        name,
        type: 'checkbox',
        checked: !settings[name],
      },
    });
  };

  // Update nested object for signal strength cards
  const handleSignalChange = (key, value) => {
    handleInputChange({
      target: {
        name: 'signalStrength',
        type: 'object',
        value: { ...settings.signalStrength, [key]: value },
      },
    });
  };

  const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

  return (
    <div className="space-y-6">
      {/* System Status */}
      <SettingCard title="System Status" icon={<Server className="h-5 w-5 text-blue-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['systemStatus', 'translationStatus', 'withdrawalStatus'].map((key) => (
            <div key={key} className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings[key] ? 'bg-blue-600' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <label className="ml-2 block text-sm text-[#A5AFC4]">{formatLabel(key)}</label>
            </div>
          ))}
        </div>
      </SettingCard>

      {/* Verification Status */}
      <SettingCard title="Verification Status" icon={<CheckCircle className="h-5 w-5 text-green-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'textedVerificationStatus',
            'idVerificationStatus',
            'emailVerificationStatus',
            'phoneVerificationStatus',
            'addressVerificationStatus',
          ].map((key) => (
            <div key={key} className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings[key] ? 'bg-blue-600' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <label className="ml-2 block text-sm text-[#A5AFC4]">{formatLabel(key)}</label>
            </div>
          ))}
        </div>
      </SettingCard>

      {/* Notification Status */}
      <SettingCard title="Notification Status" icon={<Bell className="h-5 w-5 text-yellow-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['emailNotificationStatus', 'smsNotificationStatus'].map((key) => (
            <div key={key} className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings[key] ? 'bg-blue-600' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <label className="ml-2 block text-sm text-[#A5AFC4]">{formatLabel(key)}</label>
            </div>
          ))}
        </div>
      </SettingCard>

      {/* Other Status */}
      <SettingCard title="Other Status" icon={<Share2 className="h-5 w-5 text-purple-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['trackStatus', 'compleStatus'].map((key) => (
            <div key={key} className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings[key] ? 'bg-blue-600' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <label className="ml-2 block text-sm text-[#A5AFC4]">{formatLabel(key)}</label>
            </div>
          ))}
        </div>
      </SettingCard>

      {/* Signal Strength Cards */}
      {[
        { key: 'copyTrading', label: 'Copy Trading', color: 'indigo' },
        { key: 'tradingPackage', label: 'Trading Package', color: 'teal' },
        { key: 'trading', label: 'Trading', color: 'cyan' },
        { key: 'mining', label: 'Mining', color: 'orange' },
      ].map(({ key, label, color }) => (
        <SettingCard key={key} title={label} icon={<Share2 className={`h-5 w-5 text-${color}-500`} />}>
          <div className="space-y-3">
            <label className="block text-sm text-[#A5AFC4]">{label} Signal Strength (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings?.signalStrength?.[key] ?? 100}
              onChange={(e) => handleSignalChange(key, Number(e.target.value))}
              className="w-full bg-[#1E252C] border border-[#2F3944] rounded-md px-3 py-2 text-white text-sm"
            />
            <p className="text-xs text-gray-400">100% = full · 50% = half · 0% = disabled</p>
          </div>
        </SettingCard>
      ))}
    </div>
  );
};

export default SystemSettings;
