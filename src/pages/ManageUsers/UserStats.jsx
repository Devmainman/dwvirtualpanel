import { User, UserCheck, AlertTriangle, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';

const formatCurrency = (amount, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

const StatCard = ({ icon: Icon, color, title, value, loading }) => (
  <div className="bg-[#282F36] rounded-lg shadow-md p-3 md:p-4 flex items-center">
    <div className={`bg-${color}-500 bg-opacity-20 p-2 md:p-3 rounded-lg mr-3 md:mr-4`}>
      <Icon className={`h-5 w-5 md:h-6 md:w-6 text-${color}-500`} />
    </div>
    <div>
      <p className="text-xs md:text-sm text-[#6B7280]">{title}</p>
      {loading ? (
        <div className="h-6 w-16 bg-[#303943] rounded animate-pulse"></div>
      ) : (
        <p className="text-lg md:text-xl font-semibold text-[#A5AFC4]">
          {value}
        </p>
      )}
    </div>
  </div>
);

const UserStats = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid overflow-x-auto grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
      <StatCard 
        icon={User} 
        color="blue" 
        title="Total Users" 
        value={stats?.totalUsers || 0}
        loading={loading}
      />
      <StatCard 
        icon={UserCheck} 
        color="green" 
        title="Active Users" 
        value={stats?.activeUsers || 0}
        loading={loading}
      />
      <StatCard 
        icon={AlertTriangle} 
        color="red" 
        title="Inactive Users" 
        value={stats?.inactiveUsers || 0}
        loading={loading}
      />
      <StatCard 
        icon={Wallet} 
        color="yellow" 
        title="Total Balance" 
        value={formatCurrency(stats?.totalBalance || 0)}
        loading={loading}
      />
    </div>
  );
};

export default UserStats;