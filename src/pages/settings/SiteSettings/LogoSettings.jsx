import React from 'react';
import { Image } from 'lucide-react';
import SettingCard from './SettingCard';

const LogoSettings = ({ settings, handleFileChange }) => {
  return (
    <SettingCard title="Logo Settings" icon={<Image className="h-5 w-5 text-blue-500" />}>
      <div className="flex flex-col items-center">
        {settings.logoPreview ? (
          <img 
            src={settings.logoPreview} 
            alt="Logo Preview" 
            className="h-32 mb-6 rounded-lg border border-[#3A4451]"
          />
        ) : (
          <div className="h-32 w-32 bg-[#303943] border-2 border-dashed border-[#3A4451] rounded-lg flex items-center justify-center mb-6">
            <span className="text-[#6B7280]">No logo</span>
          </div>
        )}
        <div className="w-full max-w-md">
          <label className="block text-sm font-medium text-[#6B7280] mb-2">Upload Logo</label>
          <div className="flex items-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'logo')}
              className="block w-full text-sm text-[#6B7280] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
          <p className="mt-2 text-sm text-[#6B7280]">Recommended size: 300x100px, PNG format</p>
        </div>
      </div>
    </SettingCard>
  );
};

export default LogoSettings;