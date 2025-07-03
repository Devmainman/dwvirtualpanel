// components/ExpandedUser.jsx
import { 
  User, Mail, Phone, Globe, Wallet, Calendar, Shield,
  Lock, Key, RefreshCw, Trash2, CreditCard, FileText, ArrowUp,
  Settings, Edit, MessageSquare, Check, X, Bot
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import ActionButton from './ActionButton';
import EditableField from './EditableField';
import PopupFormModal from './PopupModals/PopupFormModal';
import PopupInvoiceModal from './PopupModals/PopupInvoiceModal';
import PopupMessageModal from './PopupModals/PopupMessageModal';
import ResetPasswordModal from './PopupModals/ResetPasswordModal'; // NEW
import ChangeCurrencyModal from './PopupModals/ChangeCurrencyModal';
import SignalUpdateModal from './PopupModals/SignalUpdateModal';
import FeedbackModal from './PopupModals/FeedbackModal';
import BlockUserModal from './PopupModals/BlockUserModal';



const ExpandedUser = ({ user, toggleUserExpansion, onUpgradeUser }) => {
  const [currencies, setCurrencies] = useState([]);
  const encodedUserId = encodeURIComponent(user._id);
  const { token } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false); // NEW
  const [showChangeCurrencyModal, setShowChangeCurrencyModal] = useState(false);
  const [showSignalModal, setShowSignalModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userStatus, setUserStatus] = useState(user.status); // NEW



  const [availableForms, setAvailableForms] = useState([]);
  const [availableInvoices, setAvailableInvoices] = useState([]);
  const [availableMessages, setAvailableMessages] = useState([]);
  const [editedUser, setEditedUser] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phoneNumber: user.mobile || user.phoneNumber || '',
    country: user.country || '',
    currency: user.currency || '',
    accountId: user.accountId || '',
    accountType: user.accountType || 'Basic',
    walletBalance: user.balance !== undefined ? user.balance : user.walletBalance || 0,
  });
  const [actionState, setActionState] = useState({
    resetPassword: false,
    creditAmount: '',
    debitAmount: ''
  });
  const [modalData, setModalData] = useState({ isOpen: false, title: '', message: '' });

const showModal = (title, message) => {
  setModalData({ isOpen: true, title, message });
};

const closeModal = () => {
  setModalData({ ...modalData, isOpen: false });
};


  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/admin/currencies?status=Enabled&limit=151`, // Add limit parameter
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrencies(response.data.currencies || []);
      } catch (error) {
        console.error('Failed to fetch currencies', error);
      }
    };
    
    fetchCurrencies();
  }, [token]);

  const handleUpdateUser = async (updates) => {
    try {
      const transformedUpdates = {
        ...updates,
        mobile: updates.phoneNumber,
        phoneNumber: undefined
      };
      delete transformedUpdates.phoneNumber;

      const response = await axios.patch(
        `${API_BASE_URL}/admin/users/${user._id}`,
        transformedUpdates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.user;
    } catch (error) {
      console.error('Error updating user:', error?.response?.data || error.message);
      throw error;
    }    
  };

  const handleBlockUser = async (reason = null) => {
    try {
      const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
      const payload = reason ? { reason } : {}; // only send reason if blocking
  
      const response = await axios.patch(
        `${API_BASE_URL}/admin/users/${user._id}/status`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        const updatedUser = response.data.user;
        setUserStatus(updatedUser.status);
        setEditedUser((prev) => ({
          ...prev,
          status: updatedUser.status,
          blockReason: updatedUser.blockReason || '',
        }));
  
        showModal('Success', `User ${updatedUser.status === 'Inactive' ? 'blocked' : 'unblocked'} successfully`);
        toggleUserExpansion(user._id); // optional if you want UI refresh
      } else {
        showModal('Error', response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Block/unblock failed:', error.response?.data || error.message);
      showModal('Error', 'Failed to update user status');
    }
  };
  
  
  

  const handleResetPassword = async (newPassword) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/users/${user._id}/reset-password`,
        { newPassword, confirmPassword: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        setShowResetPasswordModal(false);
        return true;
      }
      return response.data.message || 'Password reset failed';
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error.message);
      return error.response?.data?.message || 'Failed to reset password';
    }
  };
  

