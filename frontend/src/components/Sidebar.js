import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Calendar, Users, FileText, LogOut, Menu, X, MessageSquare, Book, BookOpen } from "lucide-react";
import "./Sidebar.css"; // Import the FIXED CSS

const Sidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Close Sidebar when clicking outside (but not on navbar)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest(".menu-btn")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* ☰ Hamburger Menu Button */}
      <button className="menu-btn" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div ref={sidebarRef} className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2>Heartful Hands</h2>

        {/* Navigation */}
        <ul>
          <li>
            <Link to="/dashboard" onClick={toggleSidebar}>
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/profile" onClick={toggleSidebar}>
              <Users size={20} />
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <Link to="/reports" onClick={toggleSidebar}>
              <FileText size={20} />
              <span>Reports</span>
            </Link>
          </li>
          <li>
            <Link to="/training" onClick={toggleSidebar}>
              <BookOpen size={20} />
              <span>Training</span>
            </Link>
          </li>
          <li>
            <Link to="/user-guide" onClick={toggleSidebar}>
              <Book size={20} />
              <span>User Guide</span>
            </Link>
          </li>
          {user?.role === "event_manager" && (
            <>
              <li>
                <Link to="/send-messages" onClick={toggleSidebar}>
                  <MessageSquare size={20} />
                  <span>Send Messages</span>
                </Link>
              </li>
              <li>
                <Link to="/messages" onClick={toggleSidebar}>
                  <MessageSquare size={20} />
                  <span>My Chat</span>
                </Link>
              </li>
            </>
          )}
          {user?.role === "volunteer" ? (
            <li>
              <Link to="/volunteer-events" onClick={toggleSidebar}>
                <Calendar size={20} />
                <span>My Events</span>
              </Link>
            </li>
          ) : (
            <li>
              <Link to="/event-manager-events" onClick={toggleSidebar}>
                <Calendar size={20} />
                <span>Manage Events</span>
              </Link>
            </li>
          )}
        </ul>

        {/* Logout */}
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
