import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { FaMapMarkerAlt, FaUser, FaCalendar, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";
import "./EventDetails.css"; // Importing the new CSS file

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, userRes] = await Promise.all([
          API.get(`/events/${id}`),
          API.get("/users/me"),
        ]);
        setEvent(eventRes.data);
        setUser(userRes.data);
      } catch (error) {
        setError("Failed to load event details");
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApply = async () => {
    try {
      await API.post(`/events/${id}/apply`);
      toast.success("Successfully applied for the event!");
      const response = await API.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to apply for event");
    }
  };

  const handleComplete = () => {
    navigate(`/events/${id}/complete`);
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!event) {
    return <div className="error-message">Event not found</div>;
  }

  const isVolunteer = user?.role === "volunteer";
  const isEventManager = user?.role === "event_manager";
  const isCreator = user?._id === event.createdBy._id;
  const hasApplied = event.applicants?.some((app) => app.user._id === user?._id);
  const isAccepted = event.applicants?.some(
    (app) => app.user._id === user?._id && app.status === "accepted"
  );

  return (
    <div className="event-container">
      <div className="event-card">
        {/* Event Header */}
        <div className="event-header">
          <h1>{event.title}</h1>
          <div className="event-details">
            <p><FaCalendar /> {new Date(event.date).toLocaleDateString()}</p>
            <p><FaClock /> {new Date(event.date).toLocaleTimeString()}</p>
            <p><FaMapMarkerAlt /> {event.location}</p>
          </div>
        </div>

        {/* Event Description */}
        <div className="event-section">
          <h2>Description</h2>
          <p>{event.description}</p>
        </div>

        {/* Event Manager */}
        <div className="event-section">
          <h2>Event Manager</h2>
          <div className="event-manager">
            <FaUser className="manager-icon" />
            <div>
              <p className="manager-name">{event.createdBy.name}</p>
              <p>{event.createdBy.email}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="button-container">
          {isVolunteer && !hasApplied && (
            <button className="apply-button" onClick={handleApply}>
              Apply for Event
            </button>
          )}
          {isVolunteer && isAccepted && (
            <button className="complete-button" onClick={handleComplete}>
              Complete Event
            </button>
          )}
          {isEventManager && isCreator && (
            <button className="manage-button" onClick={() => navigate(`/manage-applications/${id}`)}>
              Manage Applications
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