// Update the handleFinancialAction function
const handleFinancialAction = async (type) => {
  const amount = parseFloat(type === 'credit' ? actionState.creditAmount : actionState.debitAmount);
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/admin/users/${user._id}/wallet`,
      { amount, type, notes: `${type === 'credit' ? 'Credit' : 'Debit'} adjustment by admin` },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // USE BACKEND RESPONSE DIRECTLY
    if (response.data.success) {
      setActionState({ creditAmount: '', debitAmount: '' });
      
      // Update ALL user data from backend
      setEditedUser({
        ...response.data.user,
        phoneNumber: response.data.user.mobile || response.data.user.phoneNumber,
        walletBalance: response.data.user.balance // Use actual balance field
      });
      
      alert(`${type === 'credit' ? 'Credited' : 'Debited'} ${amount} ${response.data.user.currency} successfully`);
    }
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to process transaction');
  }
};

// Update the handleSaveChanges function
const handleSaveChanges = async () => {
  try {
    const updates = {
      ...user,
      ...editedUser,
      mobile: editedUser.phoneNumber?.replace(/\D/g, '') || ''
    };

    delete updates.phoneNumber;

    const response = await axios.patch(
      `${API_BASE_URL}/admin/users/${user._id}`,
      updates,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      setEditedUser({
        ...response.data.user,
        phoneNumber: response.data.user.mobile,
        walletBalance: response.data.user.balance
      });

      setEditMode(false);
      alert('User updated successfully');
    }
  } catch (error) {
    alert('Failed to update user');
  }
};


  const handleClearAccount = async () => {
    if (!confirm('Clear all funds from this account?')) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/users/${user._id}/wallet`,
        { amount: user.walletBalance, type: 'debit', notes: 'Account cleared by admin' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditedUser(prev => ({ ...prev, walletBalance: 0 }));
      alert('Account cleared successfully');
    } catch (error) {
      alert('Failed to clear account');
    }
  };


  const fetchPopupItems = async (endpoint, setter, showModal) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${endpoint}`,  // Use raw endpoint string, don't encode full URL
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      setter(data.forms || data.invoices || data.messages || []);
      showModal(true);
    } catch (error) {
      alert(`Failed to fetch items: ${error.response?.data?.message || error.message}`);
    }
  };
  
 // ADD THE MISSING HANDLERS HERE:
 const handleAssignPopupForm = async () => {
  await fetchPopupItems('admin/popup-forms?status=Active', setAvailableForms, setShowFormModal);
};

const handleAssignPopupInvoice = async () => {
  await fetchPopupItems('admin/popup-invoices?status=Active', setAvailableInvoices, setShowInvoiceModal);
};

const handleAssignPopupMessage = async () => {
  await fetchPopupItems('admin/popup-messages?status=Active', setAvailableMessages, setShowMessageModal);
};

const handleFormSelect = async (form) => {
  try {
    await axios.post(
      `${API_BASE_URL}/admin/assign/${user._id}/popup-forms/${form._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(`Form "${form.title}" assigned successfully!`);
    setShowFormModal(false);
  } catch (error) {
    alert(`Failed to assign form: ${error.response?.data?.message || error.message}`);
  }
};

