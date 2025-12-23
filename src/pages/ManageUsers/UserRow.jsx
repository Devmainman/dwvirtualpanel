import { Edit, MessageSquare, Eye } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';

const UserRow = ({
  user,
  expandedUser,
  toggleUserExpansion,
  isSelected,
  toggleSelection,
  userOnlineStatus
}) => {
  const { token } = useAuth();
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [sendEmail, setSendEmail] = useState(false); // ✅ toggle state
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/admin/users/${user._id}/send-message`, {
        subject: messageSubject || 'Message from Support Team',
        message: messageContent,
        sendEmail: sendEmail // ✅ Send this to backend
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccessMessage(
        sendEmail 
          ? `Email sent to ${user.email} successfully.` 
          : `Message sent to ${user.fullName} successfully.`
      );
      
      // Clear input
      setMessageContent('');
      setSendEmail(false);
      setMessageSubject('');
      
      // Close the modal *after a short delay*
      setTimeout(() => {
        setShowMessageDialog(false);
        setSuccessMessage(''); // optionally clear after close
      }, 2500);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <>
      <tr 
        className={`hover:bg-[#303943] cursor-pointer transition-colors duration-150 ${
          expandedUser === user._id ? 'bg-[#303943]' : ''
        }`}
      >
        <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={toggleSelection}
            className="h-4 w-4 rounded border-[#A5AFC4] text-blue-600 focus:ring-blue-500"
          />
        </td>
        <td className="px-4 md:px-6 py-3 whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-medium ${
            user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {user.status}
          </span>
        </td>
        <td className="px-4 md:px-6 py-3 whitespace-nowrap text-[#A5AFC4] font-mono text-sm md:text-base">{user.accountId}</td>
        <td className="px-4 md:px-6 py-3 whitespace-nowrap">
          <div className="font-medium text-[#A5AFC4] text-sm md:text-base">{user.fullName}</div>
          <div className="text-xs text-[#6B7280]">
  {(typeof user.accountType === 'object' ? user.accountType.name : user.accountType) || 'Basic'} Account
</div>

        </td>
        <td className="hidden sm:table-cell px-4 md:px-6 py-3 whitespace-nowrap text-[#A5AFC4] text-sm md:text-base">{user.email}</td>
        <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap text-[#A5AFC4] text-sm md:text-base">{user.mobile}</td>
        <td className="hidden lg:table-cell px-6 py-3 whitespace-nowrap text-[#A5AFC4] text-sm md:text-base">{user.country}</td>
        <td className="px-4 md:px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-1 md:space-x-2">
            
            <button 
              className={`p-1 rounded-md ${
                expandedUser === user._id ? 'bg-blue-500 text-white' : 'bg-[#303943] text-blue-400'
              } hover:bg-blue-600 transition-colors duration-150`}
              onClick={(e) => {
                e.stopPropagation();
                toggleUserExpansion(user._id);
              }}
              title="Edit user"
            >
              <Edit className="h-3 w-3 md:h-4 md:w-4" />
            </button>
            <button 
              className="p-1 rounded-md bg-[#303943] text-yellow-400 hover:bg-[#3A4451] transition-colors duration-150"
              onClick={(e) => {
                e.stopPropagation();
                setShowMessageDialog(true);
              }}
              title="Send message"
            >
              <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
            </button>
            <button 
              className={`p-1 rounded-md ${
                expandedUser === user._id ? 'bg-blue-500 text-white' : 'bg-[#303943] text-blue-400'
              } hover:bg-blue-600 transition-colors duration-150`}
              onClick={(e) => {
                e.stopPropagation();
                toggleUserExpansion(user._id);
              }}
              title="View details"
            >
              <Eye className="h-3 w-3 md:h-4 md:w-4" />
            </button>

          </div>
        </td>
      </tr>

      {/* Message Dialog */}
      {showMessageDialog && (
        <tr>
          <td colSpan={8} className="px-0 py-0 bg-[#303943]">
            <div className="p-4 border-t border-[#3A4451]">
              <div className="bg-[#282F36] rounded-lg p-4 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-[#aab8c5]">
                    Send Message to {user.fullName}
                  </h3>
                  <button
                    onClick={() => setShowMessageDialog(false)}
                    className="text-[#6B7280] hover:text-[#A5AFC4]"
                  >
                    ✕
                  </button>
                </div>
                <div>
                <input
                    type="text"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Enter subject"
                    className="w-full bg-[#303943] text-[#A5AFC4] p-3 rounded-lg mb-3"
                    required
                  />
                </div>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-[#303943] text-[#A5AFC4] p-3 rounded-lg mb-3 min-h-[100px]"
                />
                {successMessage && (
  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md mb-3 text-sm flex justify-between items-center">
    <span>{successMessage}</span>
    <button onClick={() => setSuccessMessage('')} className="text-green-700 hover:text-green-900">✕</button>
  </div>
)}

                <div className="flex items-center mb-3 space-x-2">
                  <input
                    type="checkbox"
                    id={`sendEmail-${user._id}`}
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`sendEmail-${user._id}`} className="text-sm text-[#A5AFC4]">
                    Also send as email
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowMessageDialog(false)}
                    className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A4451]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default UserRow;