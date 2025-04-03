import React, { useEffect, useState } from "react";
import API from "../api";
import { Chart, ArcElement, BarElement, Tooltip, Legend, CategoryScale, LinearScale, Title, PointElement, LineElement } from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "./Reports.css";

// Set up Chart.js with all the components we need
Chart.register(ArcElement, BarElement, Tooltip, Legend, CategoryScale, LinearScale, Title, PointElement, LineElement);

const Reports = () => {
  // State for managing reports data and UI
  const [reportsData, setReportsData] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch reports data when component mounts
  useEffect(() => {
    const loadReports = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        if (!token) {
          setErrorMessage("Please log in to view reports");
          return;
        }

        // Get user profile to determine role
        const { data: profile } = await API.get("/users/profile");
        setUserRole(profile.role);

        if (!profile.role) {
          setErrorMessage("Unable to determine user role");
          return;
        }

        // Fetch reports based on user role
        const endpoint = profile.role === "volunteer" ? "/reports/volunteer" : "/reports/manager";
        const { data } = await API.get(endpoint);

        if (!data) {
          setErrorMessage("No data available");
          return;
        }

        setReportsData(data);
      } catch (err) {
        const error = err.response?.data?.message || "Failed to load reports";
        setErrorMessage(error);
        console.error("Error loading reports:", err);
      }
    };

    loadReports();
  }, []);

  // Generate chart data for volunteer participation over time
  const getVolunteerChartData = () => {
    const months = [];
    const eventCounts = [];
    
    // Get data for last 4 months
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      months.push(month);
      eventCounts.push(reportsData.monthlyParticipation[month] || 0);
    }

    return { months, eventCounts };
  };

  // Generate chart data for recent participation
  const getRecentParticipationData = () => {
    const months = [];
    const counts = [];
    
    // Get data for last 2 months
    for (let i = 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      months.push(month);
      counts.push(reportsData.monthlyParticipation[month] || 0);
    }

    return { months, counts };
  };

  // Render volunteer overview charts
  const renderVolunteerOverview = () => {
    const { months, eventCounts } = getVolunteerChartData();
    const { months: recentMonths, counts: recentCounts } = getRecentParticipationData();

    return (
      <div className="grid-container">
        {/* Monthly participation trend */}
        <div className="report-card">
          <h3>Monthly Participation</h3>
          <div className="chart-container">
            <Line
              data={{
                labels: months,
                datasets: [
                  {
                    label: 'Events Participated',
                    data: eventCounts,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Event Participation (Last 4 Months)',
                    font: {
                      size: 16
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Event status distribution */}
        <div className="report-card">
          <h3>Event Status</h3>
          <div className="chart-container">
            <Doughnut
              data={{
                labels: ["Upcoming", "Completed"],
                datasets: [{ 
                  data: [reportsData.eventMetrics.upcomingCount, reportsData.eventMetrics.completedCount], 
                  backgroundColor: ["#4CAF50", "#2196F3"] 
                }]
              }}
              options={{ plugins: { legend: { position: "bottom" } } }}
            />
          </div>
        </div>

        {/* Recent participation */}
        <div className="report-card">
          <h3>Recent Participation</h3>
          <div className="chart-container">
            <Bar
              data={{
                labels: recentMonths,
                datasets: [
                  {
                    label: 'Events Participated',
                    data: recentCounts,
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Last 2 Months Participation',
                    font: {
                      size: 16
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Generate chart data for manager overview
  const getManagerChartData = () => {
    const months = [];
    const currentDate = new Date();
    
    // Get last 3 months
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(date.toLocaleString('default', { month: 'short' }));
    }

    // Calculate event counts
    const eventCounts = months.map(month => reportsData.monthlyEventTrends[month] || 0);

    return { months, eventCounts };
  };

  // Render manager overview charts
  const renderManagerOverview = () => {
    const { months, eventCounts } = getManagerChartData();

    return (
      <div className="grid-container">
        {/* Event creation and applications */}
        <div className="full-width-chart">
          <h3 className="chart-title">Event Creation & Applications</h3>
          <Bar
            data={{
              labels: months,
              datasets: [
                {
                  label: 'Events Created',
                  data: eventCounts,
                  backgroundColor: '#4CAF50',
                  borderColor: '#4CAF50',
                  borderWidth: 1
                },
                {
                  label: 'Total Applications',
                  data: months.map(month => {
                    const monthEvents = reportsData.events.filter(event => 
                      new Date(event.date).toLocaleString('default', { month: 'short' }) === month
                    );
                    return monthEvents.reduce((sum, event) => sum + event.applicantsCount, 0);
                  }),
                  backgroundColor: '#2196F3',
                  borderColor: '#2196F3',
                  borderWidth: 1
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    font: {
                      size: 14
                    }
                  }
                },
                title: {
                  display: true,
                  text: 'Last 3 Months Overview',
                  font: {
                    size: 16
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    font: {
                      size: 12
                    }
                  },
                  title: {
                    display: true,
                    text: 'Count',
                    font: {
                      size: 14
                    }
                  }
                }
              }
            }}
          />
        </div>

        {/* Application status distribution */}
        <div className="chart-container">
          <h3 className="chart-title">Application Status Distribution</h3>
          <Doughnut
            data={{
              labels: Object.keys(reportsData.applicationMetrics.statusDistribution),
              datasets: [{ 
                data: Object.values(reportsData.applicationMetrics.statusDistribution), 
                backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#DC3545"],
                borderWidth: 2
              }]
            }}
            options={{ 
              plugins: { 
                legend: { position: "bottom" },
                title: {
                  display: true,
                  text: 'Current Applications',
                  font: {
                    size: 14
                  }
                }
              },
              cutout: '70%'
            }}
          />
        </div>

        {/* Top performing events */}
        <div className="chart-container">
          <h3 className="chart-title">Top Performing Events</h3>
          <Bar
            data={{
              labels: reportsData.topEvents.map(event => event.title),
              datasets: [{
                label: 'Applications Received',
                data: reportsData.topEvents.map(event => event.applicantsCount),
                backgroundColor: '#9C27B0',
                borderColor: '#9C27B0',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  // Render tab navigation
  const renderTabs = () => (
    <div className="tabs-container">
      <button 
        onClick={() => setActiveTab("overview")} 
        className={activeTab === "overview" ? "tab-active" : "tab"}
      >
        Overview
      </button>
      <button 
        onClick={() => setActiveTab("details")} 
        className={activeTab === "details" ? "tab-active" : "tab"}
      >
        Detailed Reports
      </button>
    </div>
  );

  // Show loading or error states
  if (errorMessage) return <p className="error-message">{errorMessage}</p>;
  if (!reportsData) return <p className="loading-message">Loading reports...</p>;

  return (
    <div className="reports-container">
      <h1 className="main-title">📊 Reports & Analytics</h1>
      {renderTabs()}
      {activeTab === "overview" ? (
        userRole === "volunteer" ? renderVolunteerOverview() : renderManagerOverview()
      ) : (
        <p className="error-message">Detailed reports not implemented yet.</p>
      )}
    </div>
  );
};

export default Reports;
