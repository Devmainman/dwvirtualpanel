import { useState } from 'react';
import { 
  Image, Settings, Percent, Globe, ToggleLeft, ToggleRight,
  Shield, Users, CreditCard, FileText, Save, Plus
} from 'lucide-react';

export default function NFTSettings() {
  const [settings, setSettings] = useState({
    marketplaceFee: 2.5,
    allowMultiChain: true,
    maxRoyalty: 10,
    featuredCollections: ['CryptoPunks', 'Bored Ape'],
    requireKYC: false,
    moderationEnabled: true,
    paymentMethods: ['ETH', 'USDC', 'DAI']
  });

  const [newCollection, setNewCollection] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  const toggleSetting = (field) => {
    setSettings({...settings, [field]: !settings[field]});
  };

  const addFeaturedCollection = () => {
    if (newCollection && !settings.featuredCollections.includes(newCollection)) {
      setSettings({
        ...settings,
        featuredCollections: [...settings.featuredCollections, newCollection]
      });
      setNewCollection('');
    }
  };

  const addPaymentMethod = () => {
    if (newPaymentMethod && !settings.paymentMethods.includes(newPaymentMethod.toUpperCase())) {
      setSettings({
        ...settings,
        paymentMethods: [...settings.paymentMethods, newPaymentMethod.toUpperCase()]
      });
      setNewPaymentMethod('');
    }
  };

  const removeItem = (arrayName, item) => {
    setSettings({
      ...settings,
      [arrayName]: settings[arrayName].filter(i => i !== item)
    });
  };

  const saveSettings = () => {
    // API call to save settings
    console.log('Saving settings:', settings);
  };

  return (
    <div className="p-4 bg-[#1E232A] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
          <Settings className="h-5 w-5" />
          NFT Platform Settings
        </h1>
        <button 
          onClick={saveSettings}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fees & Royalties */}
        <div className="bg-[#282F36] rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Percent className="h-5 w-5 text-blue-400" />
            Fees & Royalties
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-white">Marketplace Fee</p>
                <p className="text-sm text-[#A5AFC4]">Percentage taken on each sale</p>
              </div>
              <div className="flex items-center w-full sm:w-48">
                <input
                  type="number"
                  value={settings.marketplaceFee}
                  onChange={(e) => setSettings({...settings, marketplaceFee: parseFloat(e.target.value)})}
                  className="bg-[#303943] text-white px-3 py-2 rounded-l-lg w-full"
                  min="0"
                  max="20"
                  step="0.1"
                />
                <span className="bg-[#3A444F] text-[#A5AFC4] px-3 py-2 rounded-r-lg">%</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-white">Max Royalty Percentage</p>
                <p className="text-sm text-[#A5AFC4]">Maximum creators can set</p>
              </div>
              <div className="flex items-center w-full sm:w-48">
                <input
                  type="number"
                  value={settings.maxRoyalty}
                  onChange={(e) => setSettings({...settings, maxRoyalty: parseInt(e.target.value)})}
                  className="bg-[#303943] text-white px-3 py-2 rounded-l-lg w-full"
                  min="0"
                  max="50"
                />
                <span className="bg-[#3A444F] text-[#A5AFC4] px-3 py-2 rounded-r-lg">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Settings */}
        <div className="bg-[#282F36] rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-400" />
            Network Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Multi-chain Support</p>
                <p className="text-sm text-[#A5AFC4]">Allow cross-chain transactions</p>
              </div>
              <button 
                onClick={() => toggleSetting('allowMultiChain')}
                className="flex items-center"
              >
                {settings.allowMultiChain ? (
                  <ToggleRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Content Moderation</p>
                <p className="text-sm text-[#A5AFC4]">Automatically scan for inappropriate content</p>
              </div>
              <button 
                onClick={() => toggleSetting('moderationEnabled')}
                className="flex items-center"
              >
                {settings.moderationEnabled ? (
                  <ToggleRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">KYC Verification</p>
                <p className="text-sm text-[#A5AFC4]">Require identity verification for sellers</p>
              </div>
              <button 
                onClick={() => toggleSetting('requireKYC')}
                className="flex items-center"
              >
                {settings.requireKYC ? (
                  <ToggleRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Featured Collections */}
        <div className="bg-[#282F36] rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Image className="h-5 w-5 text-purple-400" />
            Featured Collections
          </h2>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new collection"
                className="flex-1 bg-[#303943] border border-[#3A444F] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={newCollection}
                onChange={(e) => setNewCollection(e.target.value)}
              />
              <button
                onClick={addFeaturedCollection}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="border border-[#3A444F] rounded-lg p-2 max-h-48 overflow-y-auto">
              {settings.featuredCollections.length > 0 ? (
                settings.featuredCollections.map((collection, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-[#3A444F]/50 rounded">
                    <span className="text-white">{collection}</span>
                    <button 
                      onClick={() => removeItem('featuredCollections', collection)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#6B7280] py-2">No featured collections</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-[#282F36] rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-yellow-400" />
            Payment Methods
          </h2>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new payment method (e.g. BTC)"
                className="flex-1 bg-[#303943] border border-[#3A444F] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value)}
              />
              <button
                onClick={addPaymentMethod}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="border border-[#3A444F] rounded-lg p-2 max-h-48 overflow-y-auto">
              {settings.paymentMethods.length > 0 ? (
                settings.paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-[#3A444F]/50 rounded">
                    <span className="text-white">{method}</span>
                    <button 
                      onClick={() => removeItem('paymentMethods', method)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#6B7280] py-2">No payment methods</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}