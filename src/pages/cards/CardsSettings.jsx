import { useState } from 'react';
import { CreditCard, Tag, Globe, ToggleLeft, ToggleRight } from 'lucide-react';

export default function CardSettings() {
  const [settings, setSettings] = useState({
    cardTypes: [
      { id: 'basic', name: 'Basic', price: 9.99, active: true },
      { id: 'premium', name: 'Premium', price: 49.99, active: true }
    ],
    global: {
      dailyLimit: 1000,
      allowInternational: true
    }
  });

  const toggleCardActive = (id) => {
    setSettings(prev => ({
      ...prev,
      cardTypes: prev.cardTypes.map(card => 
        card.id === id ? {...card, active: !card.active} : card
      )
    }));
  };

  return (
    <div className="p-4 bg-[#1E232A]">
      <h1 className="text-xl font-semibold text-white mb-6">Card Settings</h1>
      
      <div className="space-y-6">
        <div className="bg-[#282F36] p-4 rounded-lg">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Card Types
          </h2>
          
          <div className="space-y-3">
            {settings.cardTypes.map(card => (
              <div key={card.id} className="flex items-center justify-between p-3 bg-[#303943] rounded">
                <div>
                  <p className="text-white">{card.name}</p>
                  <p className="text-sm text-[#A5AFC4]">${card.price}</p>
                </div>
                <button 
                  onClick={() => toggleCardActive(card.id)}
                  className="flex items-center"
                >
                  {card.active ? (
                    <ToggleRight className="h-5 w-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#282F36] p-4 rounded-lg">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Global Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white">Daily Purchase Limit</p>
                <p className="text-sm text-[#A5AFC4]">Maximum cards per day</p>
              </div>
              <input
                type="number"
                value={settings.global.dailyLimit}
                onChange={(e) => setSettings({...settings, global: {
                  ...settings.global,
                  dailyLimit: e.target.value
                }})}
                className="bg-[#303943] text-white px-3 py-2 rounded w-20"
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-white">International Purchases</p>
                <p className="text-sm text-[#A5AFC4]">Allow purchases from other countries</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, global: {
                  ...settings.global,
                  allowInternational: !settings.global.allowInternational
                 } })}
                className="flex items-center"
              >
                {settings.global.allowInternational ? (
                  <ToggleRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}