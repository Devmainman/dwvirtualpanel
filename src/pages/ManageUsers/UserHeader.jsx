export default function UserHeader({ totalUsers, selectedCount }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Manage Users</h1>
        <p className="text-[#A5AFC4]">{totalUsers} total users</p>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 bg-[#303943] p-3 rounded-lg">
          <span className="text-white text-sm md:text-base">
            {selectedCount} selected
          </span>
        </div>
      )}
    </div>
  );
}