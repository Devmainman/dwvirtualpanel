import React from 'react';
import UserRow from './UserRow';
import ExpandedUser from './ExpandedUser';

const UserTable = ({ 
  users, 
  expandedUser, 
  toggleUserExpansion,
  selectedUsers,
  toggleUserSelection,
  selectAllUsers,
  setUsers,
  onUpgradeUser,
  onAssignInvoice,
  isLoading
}) => {
  return (
    <div className="bg-[#282F36] rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#303943]">
          <thead className="bg-[#303943]">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={users.length > 0 && selectedUsers.size === users.length}
                  onChange={selectAllUsers}
                  className="h-4 w-4 rounded border-[#A5AFC4] text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Account ID</th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Full Name</th>
              <th className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Email</th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Mobile</th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Country</th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[#282F36] divide-y divide-[#303943]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-[#A5AFC4]">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-[#A5AFC4]">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-[#6B7280] text-sm">Try adjusting your search criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <React.Fragment key={user._id}>
                  <UserRow 
                    user={user}
                    expandedUser={expandedUser}
                    toggleUserExpansion={toggleUserExpansion}
                    isSelected={selectedUsers.has(user._id)}
                    toggleSelection={() => toggleUserSelection(user._id)}
                    setUsers={setUsers}
                  />
                  {expandedUser === user._id && (
                    <ExpandedUser 
                      user={user} 
                      toggleUserExpansion={toggleUserExpansion}
                      setUsers={setUsers}
                      onUpgradeUser={onUpgradeUser}
                      onAssignInvoice={onAssignInvoice}
                    />
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;