import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Save,
  X,
  ArrowLeft,
  Shield,
  Users,
  TrendingUp,
  DollarSign,
  Copy,
  BarChart,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  Globe,
  Percent,
  Calendar,
  Upload,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw, Edit2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';

const TraderEdit = () => {
  const { traderId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trader, setTrader] = useState({
    username: '',
    email: '',
    fullName: '',
    bio: '',
    isActive: true,
    verified: false,
    maxCopiers: 50,
    minCopyAmount: 10,
    commissionRate: 15,
    socialLinks: {
      twitter: '',
      telegram: '',
      discord: ''
    },
    performance: {
      netProfit: 0,
      winRate: 0,
      totalTrades: 0,
      profitFactor: 0,
      maxDrawdown: 0
    },
    tradingStyle: '',
    riskLevel: 'medium',
    preferredMarkets: ['Crypto'],
    experienceYears: 1
  });
  
  const [performanceStats, setPerformanceStats] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    totalLoss: 0,
    averageWin: 0,
    averageLoss: 0,
    largestWin: 0,
    largestLoss: 0,
    consecutiveWins: 0,
    consecutiveLosses: 0
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch trader details
  useEffect(() => {
    fetchTraderDetails();
    fetchPerformanceStats();
  }, [traderId]);

  const fetchTraderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/admin/copy-trading/traders/${traderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response?.data?.success) {
      setTrader(prev => ({
    ...prev,
    ...response.data.trader,
    socialLinks: {
      twitter: response.data.trader?.socialLinks?.twitter || '',
      telegram: response.data.trader?.socialLinks?.telegram || '',
      discord: response.data.trader?.socialLinks?.discord || ''
    },
    preferredMarkets: response.data.trader?.preferredMarkets || []
  }));
      } else {
        toast.error(response?.data?.error || 'Failed to load trader details');
      }
    } catch (error) {
      console.error('Error fetching trader details:', error);
      toast.error('Failed to load trader details');
    } finally {
      setLoading(false);
    }
  };

const fetchPerformanceStats = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/copy-trading/traders/${traderId}/analytics`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response?.data?.success) {
      const stats = response.data.stats || {};

      setPerformanceStats(prev => ({
        ...prev,
        totalTrades: stats.totalTrades ?? 0,
        winningTrades: stats.winningTrades ?? 0,
        losingTrades: stats.losingTrades ?? 0,
        totalProfit: stats.totalProfit ?? 0,
        totalLoss: stats.totalLoss ?? 0,
        averageWin: stats.averageWin ?? 0,
        averageLoss: stats.averageLoss ?? 0,
        largestWin: stats.largestWin ?? 0,
        largestLoss: stats.largestLoss ?? 0,
        consecutiveWins: stats.consecutiveWins ?? 0,
        consecutiveLosses: stats.consecutiveLosses ?? 0
      }));
    }
  } catch (error) {
    console.error('Error fetching performance stats:', error);
  }
};



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTrader(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) : value
        }
      }));
    } else if (type === 'checkbox') {
      setTrader(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setTrader(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setTrader(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSocialLinkChange = (platform, value) => {
    setTrader(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handlePreferredMarketsChange = (market) => {
    setTrader(prev => {
      const markets = [...prev.preferredMarkets];
      if (markets.includes(market)) {
        return { ...prev, preferredMarkets: markets.filter(m => m !== market) };
      } else {
        return { ...prev, preferredMarkets: [...markets, market] };
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await axios.put(
        `${API_BASE_URL}/admin/copy-trading/traders/${traderId}/profile`,
        trader,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response?.data?.success) {
        toast.success('Trader details updated successfully');
        navigate('/copy-trading/trader-management');
      } else {
        toast.error(response?.data?.error || 'Failed to update trader');
      }
    } catch (error) {
      console.error('Error updating trader:', error);
      toast.error('Failed to update trader details');
    } finally {
      setSaving(false);
    }
  };

//   const handleResetPassword = async () => {
//     if (newPassword !== confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }
    
//     if (newPassword.length < 6) {
//       toast.error('Password must be at least 6 characters long');
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/admin/copy-trading/traders/${traderId}/reset-password`,
//         { newPassword },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       if (response?.data?.success) {
//         toast.success('Password reset successfully');
//         setNewPassword('');
//         setConfirmPassword('');
//         setShowPassword(false);
//       } else {
//         toast.error(response?.data?.error || 'Failed to reset password');
//       }
//     } catch (error) {
//       console.error('Error resetting password:', error);
//       toast.error('Failed to reset password');
//     }
//   };

