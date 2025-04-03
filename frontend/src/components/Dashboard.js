import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, FileText } from "lucide-react"; // Modern Icons
import API from "../api";
import "./Dashboard.css"; // Import the new CSS design

const Dashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in. Please log in to view the dashboard.");
          return;
        }

        const { data: dashboardResponse } = await API.get("/dashboard");
        setDashboardData(dashboardResponse);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load dashboard data");
      }
    };

    fetchDashboardData();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!dashboardData) return <p className="loading-text">Loading dashboard...</p>;

  return (
    <div className="dashboard-container">
      {/* Welcome Message */}
      <h1 className="dashboard-header">Welcome, {user?.name}!</h1>
      <p className="dashboard-subtext">Manage your activities and stay updated.</p>

      {/* Dashboard Stats Widgets */}
      <div className="dashboard-grid">
        {user?.role === "volunteer" ? (
          <>
            <div className="dashboard-widget">
              <Calendar size={32} className="widget-icon" />
              <div className="widget-text">
                <h2>Upcoming Events</h2>
                <p>{dashboardData.upcomingEvents?.length ?? 0}</p>
              </div>
            </div>
            <div className="dashboard-widget">
              <Users size={32} className="widget-icon" />
              <div className="widget-text">
                <h2>Total Events Joined</h2>
                <p>{dashboardData.eventsCount ?? 0}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="dashboard-widget">
              <Calendar size={32} className="widget-icon" />
              <div className="widget-text">
                <h2>Total Events Created</h2>
                <p>{dashboardData.eventsCount ?? 0}</p>
              </div>
            </div>
            <div className="dashboard-widget">
              <FileText size={32} className="widget-icon" />
              <div className="widget-text">
                <h2>Pending Applications</h2>
                <p>{dashboardData.pendingApplications ?? 0}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="dashboard-actions">
        {user?.role === "event_manager" && (
          <button onClick={() => navigate("/create-event")} className="btn">
            + Create Event
          </button>
        )}
        
      </div>
    </div>
  );
};

export default Dashboard;
