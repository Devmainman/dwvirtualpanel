import { useState, useEffect } from 'react';
import axios from 'axios';
import UserHeader from './UserHeader';
import UserSearch from './UserSearch';
import UserStats from './UserStats';
import UserTable from './UserTable';
import UserPagination from './UserPagination';
import PackageSelectionPopup from './PackageSelectionPopup';
import InvoiceSelectionPopup from './InvoiceSelectionPopup';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';

export default function ManageUsers() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPackagePopup, setShowPackagePopup] = useState(false);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [packages, setPackages] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [userToUpgrade, setUserToUpgrade] = useState(null);
  const [userToAssignInvoice, setUserToAssignInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Fetch users from backend
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { page, limit } = pagination;
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {  // Changed from /users to /admin/users
        params: {
          page,
          limit,
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchTerm || undefined
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data.users);
      setPagination(prev => ({
        ...prev,
        total: response.data.total
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch packages from backend
  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/packages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPackages(response.data.packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      alert('Failed to fetch packages');
    }
  };

  // Fetch invoices from backend
  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/popup-invoices`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      alert('Failed to fetch invoices');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPackages();
    fetchInvoices();
  }, [searchTerm, statusFilter, pagination.page]);

  const toggleUserExpansion = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    newSelected.has(userId) ? newSelected.delete(userId) : newSelected.add(userId);
    setSelectedUsers(newSelected);
  };

  const selectAllUsers = () => {
    setSelectedUsers(prev => 
      prev.size === filteredUsers.length ? new Set() : new Set(users.map(user => user._id))
    );
  };

  const handleClearAccounts = async () => {
    if (!confirm(`Delete ${selectedUsers.size} selected accounts?`)) return;
    
    try {
      await axios.post(`${API_BASE_URL}/admin/users/bulk-delete`, {
        userIds: Array.from(selectedUsers)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchUsers();
      setSelectedUsers(new Set());
      alert('Accounts deleted successfully');
    } catch (error) {
      console.error('Error deleting accounts:', error);
      alert('Failed to delete accounts');
    }
  };

  const handleBlockUsers = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/users/bulk-status`, {
        userIds: Array.from(selectedUsers),
        status: 'Inactive'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchUsers();
      setSelectedUsers(new Set());
      alert('Users blocked successfully');
    } catch (error) {
      console.error('Error blocking users:', error);
      alert('Failed to block users');
    }
  };

  const handleUpgradeUser = (userId) => {
    setUserToUpgrade(userId);
    setShowPackagePopup(true);
  };

  const handleAssignInvoice = (userId) => {
    setUserToAssignInvoice(userId);
    setShowInvoicePopup(true);
  };

  const assignPackageToUser = async (pkg) => {
    if (!userToUpgrade) return;

      // Add ID format validation
  if (!pkg._id || !/^[a-f\d]{24}$/i.test(pkg._id)) {
    alert('Invalid package ID format');
    return;
  }
    
    try {
      await axios.post(`${API_BASE_URL}/admin/users/${userToUpgrade}/packages/${pkg._id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update local state
      setUsers(users.map(user => {
        if (user._id === userToUpgrade) {
          return { 
            ...user, 
            accountType: pkg.name,
            packageId: pkg._id
          };
        }
        return user;
      }));
      
      setShowPackagePopup(false);
      setUserToUpgrade(null);
      alert('Package assigned successfully');
    } catch (error) {
      console.error('Error assigning package:', error);
      alert('Failed to assign package');
    }
  };

  const assignInvoiceToUser = async (invoice) => {
    if (!userToAssignInvoice) return;
    
    try {
      await axios.post(`${API_BASE_URL}/admin/assign/${userToAssignInvoice}/invoice`, {
        itemId: invoice._id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setShowInvoicePopup(false);
      setUserToAssignInvoice(null);
      alert(`Invoice ${invoice.title} assigned successfully!`);
    } catch (error) {
      console.error('Error assigning invoice:', error);
      alert('Failed to assign invoice');
    }
  };

  const filteredUsers = users.filter(user => {
    // First check if user exists
    if (!user) return false;
    
    const statusMatch = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.status === 'Active') ||
      (statusFilter === 'inactive' && user.status === 'Inactive');
    
    // Safely handle potentially undefined properties
    const searchMatch = 
      (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.accountId?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-4 md:p-6">
      {/* Package Selection Popup */}
      {showPackagePopup && (
        <PackageSelectionPopup 
          packages={packages}
          onSelectPackage={assignPackageToUser}
          onClose={() => setShowPackagePopup(false)}
        />
      )}
      
      {/* Invoice Selection Popup */}
      {showInvoicePopup && (
        <InvoiceSelectionPopup 
          invoices={invoices}
          onSelectInvoice={assignInvoiceToUser}
          onClose={() => setShowInvoicePopup(false)}
        />
      )}
      
      <UserHeader 
        totalUsers={pagination.total} 
        selectedCount={selectedUsers.size} 
      />
      
      <UserSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCount={selectedUsers.size}
        onClearAccounts={handleClearAccounts}
        onBlockUsers={handleBlockUsers}
        onFilterChange={setStatusFilter}
      />
      
      <UserStats />
      
      <UserTable 
        users={filteredUsers}
        selectedUsers={selectedUsers}
        toggleUserSelection={toggleUserSelection}
        selectAllUsers={selectAllUsers}
        expandedUser={expandedUser}
        toggleUserExpansion={toggleUserExpansion}
        setUsers={setUsers}
        onUpgradeUser={handleUpgradeUser}
        onAssignInvoice={handleAssignInvoice}
        isLoading={isLoading}
      />
      
      {pagination.total > 0 && (
        <UserPagination 
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.limit)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}