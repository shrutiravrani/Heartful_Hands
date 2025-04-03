import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "./EventManagerEvents.css";

// Event manager's events page
const EventManagerEvents = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Load events when component mounts
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/events");
        setEvents(data.events || []);
      } catch (err) {
        console.error("Could not load events:", err);
        setError(err.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Delete an event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await API.delete(`/events/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Could not delete event");
    }
  };

  // Filter events based on search term
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading or error states
  if (loading) return <div className="loading">Loading your events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="events-container">
      <div className="events-header">
        <div className="header-left">
          <h2>My Events</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <Link to="/create-event" className="create-event-btn">
          Create New Event
        </Link>
      </div>

      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            {searchTerm ? (
              <p>No events match your search</p>
            ) : (
              <p>You haven't created any events yet</p>
            )}
          </div>
        ) : (
          filteredEvents.map((event) => (
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
                <div className="volunteer-count">
                  Volunteers: {event.applicants?.length || 0}
                </div>
              </div>
              <div className="event-actions">
                <button 
                  onClick={() => navigate(`/manage-applications/${event._id}`)} 
                  className="action-btn"
                >
                  Manage Applications
                </button>
                <Link 
                  to={`/events/${event._id}/complete`} 
                  className="action-btn complete-btn"
                >
                  Complete & Rate
                </Link>
                <button 
                  onClick={() => handleDeleteEvent(event._id)} 
                  className="action-btn delete-btn"
                >
                  Delete Event
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventManagerEvents;
