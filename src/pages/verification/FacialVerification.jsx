import { useState, useEffect } from 'react';
import { 
  User, Eye, ChevronDown, Check, X, 
  Trash2, ChevronLeft, ChevronRight, 
  Search, Shield, FileText, Clock, AlertCircle 
} from 'lucide-react';
import { 
  getFacialVerifications, 
  updateFacialVerification 
} from '../../api/adminVerification';
import { useAuth } from '../../context/AuthContext';

const statusIcons = {
  Approved: <Check className="h-3 w-3 mr-1 text-green-500" />,
  Rejected: <X className="h-3 w-3 mr-1 text-red-500" />,
  Pending: <Clock className="h-3 w-3 mr-1 text-yellow-500" />,
  Processing: <AlertCircle className="h-3 w-3 mr-1 text-blue-500" />,
  default: <Shield className="h-3 w-3 mr-1 text-gray-500" />
};

const actions = [
  { name: 'Approve', icon: <Check className="h-4 w-4 mr-2 text-green-500" /> },
  { name: 'Reject', icon: <X className="h-4 w-4 mr-2 text-red-500" /> },
  { name: 'Delete', icon: <Trash2 className="h-4 w-4 mr-2 text-red-600" /> },
  { name: 'Processing', icon: <Clock className="h-4 w-4 mr-2 text-blue-500" /> },
  { name: 'Revoke', icon: <X className="h-4 w-4 mr-2 text-yellow-500" /> }
];

