import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Calendar, Users, FileText, LogOut, Menu, X, MessageSquare, Book, BookOpen } from "lucide-react";
import "./Sidebar.css"; // Import the FIXED CSS

const Sidebar = ({ user }) => {
  // State for sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedOutside = sidebarRef.current && 
        !sidebarRef.current.contains(event.target) && 
        !event.target.closest(".menu-btn");
      
      if (clickedOutside) {
        setIsSidebarOpen(false);
      }
    };

    // Add or remove event listener based on sidebar state
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isSidebarOpen]);

  // Navigation items for all users
  const commonNavItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/profile", icon: Users, label: "Profile" },
    { path: "/reports", icon: FileText, label: "Reports" },
    { path: "/training", icon: BookOpen, label: "Training" },
    { path: "/user-guide", icon: Book, label: "User Guide" }
  ];

  // Navigation items for event managers
  const managerNavItems = [
    { path: "/send-messages", icon: MessageSquare, label: "Send Messages" },
    { path: "/messages", icon: MessageSquare, label: "My Chat" }
  ];

  // Navigation items based on user role
  const roleSpecificNavItems = user?.role === "volunteer" 
    ? [{ path: "/volunteer-events", icon: Calendar, label: "My Events" }]
    : [{ path: "/event-manager-events", icon: Calendar, label: "Manage Events" }];

  return (
    <>
      {/* Hamburger menu button */}
      <button 
        className="menu-btn" 
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar navigation */}
      <div 
        ref={sidebarRef} 
        className={`sidebar ${isSidebarOpen ? "open" : ""}`}
        role="navigation"
      >
        <h2>Heartful Hands</h2>

        {/* Navigation links */}
        <ul>
          {/* Common navigation items */}
          {commonNavItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <Link to={path} onClick={toggleSidebar}>
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            </li>
          ))}

          {/* Event manager specific items */}
          {user?.role === "event_manager" && managerNavItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <Link to={path} onClick={toggleSidebar}>
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            </li>
          ))}

          {/* Role specific items */}
          {roleSpecificNavItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <Link to={path} onClick={toggleSidebar}>
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout button */}
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
