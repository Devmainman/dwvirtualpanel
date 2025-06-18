import { useState, useEffect } from 'react';
import { 
  Eye, ChevronDown, Check, X, 
  Trash2, ChevronLeft, ChevronRight, 
  Search, Shield, Clock, AlertCircle 
} from 'lucide-react';
import { 
  getAddressVerifications, 
  updateAddressVerification 
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

const AddressVerification = () => {
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
  const [currentAction, setCurrentAction] = useState({ userId: null, action: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching address verifications with token:', token ? 'Present' : 'Missing');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await getAddressVerifications(token);
        console.log('Address Verifications Raw Response:', response);
        const verifications = Array.isArray(response) ? response : [];
        console.log('Address Verifications Processed:', verifications);
        setData(verifications);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching address verifications:', err.message, err.response?.status, err.response?.data);
        setError(err.response?.status === 401 ? 'Invalid or expired token' : 'Failed to load address verifications');
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
      const response = await updateAddressVerification(token, userId, action.toLowerCase());
      setData(prev => prev.map(item =>
        item.userId === userId ? {
          ...item,
          status: action,
          currentStatus: response.verificationStatus ? 'Verified' : 'Not Verified'
        } : item
      ));
      setSuccess(`Address ${action.toLowerCase()}d successfully`);
    } catch (err) {
      console.error('Error updating verification:', err.message, err.response?.status);
      setError(`Failed to ${action.toLowerCase()} address`);
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
      await Promise.all(
        selectedRows.map(userId => updateAddressVerification(token, userId, action.toLowerCase()))
      );
      setData(prev => prev.map(item =>
        selectedRows.includes(item.userId) ? {
          ...item,
          status: action,
          currentStatus: 'Not Verified'
        } : item
      ));
      setSelectedRows([]);
      setSuccess(`Bulk ${action.toLowerCase()} completed`);
    } catch (err) {
      console.error('Error performing bulk action:', err.message, err.response?.status);
      setError(`Failed to bulk ${action.toLowerCase()}`);
    }
  };

  const confirmReject = async () => {
    if (!token) {
      setError('No authentication token found');
      return;
    }
    try {
      if (currentAction.action === 'bulk') {
        await Promise.all(
          selectedRows.map(userId => updateAddressVerification(token, userId, 'reject', rejectionReason))
        );
        setData(prev => prev.map(item =>
          selectedRows.includes(item.userId) ? {
            ...item,
            status: 'Rejected',
            currentStatus: 'Not Verified'
          } : item
        ));
        setSuccess('Bulk rejection completed');
        setSelectedRows([]);
      } else {
        const response = await updateAddressVerification(
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
        setSuccess('Address rejected successfully');
      }
    } catch (err) {
      console.error('Error rejecting verification:', err.message, err.response?.status);
      setError('Failed to reject address');
    } finally {
      setShowRejectModal(false);
      setRejectionReason('');
      setOpenDropdown(null);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const { street, city, country } = address;
    return `${street || ''}, ${city || ''}, ${country || ''}`.trim() || 'N/A';
  };

  const statusClass = (status) => ({
    Approved: 'bg-green-500 text-white',
    Rejected: 'bg-red-500 text-white',
    Processing: 'bg-blue-500 text-white',
    Pending: 'bg-yellow-500 text-black'
  }[status] || 'bg-gray-200 text-gray-800');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-gray-400">Loading address verifications...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-900 p-6">
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {success}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-300">Address Document Preview</h3>
              <button 
                onClick={() => setPreview(null)} 
                className="text-gray-400 hover:text-white"
                aria-label="Close preview"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {preview ? (
              imageError ? (
                <div className="text-red-500 text-center">Failed to load image</div>
              ) : (
                <img
                  src={preview}
                  alt="Address Document"
                  className="max-w-full max-h-[60vh] object-contain"
                  onError={() => setImageError(true)}
                />
              )
            ) : (
              <div className="text-gray-400 text-center">No image available</div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setPreview(null)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-300 mb-4">Reject Address</h2>
            <textarea
              className="w-full p-3 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={!rejectionReason.trim()}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-300">Address Verifications</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="bg-gray-700 text-gray-300 rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </div>
        </div>

        <div className="mb-4 flex items-center space-x-3">
          <select
            onChange={(e) => handleBulkAction(e.target.value)}
            className="bg-gray-700 text-gray-300 rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <table className="w-full text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === currentData.length && currentData.length > 0}
                    onChange={toggleAll}
                    className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                </th>
                <th className="p-3 text-left">Full Name</th>
                <th className="p-3 text-left">Account ID</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Document Type</th>
                <th className="p-3 text-left">Submitted</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-3 text-center text-gray-400">
                    No address verifications found
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.userId} className="border-b border-gray-700">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(item.userId)}
                        onChange={() => toggleSelection(item.userId)}
                        className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3">{item.fullName || 'N/A'}</td>
                    <td className="p-3">{item.accountId || 'N/A'}</td>
                    <td className="p-3">{item.email || 'N/A'}</td>
                    <td className="p-3">{formatAddress(item.address)}</td>
                    <td className="p-3">{item.documentType || 'N/A'}</td>
                    <td className="p-3">{formatDate(item.submittedDate)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusClass(item.status)}`}>
                        {statusIcons[item.status] || statusIcons.default}
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setPreview(item.documentUrl)}
                        className="text-gray-400 hover:text-white"
                        disabled={!item.documentUrl}
                        aria-label="Preview document"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                    <td className="p-3 relative">
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === item.userId ? null : item.userId
                          )
                        }
                        className="flex items-center text-gray-400 hover:text-white"
                      >
                        Actions <ChevronDown className="h-5 w-5 ml-1" />
                      </button>
                      {openDropdown === item.userId && (
                        <div className="absolute z-10 mt-2 w-48 bg-gray-700 rounded-lg shadow-xl border border-gray-600">
                          {actions.map((action) => (
                            <button
                              key={action.name}
                              onClick={() => handleAction(action.name, item.userId)}
                              className="flex items-center w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-600"
                            >
                              {action.icon}
                              {action.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <span className="text-gray-400">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
            {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
          </span>
          <div className="flex space-x-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-600"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressVerification;