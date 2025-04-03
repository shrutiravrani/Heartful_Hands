import React, { useEffect, useState } from "react";
import API from "../api";
import { Chart, ArcElement, BarElement, Tooltip, Legend, CategoryScale, LinearScale, Title, PointElement, LineElement } from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "./Reports.css";

// Register Chart.js Components
Chart.register(ArcElement, BarElement, Tooltip, Legend, CategoryScale, LinearScale, Title, PointElement, LineElement);

const Reports = () => {
  const [reportsData, setReportsData] = useState(null);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in.");
          return;
        }

        const { data: userProfile } = await API.get("/users/profile");
        setRole(userProfile.role);

        if (!userProfile.role) {
          setError("User role not found.");
          return;
        }

        const reportsEndpoint = userProfile.role === "volunteer" ? "/reports/volunteer" : "/reports/manager";
        const { data } = await API.get(reportsEndpoint);

        if (!data) {
          setError("No data received from the server.");
          return;
        }

        setReportsData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reports.");
      }
    };

    fetchReports();
  }, []);

 

  const renderVolunteerOverview = () => {
    // Get current month and previous 3 months
    const months = [];
    const currentDate = new Date();
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(date.toLocaleString('default', { month: 'short' }));
    }
    months.push(currentDate.toLocaleString('default', { month: 'short' }));

    // Get event counts for each month
    const eventCounts = months.map(month => {
      return reportsData.monthlyParticipation[month] || 0;
    });

    return (
      <div className="grid-container">
        <div className="chart-container">
          <h3 className="chart-title">Monthly Event Participation</h3>
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
                  text: 'Last 4 Months'
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

        <div className="chart-container">
          <h3 className="chart-title">Event Status</h3>
          <Doughnut
            data={{
              labels: ["Upcoming", "Completed"],
              datasets: [{ data: [reportsData.eventMetrics.upcomingCount, reportsData.eventMetrics.completedCount], backgroundColor: ["#4CAF50", "#2196F3"] }]
            }}
            options={{ plugins: { legend: { position: "bottom" } } }}
          />
        </div>

        <div className="full-width-chart">
          <h3 className="chart-title">Monthly Participation</h3>
          <Bar
            data={{
              labels: Object.keys(reportsData.monthlyParticipation),
              datasets: [{ label: "Events Participated", data: Object.values(reportsData.monthlyParticipation), backgroundColor: "#4CAF50" }]
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top" } } }}
          />
        </div>
      </div>
    );
  };

  const renderManagerOverview = () => {
    // Get current month and previous 2 months
    const months = [];
    const currentDate = new Date();
    // Start from 2 months ago (i=2) and go up to current month
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(date.toLocaleString('default', { month: 'short' }));
    }

    // Get event counts for each month
    const eventCounts = months.map(month => {
      return reportsData.monthlyEventTrends[month] || 0;
    });

    return (
      <div className="grid-container">
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

  const renderTabs = () => (
    <div className="tabs-container">
      <button onClick={() => setActiveTab("overview")} className={activeTab === "overview" ? "tab-active" : "tab"}>
        Overview
      </button>
      <button onClick={() => setActiveTab("details")} className={activeTab === "details" ? "tab-active" : "tab"}>
        Detailed Reports
      </button>
    </div>
  );

  if (error) return <p className="error-message">{error}</p>;
  if (!reportsData) return <p className="loading-message">Loading reports...</p>;

  return (
    <div className="reports-container">
      <h1 className="main-title">📊 Reports & Analytics</h1>
      {renderTabs()}
      {activeTab === "overview" ? (
        role === "volunteer" ? renderVolunteerOverview() : renderManagerOverview()
      ) : (
        <p className="error-message">Detailed reports not implemented yet.</p>
      )}
    </div>
  );
};

export default Reports;
