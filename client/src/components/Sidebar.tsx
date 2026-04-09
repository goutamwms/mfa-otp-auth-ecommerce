import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { Home, Users, LogOut, Layers, Package } from 'lucide-react';
import { authApi } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      setUser(null);
      navigate('/login');
    },
    onError: () => {
      setUser(null);
      navigate('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { to: '/admin', icon: Home, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/categories', icon: Layers, label: 'Categories' },
    { to: '/admin/products', icon: Package, label: 'Products' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