const FacialVerification = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentAction, setCurrentAction] = useState({ userId: null, action: null });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const verifications = await getFacialVerifications(token);
        setData(verifications || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching facial verifications:', error);
        setError('Failed to load facial verifications');
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ));

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleSelection = (id) => 
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);

  const toggleAll = () => 
    setSelectedRows(prev => prev.length === currentData.length ? [] : currentData.map(row => row.userId));

  const handleAction = async (action, userId) => {
    if (!token) {
      setError('No authentication token found');
      return;
    }
    if (action === 'Reject') {
      setCurrentAction({ userId, action });
      setShowRejectModal(true);
      return;
    }

    try {
      const response = await updateFacialVerification(token, userId, action.toLowerCase());
      setData(prev => prev.map(item => 
        item.userId === userId ? { 
          ...item, 
          status: action,
          currentStatus: response.verificationStatus ? 'Verified' : 'Not Verified'
        } : item
      ));
      setSuccess(`Facial ${action.toLowerCase()}d successfully`);
    } catch (error) {
      console.error('Error updating verification:', error);
      setError(`Failed to ${action.toLowerCase()} facial`);
    }
    setOpenDropdown(null);
  };

  const handleBulkAction = async (action) => {
    if (!selectedRows.length) return;
    if (!token) {
      setError('No authentication token found');
      return;
    }

    if (action === 'Reject') {
      setCurrentAction({ userId: selectedRows[0], action: 'bulk' });
      setShowRejectModal(true);
      return;
    }

    try {
      const responses = await Promise.all(
        selectedRows.map(userId => updateFacialVerification(token, userId, action.toLowerCase()))
      );
      
      setData(prev => prev.map(item => 
        selectedRows.includes(item.userId) ? { 
          ...item, 
          status: action,
          currentStatus: responses.find(res => res.verificationStatus !== undefined)?.verificationStatus ? 'Verified' : 'Not Verified'
        } : item
      ));
      setSelectedRows([]);
      setSuccess(`Bulk ${action.toLowerCase()} completed successfully`);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError(`Failed to perform bulk ${action.toLowerCase()}`);
    }
  };

  const confirmReject = async () => {
    if (!token) {
      setError('No authentication token found');
      return;
    }
    try {
      if (currentAction.action === 'bulk') {
        const responses = await Promise.all(
          selectedRows.map(userId => updateFacialVerification(token, userId, 'reject', rejectionReason))
        );
        setData(prev => prev.map(item => 
          selectedRows.includes(item.userId) ? { 
            ...item, 
            status: 'Rejected',
            currentStatus: 'Not Verified'
          } : item
        ));
        setSuccess('Bulk rejection completed successfully');
        setSelectedRows([]);
      } else {
        const response = await updateFacialVerification(
          token,
          currentAction.userId, 
          'reject', 
          rejectionReason
        );
        setData(prev => prev.map(item => 
          item.userId === currentAction.userId ? { 
            ...item, 
            status: 'Rejected',
            currentStatus: response.verificationStatus ? 'Verified' : 'Not Verified'
          } : item
        ));
        setSuccess('Facial rejected successfully');
      }
    } catch (error) {
      console.error('Error rejecting verification:', error);
      setError('Failed to reject facial');
    } finally {
      setShowRejectModal(false);
      setRejectionReason('');
      setOpenDropdown(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusClass = (status) => ({
    Approved: 'bg-green-600 text-green-100',
    Rejected: 'bg-red-600 text-red-100',
    Processing: 'bg-blue-600 text-blue-100',
    Pending: 'bg-yellow-600 text-yellow-100'
  }[status] || 'bg-gray-600 text-gray-100');

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1E252C]">
        <div className="text-[#A5AFC4]">Loading facial verifications...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6">
      {error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
          {success}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#282F36] p-4 rounded-lg max-w-4xl max-h-screen">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#A5AFC4]">Face Image Preview</h3>
              <button onClick={() => setPreview(null)} className="text-[#A5AFC4] hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <img src={preview} alt="Face Image" className="max-w-full max-h-[80vh] object-contain" />
            <div className="mt-4 flex justify-end">
              <button onClick={() => setPreview(null)} className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-md hover:bg-[#3A4451]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#282F36] p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-[#A5AFC4] mb-4">Reject Facial</h3>
            <textarea
              className="w-full p-2 bg-[#303943] text-[#A5AFC4] rounded-md"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-md hover:bg-[#3A4451]"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#282F36] rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#A5AFC4]">Facial Verifications</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A5AFC4]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-md focus:outline-none"
              />
            </div>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-[#303943] text-[#A5AFC4] rounded-md px-2 py-2"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </div>
        </div>

        <div className="mb-4 flex items-center space-x-2">
          <select
            onChange={(e) => handleBulkAction(e.target.value)}
            className="bg-[#303943] text-[#A5AFC4] rounded-md px-2 py-2"
            disabled={!selectedRows.length}
          >
            <option value="">Bulk Actions</option>
            {actions.map((action) => (
              <option key={action.name} value={action.name}>
                {action.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[#A5AFC4]">
            <thead>
              <tr className="border-b border-[#303943]">
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === currentData.length && currentData.length > 0}
                    onChange={toggleAll}
                    className="rounded bg-[#303943] text-[#A5AFC4]"
                  />
                </th>
                <th className="p-3 text-left">Full Name</th>
                <th className="p-3 text-left">Account ID</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Submitted Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => (
                <tr key={item.userId} className="border-b border-[#303943]">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.userId)}
                      onChange={() => toggleSelection(item.userId)}
                      className="rounded bg-[#303943] text-[#A5A5]"
                    />
                  </td>
                  <td className="p-3">{item.fullName}</td>
                  <td className="p-3">{item.accountId}</td>
                  <td className="p-3">{item.email}</td>
                  <td className="p-3">{formatDate(item.submittedDate)}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusClass(item.status)}`}>
                      {statusIcons[item.status] || statusIcons.default}
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setPreview(item.faceImageUrl)}
                      className="text-[#A5AFC4] hover:text-white"
                      disabled={!item.faceImageUrl}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="p-3 relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.userId ? null : item.userId)}
                    className="flex items-center text-[#A5AFC4] hover:text-white"
                  >
                    Actions <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  {openDropdown === item.userId && (
                    <div className="absolute z-10 mt-2 w-48 bg-[#303943] rounded-md shadow-lg">
                      {actions.map((action) => (
                        <button
                          key={action.name}
                          onClick={() => handleAction(action.name, item.userId)}
                          className="flex items-center w-full px-4 py-2 text-left text-[#A5AFC4] hover:bg-[#3A4451]"
                        >
                          {action.icon}
                          {action.name}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-[#A5AFC4]">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
            {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="flex space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1 bg-[#303943] text-[#A5AFC4] rounded-md disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 bg-[#303943] text-[#A5AFC4] rounded-md disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacialVerification;