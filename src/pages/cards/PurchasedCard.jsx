import { useState, useEffect } from 'react';
import { Search, CreditCard, User, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const statusStyles = {
  completed: 'bg-green-900/30 text-green-400',
  pending: 'bg-yellow-900/30 text-yellow-400',
  failed: 'bg-red-900/30 text-red-400'
};

export default function PurchasedCards() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Mock data fetch
        await new Promise(resolve => setTimeout(resolve, 800));
        setData(mockPurchases);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter(purchase => {
    const matchesSearch = purchase.user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         purchase.card.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || purchase.status === filters.status;
    const matchesType = filters.type === 'all' || purchase.card.type === filters.type;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-4 bg-[#1E232A]">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold text-white">Purchased Cards</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 text-[#A5AFC4]" />
            <input
              placeholder="Search..."
              className="pl-10 pr-3 py-2 bg-[#282F36] rounded-lg text-sm text-[#A5AFC4]"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <select 
            className="bg-[#282F36] text-[#A5AFC4] px-3 py-2 rounded-lg text-sm"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredData.map(purchase => (
            <div key={purchase.id} className="bg-[#282F36] p-4 rounded-lg">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div>
                  <p className="text-xs text-[#6B7280]">User</p>
                  <p className="text-white">{purchase.user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Card</p>
                  <p className="text-[#A5AFC4]">{purchase.card.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280]">Amount</p>
                  <p className="text-white">${purchase.amount}</p>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusStyles[purchase.status]}`}>
                    {purchase.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const mockPurchases = [
  {
    id: 'p1',
    user: { name: 'John Doe', email: 'john@example.com' },
    card: { name: 'Premium Card', type: 'premium' },
    amount: 49.99,
    date: new Date(),
    status: 'completed'
  },
  // Add more mock data as needed
];