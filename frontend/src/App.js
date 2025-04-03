import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import API from "./api";

// Import Components
import LandingPage from "./components/LandingPage";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Profile from "./components/Profile";
import PostFeed from "./components/PostFeed";
import CreateEvent from "./components/CreateEvent";
import ManageApplications from "./components/ManageApplications";
import CreatePost from "./components/CreatePost";
import Dashboard from "./components/Dashboard";
import Reports from "./components/Reports";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import VolunteerEvents from "./components/VolunteerEvents";
import EventManagerEvents from "./components/EventManagerEvents";
import Notifications from "./components/Notifications";
import SendMessages from "./components/SendMessages";
import Sidebar from "./components/Sidebar";
import VolunteerSidebar from "./components/VolunteerSidebar";
import VolunteerChat from "./components/VolunteerChat";
import EventManagerChat from "./components/EventManagerChat";
import UserGuide from "./pages/UserGuide";
import EventCompletionPage from "./pages/EventCompletionPage";
import Training from './pages/Training';

// Import Theme Provider & Toggle
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        // If token exists, try to fetch user profile
        const res = await API.get("/users/profile");
        setUser(res.data);
        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setUser(null);
        // Clear localStorage on error
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  );

  return (
    <ThemeProvider>
      <Router>
        <MainLayout user={user} />
      </Router>
    </ThemeProvider>
  );
}

const MainLayout = ({ user }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-all">
      {/* Show Navbar ONLY if user is NOT logged in */}
      {!user && location.pathname !== "/" && (
        <nav className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-md">
          <h1 className="text-xl font-bold">Volunteer Management</h1>
          <ThemeToggle />
        </nav>
      )}

      <div className="flex">
        {/* Show appropriate Sidebar based on user role */}
        {user && location.pathname !== "/" && (
          user.role === "volunteer" ? <VolunteerSidebar /> : <Sidebar user={user} />
        )}

        {/* Main Content Area */}
        <div className={user && location.pathname !== "/" ? "ml-64 w-full p-6" : "w-full"}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes (Only for Logged-in Users) */}
            {user ? (
              <>
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/feed" element={<PostFeed />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/send-messages" element={<SendMessages />} />
                <Route path="/user-guide" element={<UserGuide user={user} />} />
                <Route path="/training" element={<Training />} />
                
                {/* Chat Routes */}
                {user.role === "event_manager" ? (
                  <Route path="/messages" element={<EventManagerChat />} />
                ) : (
                  <Route path="/messages" element={<VolunteerChat />} />
                )}

                {/* Role-Based Routes */}
                {user.role === "volunteer" ? (
                  <>
                    <Route path="/volunteer-events" element={<VolunteerEvents />} />
                    <Route path="/events/:eventId/complete" element={<EventCompletionPage />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="*" element={<Navigate to="/404" />} />
                  </>
                ) : (
                  <>
                    <Route path="/event-manager-events" element={<EventManagerEvents />} />
                    <Route path="/create-event" element={<CreateEvent />} />
                    <Route path="/manage-applications/:id" element={<ManageApplications />} />
                    <Route path="/volunteer-profile/:id" element={<Profile />} />
                    <Route path="/volunteer/:username" element={<Profile />} />
                    <Route path="/events/:eventId/complete" element={<EventCompletionPage />} />
                    <Route path="*" element={<Navigate to="/event-manager-events" />} />
                  </>
                )}
              </>
            ) : (
              // Redirect Unauthenticated Users to Login
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
