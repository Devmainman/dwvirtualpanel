import { useState, useEffect } from 'react';
import { ChevronRight, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPopupAssignments, toggleAssignmentStatus, deleteAssignment } from '../../api/popupAssignments';

export default function AssignmentsPopup() {
  const { token } = useAuth();
  const [popups, setPopups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        setLoading(true);
        const { assignments, total } = await getPopupAssignments(
          token,
          'popup_message',
          {
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm
          }
        );
        setPopups(assignments);
        setPagination(prev => ({ ...prev, total }));
      } catch (error) {
        console.error('Error fetching popups:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchPopups();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [token, searchTerm, pagination.page, pagination.limit]);

  const handleDelete = async (id) => {
    try {
      await deleteAssignment(token, id);
      setPopups(popups.filter(popup => popup._id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (error) {
      console.error('Error deleting popup:', error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const updatedAssignment = await toggleAssignmentStatus(token, id);
      setPopups(popups.map(popup => 
        popup._id === id ? updatedAssignment.assignment : popup
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 text-[#A5AFC4]">
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Manage Popup Assignment</h1>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Popup Assignment</span>
        </div>
      </div>

      {/* Popup List */}
      <div className="bg-[#282F36] rounded-lg border border-[#2F3944] mb-6">
        {/* Search and filter (unchanged) */}
        <div className="p-4 border-b border-[#3A4451] flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-sm text-[#A5AFC4] mr-2">Show</span>
            <select className="bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-1 rounded text-sm">
              <option>10 entries</option>
              <option>25 entries</option>
              <option>50 entries</option>
            </select>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A5AFC4]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#3A4451]">
          <thead className="bg-[#303943]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#A5AFC4] uppercase tracking-wider">S/N</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#A5AFC4] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#A5AFC4] uppercase tracking-wider">Account ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#A5AFC4] uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#A5AFC4] uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-[#A5AFC4] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-[#A5AFC4]">
                    Loading...
                  </td>
                </tr>
              ) : popups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-[#A5AFC4]">
                    No popup assignments found
                  </td>
                </tr>
              ) : (
                popups.map((popup, index) => (
                  <tr key={popup._id} className="hover:bg-[#303943] transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-[#A5AFC4]">
                      {new Date(popup.date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-[#A5AFC4] font-mono">
                      {popup.accountId}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-[#A5AFC4]">
                      {popup.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-[#A5AFC4]">
                      {popup.title}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                      <span className={`inline-flex whitespace-nowrap px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        popup.status === 'assigned' 
                          ? 'bg-green-900 text-green-100' 
                          : popup.status === 'disabled'
                            ? 'bg-yellow-900 text-yellow-100'
                            : 'bg-gray-700 text-gray-300'
                      }`}>
                        {popup.status.charAt(0).toUpperCase() + popup.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => toggleStatus(popup._id)}
                          className={`p-1.5 rounded-md ${
                            popup.status === 'disabled' 
                              ? 'bg-green-900 text-green-100' 
                              : 'bg-yellow-900 text-yellow-100'
                          } hover:opacity-80 transition-colors duration-150`}
                          title={popup.status === 'disabled' ? 'Enable' : 'Disable'}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(popup._id)}
                          className="px-3 py-1 rounded-md bg-red-900 text-red-100 text-sm font-medium hover:bg-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

          {/* Pagination */}
          <div className="px-4 py-3 bg-[#303943] border-t border-[#3A4451] flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-[#A5AFC4] mb-2 md:mb-0">
            Showing 1 to {popups.length} of {popups.length} entries
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded-md bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] text-sm hover:bg-[#303943] disabled:opacity-50"
              disabled={true}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 rounded-md bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] text-sm hover:bg-[#303943] disabled:opacity-50"
              disabled={true}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}