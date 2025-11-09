import React, { useState, useContext } from 'react';
import { AppContext } from '../App';

const NavLink = ({ to, children }) => {
  return (
    <a
      href={to}
      className="px-3 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-gray-700"
    >
      {children}
    </a>
  );
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setIsAuthenticated } = useContext(AppContext);

  const handleLogout = () => {
    setIsAuthenticated(false);
    window.location.hash = '#login';
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center">
            <a href="#dashboard" className="text-white font-semibold text-lg">
              FebriFlow
            </a>
            <div className="hidden md:block ml-6">
              <div className="flex space-x-2">
                <NavLink to="#dashboard">Dashboard</NavLink>
                <NavLink to="#looms">Looms</NavLink>
                <NavLink to="#production">Production</NavLink>
                <NavLink to="#inventory">Inventory</NavLink>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
              type="button"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen((s) => !s)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
          <a
            href="#dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-700"
          >
            Dashboard
          </a>
          <a
            href="#looms"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-700"
          >
            Looms
          </a>
          <a
            href="#production"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-700"
          >
            Production
          </a>
          <a
            href="#inventory"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-700"
          >
            Inventory
          </a>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-base"
            type="button"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
