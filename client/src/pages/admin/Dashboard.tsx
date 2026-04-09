import { useAuth } from '../../hooks/useAuth';
import { Shield, Users, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {user?.email}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-xl font-bold text-gray-800 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Access Level</p>
              <p className="text-xl font-bold text-gray-800">Full Access</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-xl font-bold text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Users className="text-blue-600 mb-2" size={24} />
            <p className="font-semibold text-gray-800">Manage Users</p>
            <p className="text-sm text-gray-500">View and manage user accounts</p>
          </a>
          <div className="p-4 border border-gray-200 rounded-lg">
            <Shield className="text-gray-400 mb-2" size={24} />
            <p className="font-semibold text-gray-800">Admin Settings</p>
            <p className="text-sm text-gray-500">Configure system settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