//   const handleUpdateCommission = async () => {
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/admin/copy-trading/traders/${traderId}/update-commission`,
//         { commissionRate: trader.commissionRate },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       if (response?.data?.success) {
//         toast.success('Commission rate updated successfully');
//         setShowCommissionModal(false);
//       } else {
//         toast.error(response?.data?.error || 'Failed to update commission');
//       }
//     } catch (error) {
//       console.error('Error updating commission:', error);
//       toast.error('Failed to update commission');
//     }
//   };

  const handleActivationToggle = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/copy-trading/traders/${traderId}/status`,
        { isActive: !trader.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response?.data?.success) {
        setTrader(prev => ({ ...prev, isActive: !prev.isActive }));
        toast.success(`Trader ${!trader.isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response?.data?.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling activation:', error);
      toast.error('Failed to update trader status');
    }
  };

  const handleVerificationToggle = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/copy-trading/traders/${traderId}/verification`,
        { verified: !trader.verified },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response?.data?.success) {
        setTrader(prev => ({ ...prev, verified: !prev.verified }));
        toast.success(`Trader ${!trader.verified ? 'verified' : 'unverified'} successfully`);
      } else {
        toast.error(response?.data?.error || 'Failed to update verification');
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A] h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="text-gray-400 mt-4">Loading trader details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A] h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/copy-trading/trader-management')}
            className="p-2 bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-white">Edit Trader</h1>
            <p className="text-gray-400 text-sm mt-1">Modify trader account settings and details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/copy-trading/trader/${traderId}/trades`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center text-sm"
          >
            <Eye size={16} className="mr-2" />
            View Trades
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center text-sm disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-[#282F36] rounded-lg shadow-xl border border-[#303943]/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={20} />
              Profile Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={trader.username}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={trader.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={trader.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Experience (Years)</label>
                <input
                  type="number"
                  name="experienceYears"
                  value={trader.experienceYears}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={trader.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe trading style, experience, and strategy..."
                />
              </div>
            </div>
          </div>

          {/* Trading Settings Card */}
          <div className="bg-[#282F36] rounded-lg shadow-xl border border-[#303943]/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target size={20} />
              Trading Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Trading Style</label>
                <select
                  name="tradingStyle"
                  value={trader.tradingStyle}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Style</option>
                  <option value="scalping">Scalping</option>
                  <option value="day-trading">Day Trading</option>
                  <option value="swing-trading">Swing Trading</option>
                  <option value="position-trading">Position Trading</option>
                  <option value="algorithmic">Algorithmic</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Risk Level</label>
                <select
                  name="riskLevel"
                  value={trader.riskLevel}
                  onChange={handleInputChange}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Max Copiers</label>
                <input
                  type="number"
                  name="maxCopiers"
                  value={trader.maxCopiers}
                  onChange={handleInputChange}
                  min="1"
                  max="1000"
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Min Copy Amount ($)</label>
                <input
                  type="number"
                  name="minCopyAmount"
                  value={trader.minCopyAmount}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Preferred Markets</label>
                <div className="flex flex-wrap gap-2">
                  {['Crypto', 'Forex', 'Stocks', 'Commodities', 'Indices', 'Options'].map((market) => (
                    <button
                      key={market}
                      type="button"
                      onClick={() => handlePreferredMarketsChange(market)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        (trader.preferredMarkets || []).includes(market)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[#1E232A] text-[#A5AFC4] hover:bg-[#303943]'
                      }`}
                    >
                      {market}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Card */}
          <div className="bg-[#282F36] rounded-lg shadow-xl border border-[#303943]/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe size={20} />
              Social Links
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Twitter Profile</label>
                <input
                  type="text"
                  value={trader.socialLinks?.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Telegram Channel</label>
                <input
                  type="text"
                  value={trader.socialLinks?.telegram || ''}
                  onChange={(e) => handleSocialLinkChange('telegram', e.target.value)}
                  placeholder="https://t.me/username"
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Discord Server</label>
                <input
                  type="text"
                  value={trader.socialLinks?.discord || ''}
                  onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
                  placeholder="https://discord.gg/invite-code"
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-[#282F36] rounded-lg shadow-xl border border-[#303943]/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={20} />
              Account Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#A5AFC4]">Status</span>
                <button
                  onClick={handleActivationToggle}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    trader.isActive
                      ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                      : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                  }`}
                >
                  {trader.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[#A5AFC4]">Verification</span>
                <button
                  onClick={handleVerificationToggle}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    trader.verified
                      ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                      : 'bg-gray-900/30 text-gray-400 hover:bg-gray-900/50'
                  }`}
                >
                  {trader.verified ? 'Verified' : 'Unverified'}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[#A5AFC4]">Commission Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{trader.commissionRate}%</span>
                  <button
                    onClick={() => setShowCommissionModal(true)}
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-[#303943]">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-full px-4 py-2 bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] rounded-lg flex items-center justify-center text-sm"
                >
                  {showPassword ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                  {showPassword ? 'Hide Password Reset' : 'Reset Password'}
                </button>
                
                {showPassword && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    {/* <button
                      onClick={handleResetPassword}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                    >
                      Reset Password
                    </button> */}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Stats Card */}
          <div className="bg-[#282F36] rounded-lg shadow-xl border border-[#303943]/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart size={20} />
              Performance Statistics
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#A5AFC4] text-sm">Total Trades</span>
                <span className="text-white font-medium">{performanceStats?.totalTrades ?? 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#A5AFC4] text-sm">Win Rate</span>
                <span className="text-green-400 font-medium">
                  {performanceStats.totalTrades > 0
                    ? ((performanceStats.winningTrades / performanceStats.totalTrades) * 100).toFixed(1)
                    : '0.0'}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#A5AFC4] text-sm">Profit/Loss</span>
                <span className={`font-medium ${performanceStats.totalProfit >= performanceStats.totalLoss ? 'text-green-400' : 'text-red-400'}`}>
                  ${(performanceStats.totalProfit - performanceStats.totalLoss).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#A5AFC4] text-sm">Avg Win</span>
                <span className="text-green-400 font-medium">
                  ${performanceStats.winningTrades > 0 ? (performanceStats.totalProfit / performanceStats.winningTrades).toFixed(2) : '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#A5AFC4] text-sm">Avg Loss</span>
                <span className="text-red-400 font-medium">
                  ${performanceStats.losingTrades > 0 ? (performanceStats.totalLoss / performanceStats.losingTrades).toFixed(2) : '0.00'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#A5AFC4] text-sm">Largest Win</span>
                <span className="text-green-400 font-medium">${performanceStats.largestWin.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#A5AFC4] text-sm">Largest Loss</span>
                <span className="text-red-400 font-medium">${performanceStats.largestLoss.toFixed(2)}</span>
              </div>
              
              <div className="pt-3 border-t border-[#303943]">
                <button
                  onClick={fetchPerformanceStats}
                  className="w-full px-4 py-2 bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] rounded-lg flex items-center justify-center text-sm"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh Stats
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-[#282F36] rounded-lg shadow-xl border border-[#303943]/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            
            <div className="space-y-2">
              <button
                onClick={() => navigate('/copy-trading/trader-management')}
                className="w-full px-4 py-3 bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] rounded-lg flex items-center text-sm"
              >
                <ArrowLeft size={16} className="mr-3" />
                Back to Trader List
              </button>
              
              <button
                onClick={() => navigate(`/copy-trading/trader/${traderId}/trades`)}
                className="w-full px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg flex items-center text-sm"
              >
                <Eye size={16} className="mr-3" />
                View All Trades
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center text-sm disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw size={16} className="mr-3 animate-spin" />
                ) : (
                  <Save size={16} className="mr-3" />
                )}
                {saving ? 'Saving Changes...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Update Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#282F36] rounded-xl border border-[#303943] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#303943]">
              <h3 className="text-xl font-semibold text-white">Update Commission Rate</h3>
              <button 
                onClick={() => setShowCommissionModal(false)}
                className="text-[#A5AFC4] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={trader.commissionRate}
                  onChange={(e) => setTrader({...trader, commissionRate: parseFloat(e.target.value)})}
                  min="0"
                  max="50"
                  step="0.1"
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-3 text-white text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">Min: 0%</span>
                  <span className="text-xs text-gray-500">Max: 50%</span>
                </div>
              </div>
              
              <div className="bg-[#1E232A] rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-2">This change will affect:</p>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} className="text-blue-400" />
                  <span className="text-white">{trader.socialStats?.activeCopiers || 0} active copiers</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <DollarSign size={16} className="text-green-400" />
                  <span className="text-white">All future copy trades</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-[#303943]">
              <button 
                onClick={() => setShowCommissionModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#A5AFC4] hover:text-white hover:bg-[#3A434D] transition-colors"
              >
                Cancel
              </button>
              {/* <button 
                onClick={handleUpdateCommission}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
              >
                Update Commission
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraderEdit;