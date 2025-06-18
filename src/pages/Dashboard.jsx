import { useState, useEffect } from 'react';
import { Download, Users, Coins, HeadphonesIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import { getAdminApiBaseUrl } from '../api/config.js';

export default function Dashboard() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCurrencies: 0,
    totalTrades: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    submittedInvoices: 0,
    totalReferrals: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
  
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const adminApiBaseUrl = await getAdminApiBaseUrl(token);
  
        // Fetch stats
        const statsResponse = await axios.get(`${adminApiBaseUrl}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Stats response:', statsResponse.data);
        // Handle nested stats
        const statsData = statsResponse.data.stats || statsResponse.data;
        setStats(statsData);
  
        // Fetch transactions
        const transactionsResponse = await axios.get(`${adminApiBaseUrl}/dashboard/transactions?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Transactions response:', transactionsResponse.data);
        setTransactions(transactionsResponse.data.transactions || []);
  
        // Fetch notifications
        const notificationsResponse = await axios.get(`${adminApiBaseUrl}/dashboard/notifications?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Notifications response:', notificationsResponse.data);
        setNotifications(notificationsResponse.data.notifications || []);
  
        // Fetch user (admin) info
        const userResponse = await axios.get(`${adminApiBaseUrl}/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('User response:', userResponse.data);
        setUser(userResponse.data.admin);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch dashboard data';
        console.error('Fetch dashboard error:', err.message, err.response?.data);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token, isAuthenticated, authLoading]);

  // Format number with commas
  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  

  if (authLoading) {
    return <div className="text-[#A5AFC4] p-6">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div className="text-red-500 p-6">Please log in to view dashboard</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 text-[#A5AFC4]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div className="text-[#A5AFC4] mb-4">Loading dashboard data...</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-[#282F36] rounded-lg border border-[#2F3944] p-4">
          <h3 className="text-sm font-medium text-[#A5AFC4] mb-1">Total Trades</h3>
          <p className="text-xl font-semibold text-[#aab8c5]">{formatNumber(stats.totalTrades)}</p>
        </div>
        <div className="bg-[#282F36] rounded-lg border border-[#2F3944] p-4">
          <h3 className="text-sm font-medium text-[#A5AFC4] mb-1">Total Deposits</h3>
          <p className="text-xl font-semibold text-[#aab8c5]">{formatNumber(stats.totalDeposits)}</p>
        </div>
        <div className="bg-[#282F36] rounded-lg border border-[#2F3944] p-4">
          <h3 className="text-sm font-medium text-[#A5AFC4] mb-1">Total Withdrawals</h3>
          <p className="text-xl font-semibold text-[#aab8c5]">{formatNumber(stats.totalWithdrawals)}</p>
        </div>
        <div className="bg-[#282F36] rounded-lg border border-[#2F3944] p-4">
          <h3 className="text-sm font-medium text-[#A5AFC4] mb-1">Submitted Invoices</h3>
          <p className="text-xl font-semibold text-[#aab8c5]">{formatNumber(stats.submittedInvoices)}</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 mb-6">
        <div className="bg-[#282F36] rounded-lg border border-[#2F3944] p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-[#A5AFC4] mb-1">Total Users</h3>
              <p className="text-2xl font-semibold text-[#aab8c5]">{formatNumber(stats.totalUsers)}</p>
            </div>
            <div className="bg-[#303943] p-2 rounded-full">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#282F36] rounded-lg border border-[#2F3944] p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-[#A5AFC4] mb-1">Total Currencies</h3>
              <p className="text-2xl font-semibold text-[#aab8c5]">{stats.totalCurrencies}</p>
            </div>
            <div className="bg-[#303943] p-2 rounded-full">
              <Coins className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#282F36] rounded-lg border border-[#2F3944] p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-[#A5AFC4] mb-1">Technical Support</h3>
              <p className="text-[#A5AFC4] text-sm">Available 24/7</p>
            </div>
            <div className="bg-[#303943] p-2 rounded-full">
              <HeadphonesIcon className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions Section */}
        <div className="bg-[#282F36] rounded-lg border border-[#2F3944]">
          <div className="p-4 border-b border-[#3A4451]">
            <h2 className="text-lg font-semibold text-[#aab8c5]">Recent Transactions</h2>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-[#3A4451]">
              <thead className="bg-[#303943]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Transaction Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Full Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Payment Method</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
                {transactions.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-sm text-[#A5AFC4]">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-[#303943] transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#A5AFC4]">{transaction.type || 'Unknown'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#A5AFC4]">{transaction.fullName || 'Unknown User'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#A5AFC4]">{transaction.paymentMethod || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#A5AFC4]">{transaction.amount || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#A5AFC4]">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
                          {transaction.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-[#282F36] rounded-lg border border-[#2F3944]">
          <div className="p-4 border-b border-[#3A4451]">
            <h2 className="text-lg font-semibold text-[#aab8c5]">Recent Notifications</h2>
          </div>
          <div className="p-4 space-y-4">
            {notifications.length === 0 && !loading ? (
              <p className="text-center text-sm text-[#A5AFC4]">No notifications found</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="bg-[#303943] rounded-lg p-4 border border-[#3A4451]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-[#aab8c5]">{notification.name}</h3>
                      <p className="text-sm text-[#A5AFC4] mt-1">{notification.message}</p>
                      {notification.details && (
                        <p className="text-xs text-[#6B7280] mt-2">{notification.details}</p>
                      )}
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-[#3A4451] transition-colors duration-150">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-900 text-green-100';
    case 'pending':
      return 'bg-yellow-900 text-yellow-100';
    case 'rejected':
      return 'bg-red-900 text-red-100';
    case 'processing':
      return 'bg-blue-900 text-blue-100';
    case 'cancelled':
      return 'bg-gray-900 text-gray-100';
    case 'reset':
      return 'bg-[#3A4451] text-[#A5AFC4]';
    default:
      return 'bg-gray-700 text-gray-300';
  }
};