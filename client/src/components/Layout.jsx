import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiSettings, FiLogOut, FiMenu, FiX, FiPackage, 
  FiUsers, FiTool, FiFileText, FiBarChart2, FiUser 
} from 'react-icons/fi';
import useAuthStore from '../store/authStore';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/machines', icon: FiTool, label: 'Machines' },
    { path: '/workers', icon: FiUsers, label: 'Workers' },
    { path: '/takas', icon: FiPackage, label: 'Takas' },
    { path: '/qualities', icon: FiBarChart2, label: 'Quality Types' },
    { path: '/productions', icon: FiFileText, label: 'Production' },
    { path: '/reports', icon: FiFileText, label: 'Reports' },
  ];

  if (user?.role === 'Owner') {
    menuItems.push({ path: '/users', icon: FiUser, label: 'Users' });
  }

  // Add Profile menu item before Users
  const profileIndex = menuItems.findIndex(item => item.path === '/users');
  const profileItem = { path: '/profile', icon: FiSettings, label: 'Profile' };
  
  if (profileIndex !== -1) {
    menuItems.splice(profileIndex, 0, profileItem);
  } else {
    menuItems.push(profileItem);
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-primary-600">Looms MS</h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-700 w-full transition-colors"
          >
            <FiLogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <Link to="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
