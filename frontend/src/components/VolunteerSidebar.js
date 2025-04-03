import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaEnvelope, FaClipboardList, FaBars, FaTimes, FaSignOutAlt, FaBook, FaUser, FaChartBar } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import './Sidebar.css';

const VolunteerSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Close Sidebar when clicking outside (but not on navbar)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest(".menu-btn")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Check if the route is active
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-700';
  };

  // Menu Items
  const menuItems = [
    { path: '/dashboard', icon: <FaHome className="w-5 h-5" />, text: 'Dashboard' },
    { path: '/volunteer-events', icon: <FaClipboardList className="w-5 h-5" />, text: 'My Events' },
    { path: '/messages', icon: <FaEnvelope className="w-5 h-5" />, text: 'Messages' },
    { path: '/reports', icon: <FaChartBar className="w-5 h-5" />, text: 'Reports' },
    { path: '/profile', icon: <FaUser className="w-5 h-5" />, text: 'Profile' },
    { path: '/user-guide', icon: <FaBook className="w-5 h-5" />, text: 'User Guide' },
    { path: '/training', icon: <FaBook className="w-5 h-5" />, text: 'Training' },
  ];

  return (
    <>
      {/* ☰ Hamburger Menu Button */}
      <button className="menu-btn" onClick={toggleSidebar}>
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar */}
      <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
        <h2 className="sidebar-logo">Volunteer Portal</h2>

        {/* Navigation Links */}
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${isActive(item.path)}`}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Theme Toggle */}
        <div className="theme-toggle-container">
          <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-300">Theme</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default VolunteerSidebar;