const handleInvoiceSelect = async (invoice) => {
  try {
    await axios.post(
      `${API_BASE_URL}/admin/assign/${user._id}/popup-invoices/${invoice._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(`Invoice "${invoice.title}" assigned successfully!`);
    setShowInvoiceModal(false);
  } catch (error) {
    alert(`Failed to assign invoice: ${error.response?.data?.message || error.message}`);
  }
};

const handleMessageSelect = async (message) => {
  try {
    await axios.post(
      `${API_BASE_URL}/admin/assign/${user._id}/popup-messages/${message._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert(`Message "${message.title}" assigned successfully!`);
    setShowMessageModal(false);
  } catch (error) {
    alert(`Failed to assign message: ${error.response?.data?.message || error.message}`);
  }
};

  const handleToggleWithdrawalLock = async () => {
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/users/${user._id}/withdrawal-lock`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Withdrawal lock status updated successfully');
      toggleUserExpansion(user._id);
    } catch (error) {
      alert('Failed to update withdrawal lock status');
    }
  };

  const handleGainAdminAccess = async () => {
    console.log('User ID:', user._id, 'Token:', token);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/admin/users/${user._id}/admin-access`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert('Failed to generate admin access: ' + data.message);
      }
    } catch (error) {
      alert('Failed to generate admin access: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRequestEmailVerification = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/admin/users/${user._id}/request-email-verification`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showModal('Success', 'Email verification requested successfully');
    } catch (error) {
      showModal('Error', 'Failed to request email verification');
    }
  };
  

  const handleRequestPhoneVerification = async () => {
    try {
      const rawInput = editedUser.phoneNumber || user.mobile || '';
      const cleaned = rawInput.trim().replace(/\s/g, '');
  
      const mobile = cleaned.startsWith('+')
        ? cleaned
        : '+' + cleaned.replace(/\D/g, '');
  
      if (!/^\+[1-9]\d{1,14}$/.test(mobile)) {
        return showModal('Invalid Number', 'Please provide a valid international phone number');
      }
  
      const { data } = await axios.post(
        `${API_BASE_URL}/admin/users/${user._id}/request-phone-verification`,
        { mobile },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (process.env.NODE_ENV === 'development') {
        showModal('Verification Code', `Code: ${data.verificationCode}`);
      } else {
        showModal('Success', 'Phone verification requested successfully');
      }
    } catch (error) {
      console.error('Phone verification request failed:', error.response?.data || error.message);
      showModal('Error', 'Failed to request phone verification');
    }
  };
  
  
  
  const handleVerifyEmail = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/admin/users/${user._id}/verify-email`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showModal('Success', 'Email marked as verified successfully');
    } catch (error) {
      showModal('Error', 'Failed to verify email');
    }
  };
  
  
  const handleVerifyPhoneNumber = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/admin/users/${user._id}/verify-phone-number`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showModal('Success', 'Phone number marked as verified successfully');
    } catch (error) {
      console.error('Phone number verify failed:', error.response?.data || error.message);
      showModal('Error', 'Failed to verify phone number');
    }
  };
  
  
  



  const handleChangeCurrency = async (newCurrency) => {
    try {
      console.log('Changing currency to:', newCurrency);
      console.log('User ID:', user._id);
      
      const response = await axios.patch(
        `${API_BASE_URL}/admin/users/${user._id}/currency`,
        { currency: newCurrency },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.status === 200) {
        setShowChangeCurrencyModal(false);
        toggleUserExpansion(user._id);
        return true;
      }
      return response.data.message || 'Currency change failed';
    } catch (error) {
      console.error('Currency change error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      
      return error.response?.data?.message || 
             error.response?.data?.error || 
             'Failed to change currency';
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const confirmation = prompt('Type "DELETE" to confirm:');
      if (confirmation !== 'DELETE') {
        alert('Deletion cancelled');
        return;
      }
      await axios.delete(
        `${API_BASE_URL}/admin/users/${user._id}/account`,
        { headers: { Authorization: `Bearer ${token}` }, data: { confirmation } }
      );
      alert('User deleted successfully');
      toggleUserExpansion(user._id);
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleAssignBot = async () => {
    const botId = prompt('Enter Bot ID to assign:');
    if (!botId) return;
    try {
      await axios.post(
        `${API_BASE_URL}/admin/users/${user._id}/assign-bot`,
        { botId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Bot assigned successfully');
    } catch (error) {
      alert('Failed to assign bot');
    }
  };

  const handleToggleTradeStatus = async () => {
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/users/${user._id}/trade-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Trade status toggled successfully');
      toggleUserExpansion(user._id);
    } catch (error) {
      alert('Failed to toggle trade status');
    }
  };

  const handleUpdateSignal = async (value) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/users/${user._id}/signal`,
        { strength: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Signal strength updated successfully");
      setShowSignalModal(false);
      toggleUserExpansion(user._id); // Refresh UI
    } catch (error) {
      alert('Failed to update signal strength');
      console.error(error.response?.data || error.message);
    }
  };
  
  

  const handleSendMessage = async () => {
    const subject = prompt('Enter message subject:');
    if (!subject) return;
    const message = prompt('Enter message content:');
    if (!message) return;
    try {
      await axios.post(
        `${API_BASE_URL}/admin/users/${user._id}/send-message`,
        { subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Message sent successfully');
    } catch (error) {
      alert('Failed to send message');
    }
  };

  return (
    <tr>
      <td colSpan={7} className="px-0 py-0 bg-[#303943]">
        <div className="p-4 md:p-6 border-t-2 border-blue-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            <div className="bg-[#282F36] p-4 md:p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[#aab8c5] flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Account Details
                </h3>
                {editMode ? (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleSaveChanges}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                    >
                      <Check className="h-4 w-4 mr-1" /> Save
                    </button>
                    <button 
                      onClick={() => {
                        setEditedUser({
                          firstName: user.firstName || '',
                          lastName: user.lastName || '',
                          email: user.email || '',
                          phoneNumber: user.mobile || '',
                          country: user.country || '',
                          currency: user.currency || '',
                          accountId: user.accountId || '',
                          accountType: user.accountType || 'Basic',
                          walletBalance: user.walletBalance || 0,
                        });
                        setEditMode(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                    >
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <EditableField label="Account ID" fieldName="accountId" readOnly editedUser={editedUser} setEditedUser={setEditedUser} editMode={editMode} user={user} />
                <EditableField label="Full Name" fieldName="fullName" editedUser={editedUser} setEditedUser={setEditedUser} editMode={editMode} user={user} />
                <EditableField label="Email" fieldName="email" editedUser={editedUser} setEditedUser={setEditedUser} editMode={editMode} user={user} />
                <EditableField label="Mobile" fieldName="phoneNumber" editedUser={editedUser} setEditedUser={setEditedUser} editMode={editMode} user={user} />
                <EditableField label="Country" fieldName="country" editedUser={editedUser} setEditedUser={setEditedUser} editMode={editMode} user={user} />
                <EditableField label="Currency" fieldName="currency" editedUser={editedUser} setEditedUser={setEditedUser} editMode={editMode} user={user} />
                <EditableField label="Account Type" fieldName="accountType" readOnly editedUser={editedUser} setEditedUser={setEditedUser} editMode={editMode} user={user} />
                <EditableField label="Wallet Balance" fieldName="walletBalance" type="currency" editedUser={editedUser} setEditedUser={setEditedUser} editMode={editMode} user={user} />
                <div className="col-span-2">
                  <p className="text-xs md:text-sm text-[#6B7280] mb-1">Joined</p>
                  <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 md:px-3 py-1 md:py-2 rounded flex items-center">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-blue-500" />
                    {new Date(user.joinedDate).toLocaleDateString()} 
                    ({Math.round((new Date() - new Date(user.joinedDate)) / (1000 * 60 * 60 * 24))} days ago)
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#282F36] p-4 md:p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-[#aab8c5] mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-yellow-500" />
                Management Actions
              </h3>
              <div className="mb-4">
                <h4 className="text-xs md:text-sm font-medium text-[#6B7280] mb-2">Security</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mb-4">
                  <ActionButton icon={Lock} label={user.status === 'Active' ? 'Block User' : 'Unblock User'} color="red"  
                   onClick={() => {
                    if (userStatus === 'Active') {
                      setShowBlockModal(true);
                    } else {
                      handleBlockUser();
                    }
                  }} />
                  <ActionButton icon={Key} label="Reset Password" color="yellow"  onClick={() => setShowResetPasswordModal(true)}  disabled={actionState.resetPassword} />
                  <ActionButton icon={Lock} label={user.withdrawalLocked ? 'Unlock Withdrawal' : 'Lock Withdrawal'} color="red" onClick={handleToggleWithdrawalLock} />
                  <ActionButton icon={Lock} label="Gain Access" color="blue" onClick={handleGainAdminAccess} />
                  <ActionButton icon={Mail} label="Request Email Verification" color="red" onClick={handleRequestEmailVerification} />
                  <ActionButton icon={Phone} label="Request Number Verification" color="yellow" onClick={handleRequestPhoneVerification} />
                  <ActionButton icon={Check} label="Verify Email" color="green" onClick={handleVerifyEmail} />
                  <ActionButton icon={Check} label="Verify Phone" color="green" onClick={handleVerifyPhoneNumber} />
                </div>
                <h4 className="text-xs md:text-sm font-medium text-[#6B7280] mb-2">Account</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mb-4">
                  <ActionButton icon={User} label="Change Type" color="blue" onClick={() => onUpgradeUser(user._id)} />
                  <ActionButton icon={Edit} label="Edit User" color="blue" onClick={() => setEditMode(true)} />
                  <ActionButton icon={RefreshCw} label="Change Currency" color="yellow"  onClick={() => setShowChangeCurrencyModal(true)}  />
                  <ActionButton icon={MessageSquare} label="Message" color="blue" onClick={handleSendMessage} />
                  <ActionButton icon={Trash2} label="Delete User" color="red" onClick={handleDeleteUser} />
                  <ActionButton icon={ArrowUp} label="Upgrade Account" color="green" onClick={() => onUpgradeUser(user._id)} />
                  <ActionButton icon={Bot} label="Assign Bot" color="blue" onClick={handleAssignBot} />
                </div>
                <h4 className="text-xs md:text-sm font-medium text-[#6B7280] mb-2">Financial</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                  <div className="col-span-2 sm:col-span-3 bg-[#303943] p-2 rounded-lg">
                    <div className="flex items-center mb-2">
                      <input
                        type="number"
                        value={actionState.creditAmount}
                        onChange={(e) => setActionState({ ...actionState, creditAmount: e.target.value })}
                        placeholder="Amount to credit"
                        className="flex-1 bg-[#282F36] text-[#A5AFC4] px-3 py-2 rounded-l-lg focus:outline-none"
                      />
                      <button
                        onClick={() => handleFinancialAction('credit')}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-r-lg"
                      >
                        <CreditCard className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={actionState.debitAmount}
                        onChange={(e) => setActionState({ ...actionState, debitAmount: e.target.value })}
                        placeholder="Amount to debit"
                        className="flex-1 bg-[#282F36] text-[#A5AFC4] px-3 py-2 rounded-l-lg focus:outline-none"
                      />
                      <button
                        onClick={() => handleFinancialAction('debit')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-r-lg"
                      >
                        <CreditCard className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <ActionButton icon={CreditCard} label="Assign Invoice" color="yellow" onClick={handleAssignPopupInvoice} />
                  <ActionButton icon={Trash2} label="Clear Account" color="red" onClick={handleClearAccount} />
                  <ActionButton icon={RefreshCw} label={user?.tradingEnabled ? 'Turn Off Trade' : 'Turn On Trade'} color="yellow" onClick={handleToggleTradeStatus} />
                  <ActionButton icon={FileText} label="Assign Form" color="blue" onClick={handleAssignPopupForm} />
                  <ActionButton icon={ArrowUp} label="Update Signal" color="green" onClick={() => setShowSignalModal(true)} />

                  <ActionButton icon={MessageSquare} label="Assign Message" color="green" onClick={handleAssignPopupMessage} />
                </div>
              </div>
            </div>
          </div>
          {showFormModal && (
            <PopupFormModal
              forms={availableForms}
              onSelectForm={handleFormSelect}
              onClose={() => setShowFormModal(false)}
            />
          )}
          {showInvoiceModal && (
            <PopupInvoiceModal
              invoices={availableInvoices}
              onSelectInvoice={handleInvoiceSelect}
              onClose={() => setShowInvoiceModal(false)}
            />
          )}
          {showMessageModal && (
            <PopupMessageModal
              messages={availableMessages}
              onSelectMessage={handleMessageSelect}
              onClose={() => setShowMessageModal(false)}
            />
          )}
          {showResetPasswordModal && (
            <ResetPasswordModal
              isOpen={showResetPasswordModal}
              onClose={() => setShowResetPasswordModal(false)}
              onReset={handleResetPassword}
            />
          )}
          
          {showChangeCurrencyModal && (
            <ChangeCurrencyModal
              isOpen={showChangeCurrencyModal}
              onClose={() => setShowChangeCurrencyModal(false)}
              currencies={currencies}
              currentCurrency={user.currency}
              onChange={handleChangeCurrency}
            />
          )}
          {showSignalModal && (
            <SignalUpdateModal
              isOpen={showSignalModal}
              onClose={() => setShowSignalModal(false)}
              onSubmit={handleUpdateSignal}
              currentSignal={user.tradingSignalStrength}
            />
          )}
          <FeedbackModal
            isOpen={modalData.isOpen}
            onClose={closeModal}
            title={modalData.title}
            message={modalData.message}
          />
          {showBlockModal && (
            <BlockUserModal
              isOpen={showBlockModal}
              onClose={() => setShowBlockModal(false)}
              onConfirm={(reason) => {
                setShowBlockModal(false);
                handleBlockUser(reason);
              }}
            />
          )}



        </div>
      </td>
    </tr>
  );
};

ExpandedUser.propTypes = {
  user: PropTypes.object.isRequired,
  toggleUserExpansion: PropTypes.func.isRequired,
  onUpgradeUser: PropTypes.func.isRequired
};

export default ExpandedUser;