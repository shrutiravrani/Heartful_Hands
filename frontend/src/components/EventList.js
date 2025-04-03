import React, { useEffect, useState } from "react";
import API from "../api";
import "./EventList.css"; // Import the updated CSS

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [appliedEvents, setAppliedEvents] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventRes = await API.get("/events");
        setEvents(eventRes.data.events);

        // Fetch applied events only if the user is a volunteer
        const userRes = await API.get("/users/profile");
        if (userRes.data.role === "volunteer") {
          const appliedRes = await API.get("/events/my-applications");
          const appliedEventIds = new Set(appliedRes.data.map((event) => event._id));
          setAppliedEvents(appliedEventIds);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleApply = async (eventId) => {
    try {
      const response = await API.post(`/events/${eventId}/apply`);
      console.log("API Response:", response);

      if (response?.status === 200 || response?.status === 201) {
        setAppliedEvents((prev) => new Set([...prev, eventId]));
        alert("Successfully applied for the event!");
      } else {
        throw new Error(response?.data?.message || "Unexpected response from the server.");
      }
    } catch (err) {
      console.error("Application Error:", err);
      alert(err.response?.data?.error || "Failed to apply for the event. Please try again.");
    }
  };

  if (loading) return <p className="event-details">Loading events...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="event-container">
      <h2 className="event-header">Available Events</h2>

      {events.length === 0 ? (
        <p className="event-details">No events available.</p>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <div key={event._id} className="event-card">
              <h4 className="event-title">{event.title}</h4>
              <p className="event-details">
                <strong>Description:</strong> {event.description}
              </p>
              <p className="event-details">
                <strong>Date:</strong> {new Date(event.date).toDateString()}
              </p>
              <p className="event-details">
                <strong>Location:</strong> {event.location}
              </p>

              {/* Apply button changes to "Applied" when clicked */}
              <button
                onClick={() => handleApply(event._id)}
                className="apply-btn"
                disabled={appliedEvents.has(event._id)}
              >
                {appliedEvents.has(event._id) ? "Applied" : "Apply"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
