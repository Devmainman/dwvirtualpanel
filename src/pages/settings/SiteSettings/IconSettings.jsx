import React from 'react';
import { Image } from 'lucide-react';
import SettingCard from './SettingCard';

const IconSettings = ({ settings, handleFileChange }) => {
  return (
    <SettingCard title="Icon Settings" icon={<Image className="h-5 w-5 text-purple-500" />}>
      <div className="flex flex-col items-center">
        {settings.iconPreview ? (
          <img 
            src={settings.iconPreview} 
            alt="Icon Preview" 
            className="h-24 w-24 mb-6 rounded-lg border border-[#3A4451]"
          />
        ) : (
          <div className="h-24 w-24 bg-[#303943] border-2 border-dashed border-[#3A4451] rounded-lg flex items-center justify-center mb-6">
            <span className="text-[#6B7280]">No icon</span>
          </div>
        )}
        <div className="w-full max-w-md">
          <label className="block text-sm font-medium text-[#6B7280] mb-2">Upload Icon</label>
          <div className="flex items-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'icon')}
              className="block w-full text-sm text-[#6B7280] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            />
          </div>
          <p className="mt-2 text-sm text-[#6B7280]">Recommended size: 128x128px, PNG format</p>
        </div>
      </div>
    </SettingCard>
  );
};

export default IconSettings;