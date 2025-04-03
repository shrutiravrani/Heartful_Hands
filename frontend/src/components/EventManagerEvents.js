import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "./EventManagerEvents.css";

const EventManagerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventRes = await API.get("/events");
        setEvents(eventRes.data.events || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch events.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await API.delete(`/events/${eventId}`);
      setEvents(events.filter((event) => event._id !== eventId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete event.");
    }
  };

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="events-container">
      <div className="events-header">
        <h2>My Events</h2>
        <Link to="/create-event" className="create-event-btn">
          Create New Event
        </Link>
      </div>

      <div className="events-grid">
        {events.map((event) => (
          <div key={event._id} className="event-card">
            <div className="event-info">
              <h3>{event.title}</h3>
              <p className="event-description">{event.description}</p>
              <div className="event-meta">
                <span>
                  <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                </span>
                <span>
                  <strong>Location:</strong> {event.location}
                </span>
                <span className={`status ${event.status || "pending"}`}>
                  {event.status?.charAt(0).toUpperCase() + event.status?.slice(1) || "Pending"}
                </span>
              </div>
              <div className="volunteer-count">Volunteers: {event.applicants?.length || 0}</div>
            </div>
            <div className="event-actions">
              <button onClick={() => navigate(`/manage-applications/${event._id}`)} className="action-btn">
                Manage Applications
              </button>
              <Link to={`/events/${event._id}/complete`} className="action-btn complete-btn">
                Complete & Rate
              </Link>
              <button onClick={() => handleDeleteEvent(event._id)} className="action-btn delete-btn">
                Delete Event
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventManagerEvents;
