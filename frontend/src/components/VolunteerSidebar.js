import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaEnvelope, FaClipboardList, FaBars, FaTimes, FaSignOutAlt, FaBook, FaUser, FaChartBar } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import './Sidebar.css';

const VolunteerSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();

  // Navigation menu items
  const menuItems = [
    { path: '/dashboard', icon: <FaHome className="w-5 h-5" />, text: 'Dashboard' },
    { path: '/volunteer-events', icon: <FaClipboardList className="w-5 h-5" />, text: 'My Events' },
    { path: '/messages', icon: <FaEnvelope className="w-5 h-5" />, text: 'Messages' },
    { path: '/reports', icon: <FaChartBar className="w-5 h-5" />, text: 'Reports' },
    { path: '/profile', icon: <FaUser className="w-5 h-5" />, text: 'Profile' },
    { path: '/user-guide', icon: <FaBook className="w-5 h-5" />, text: 'User Guide' },
    { path: '/training', icon: <FaBook className="w-5 h-5" />, text: 'Training' },
  ];

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  // Handle user logout
  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    window.location.href = "/login";
  };

  // Check if a route is currently active
  const isActiveRoute = (path) => {
    return location.pathname === path 
      ? 'bg-blue-600 text-white' 
      : 'text-gray-600 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-700';
  };

  // Handle clicks outside the sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideSidebar = sidebarRef.current && !sidebarRef.current.contains(event.target);
      const clickedOnMenuButton = event.target.closest(".menu-btn");
      
      if (clickedOutsideSidebar && !clickedOnMenuButton) {
        setIsSidebarOpen(false);
      }
    };

    // Add or remove event listener based on sidebar state
    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <>
      {/* Hamburger Menu Button */}
      <button 
        className="menu-btn" 
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Sidebar Navigation */}
      <div 
        ref={sidebarRef} 
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Sidebar Header */}
        <h2 className="sidebar-logo">Volunteer Portal</h2>

        {/* Navigation Menu */}
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${isActiveRoute(item.path)}`}
                  aria-current={location.pathname === item.path ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Theme Toggle Section */}
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
          aria-label="Logout"
        >
          <FaSignOutAlt className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default VolunteerSidebar;
