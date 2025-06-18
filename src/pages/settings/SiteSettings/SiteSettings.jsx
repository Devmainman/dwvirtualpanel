import { useState, useEffect } from 'react';
import { ChevronRight, Save } from 'lucide-react';
import { Settings } from 'lucide-react';
import { getSettings, saveSettings, getAdminPath } from './settingsService';
import SettingsTabs from './SettingsTabs';
import GeneralSettings from './GeneralSettings';
import LogoSettings from './LogoSettings';
import IconSettings from './IconSettings';
import SystemSettings from './SystemSettings';
import EmailSettings from './EmailSettings';
import { useAuth } from '../../../context/AuthContext';

const SiteSettings = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminPath, setAdminPath] = useState('admin');
  const { token } = useAuth();

  // Load settings and admin path
  useEffect(() => {
    const loadSettings = async () => {
      if (!token) {
        console.error('No auth token available');
        setIsLoading(false);
        return;
      }
      try {
        const [data, path] = await Promise.all([
          getSettings(token),
          getAdminPath(token)
        ]);
        setSettings(data);
        setAdminPath(path);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FormData();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          [reader]: file,
          [`${reader.result}Preview`]: file.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
  try {
    setIsLoading(true);
    await saveSettings(settings, token); // Use token from useAuth
    const newAdminPath = await getAdminPath(token);
    setAdminPath(newAdminPath);
    alert(`Settings saved successfully! Admin panel path updated to: /api/${newAdminPath}`);
  } catch (error) {
    console.error('Failed to save settings:', error);
    alert('Failed to save settings');
  } finally {
    setIsLoading(false);
  }
};

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 flex items-center justify-center">
        <div className="text-[#aab8c5]">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Site Settings</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Admin</span>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Settings</span>
        </div>
      </div>

      {/* Tabs */}
      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'Dashboard' && <GeneralSettings settings={settings} handleInputChange={handleInputChange} />}
      {activeTab === 'Logo' && <LogoSettings settings={settings} handleFileChange={handleFileChange} />}
      {activeTab === 'Icon' && <IconSettings settings={settings} handleFileChange={handleFileChange} />}
      {activeTab === 'System' && <SystemSettings settings={settings} handleInputChange={handleInputChange} />}
      {activeTab === 'Email' && <EmailSettings settings={settings} handleInputChange={handleInputChange} />}

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SiteSettings;