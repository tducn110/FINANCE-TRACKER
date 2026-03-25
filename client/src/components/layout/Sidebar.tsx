import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, List, Settings, LogOut } from 'lucide-react';
import { authService } from '../../services/api';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Transactions', path: '/transactions', icon: List },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold border-b pb-4 text-gray-900 tracking-tight">Finance Tracker</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-50 font-medium'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
