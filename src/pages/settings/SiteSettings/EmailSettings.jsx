import React from 'react';
import { Mail } from 'lucide-react';
import SettingCard from './SettingCard';

const EmailSettings = ({ settings, handleInputChange }) => {
  return (
    <SettingCard title="Email Settings" icon={<Mail className="h-5 w-5 text-red-500" />}>
      <div className="space-y-4">
        {/* SMTP Host */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-sm font-medium text-[#6B7280]">SMTP Host</label>
          <div className="md:col-span-2">
            <input
              type="text"
              name="smtpHost"
              value={settings.smtpHost || 'sandbox.smtp.mbiltrap.io'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* SMTP Port */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-sm font-medium text-[#6B7280]">SMTP Port</label>
          <div className="md:col-span-2">
            <input
              type="number"
              name="smtpPort"
              value={settings.smtpPort || '2525'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* SMTP Encryption */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-sm font-medium text-[#6B7280]">SMTP Encryption</label>
          <div className="md:col-span-2">
            <select
              name="smtpEncryption"
              value={settings.smtpEncryption || 'tls'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        {/* SMTP Username */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-sm font-medium text-[#6B7280]">SMTP Username</label>
          <div className="md:col-span-2">
            <input
              type="text"
              name="smtpUsername"
              value={settings.smtpUsername || '58d43f5520c0e'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* From Name */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-sm font-medium text-[#6B7280]">SMTP Mail From Name</label>
          <div className="md:col-span-2">
            <input
              type="text"
              name="smtpMailFromName"
              value={settings.smtpMailFromName || 'Net-TradersRx'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* From Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-sm font-medium text-[#6B7280]">SMTP Mail From Address</label>
          <div className="md:col-span-2">
            <input
              type="email"
              name="smtpMailFromAddress"
              value={settings.smtpMailFromAddress || 'support@net-tradersfx.org'}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* SMTP Password */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <label className="text-sm font-medium text-[#6B7280]">SMTP Password</label>
          <div className="md:col-span-2">
            <input
              type="password"
              name="smtpPassword"
              value={settings.smtpPassword || ''}
              onChange={handleInputChange}
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>
    </SettingCard>
  );
};

export default EmailSettings;