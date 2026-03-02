import React, { useState, useEffect } from 'react';
import { Users, Shield, UserPlus, UserMinus, Search } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  department: string;
  createdAt: string;
}

const SystemAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const updateUserDepartment = async (userId: string, newDepartment: string) => {
    try {
      await fetch(`http://localhost:5000/api/users/${userId}/department`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: newDepartment })
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-red-600" />
        <h1 className="text-3xl font-bold">System Administration</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="sys_admin">System Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.department}
                    onChange={(e) => updateUserDepartment(user._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="General">General</option>
                    <option value="Fire Department">Fire Department</option>
                    <option value="Police Department">Police Department</option>
                    <option value="Medical Department">Medical Department</option>
                    <option value="Environmental Department">Environmental Department</option>
                    <option value="Infrastructure Department">Infrastructure Department</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {user.role === 'user' && (
                      <button
                        onClick={() => updateUserRole(user._id, 'admin')}
                        className="text-green-600 hover:text-green-800"
                        title="Promote to Admin"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                    {user.role === 'admin' && (
                      <button
                        onClick={() => updateUserRole(user._id, 'user')}
                        className="text-red-600 hover:text-red-800"
                        title="Demote to User"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemAdmin;