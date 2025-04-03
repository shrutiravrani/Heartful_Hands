import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, FileText } from "lucide-react"; // Modern Icons
import API from "../api";
import "./Dashboard.css"; // Import the new CSS design

// Dashboard component for displaying user-specific information
const Dashboard = ({ user }) => {
  // State for dashboard data and error handling
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch dashboard data on component mount
  useEffect(() => {
    const getDashboardInfo = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please log in to view your dashboard");
        return;
      }

      try {
        const response = await API.get("/dashboard");
        setDashboardData(response.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.response?.data?.error || "Couldn't load dashboard data");
      }
    };

    getDashboardInfo();
  }, []);

  // Show loading or error states
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  
  if (!dashboardData) {
    return <p className="loading-text">Loading your dashboard...</p>;
  }

  // Render dashboard content
  return (
    <div className="dashboard-container">
      <div className="dashboard-header-section">
        <h1 className="dashboard-header">Hey {user?.name}! 👋</h1>
        <p className="dashboard-subtext">Here's what's happening today</p>
      </div>

      <div className="dashboard-grid">
        {user?.role === "volunteer" ? (
          // Volunteer specific widgets
          <>
            <div className="dashboard-widget">
              <Calendar size={32} className="widget-icon" />
              <div className="widget-text">
                <h2>Your Upcoming Events</h2>
                <p>{dashboardData.upcomingEvents?.length || 0}</p>
              </div>
            </div>
            <div className="dashboard-widget">
              <Users size={32} className="widget-icon" />
              <div className="widget-text">
                <h2>Events You've Joined</h2>
                <p>{dashboardData.eventsCount || 0}</p>
              </div>
            </div>
          </>
        ) : (
          // Event manager specific widgets
          <>
            <div className="dashboard-widget">
              <Calendar size={32} className="widget-icon" />
              <div className="widget-text">
                <h2>Your Events</h2>
                <p>{dashboardData.eventsCount || 0}</p>
              </div>
            </div>
            <div className="dashboard-widget">
              <FileText size={32} className="widget-icon" />
              <div className="widget-text">
                <h2>Applications to Review</h2>
                <p>{dashboardData.pendingApplications || 0}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick actions section */}
      <div className="dashboard-actions">
        {user?.role === "event_manager" && (
          <button 
            onClick={() => navigate("/create-event")} 
            className="btn"
          >
            Create New Event
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
