import React, { useState, useEffect } from "react";
import API from "../api";
import { io } from "socket.io-client";
import "./SendMessages.css";

// Initialize socket with the backend URL from the API configuration
const socket = io(API.defaults.baseURL, {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

const SendMessages = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      console.log("Connecting to socket with userId:", userId);
      socket.emit("joinUserRoom", userId);
      
      socket.on("connect", () => {
        console.log("Socket connected successfully");
      });
      
      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setError("Connection error. Please refresh the page.");
      });
      
      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });
    }
    
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setError("");
        const response = await API.get("/events/created");
        if (Array.isArray(response.data)) {
          setEvents(response.data);
        } else {
          setError("Failed to load events");
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      const fetchVolunteers = async () => {
        try {
          setError("");
          const response = await API.get(`/events/${selectedEvent}/volunteers`);
          if (Array.isArray(response.data)) {
            setVolunteers(response.data);
            setSelectedVolunteers([]);
            setSelectAll(false);
          } else {
            setError("Failed to load volunteers");
          }
        } catch (err) {
          console.error("Error fetching volunteers:", err);
          setError("Failed to load volunteers");
        }
      };
      fetchVolunteers();
    } else {
      setVolunteers([]);
      setSelectedVolunteers([]);
      setSelectAll(false);
    }
  }, [selectedEvent]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedVolunteers([]);
    } else {
      setSelectedVolunteers(volunteers.map((v) => v._id));
    }
    setSelectAll(!selectAll);
  };

  const handleVolunteerSelection = (volunteerId) => {
    setSelectedVolunteers((prev) => {
      const isSelected = prev.includes(volunteerId);
      const newSelection = isSelected
        ? prev.filter((id) => id !== volunteerId)
        : [...prev, volunteerId];
      setSelectAll(newSelection.length === volunteers.length);
      return newSelection;
    });
  };

  const handleSendMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to send messages");
      return;
    }

    if (!selectedEvent || selectedVolunteers.length === 0 || !message.trim()) {
      setError("Please select an event, at least one volunteer, and enter a message");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Format the message data according to server expectations
      const messageData = {
        eventId: selectedEvent,
        recipients: selectedVolunteers,
        message: message.trim(), // Changed back to 'message' from 'text'
        senderId: localStorage.getItem("userId") // Changed from 'sender' to 'senderId'
      };

      // Validate the message data
      if (!messageData.message || messageData.message.trim().length === 0) {
        throw new Error("Message cannot be empty");
      }

      console.log("Sending message with data:", messageData);

      const response = await API.post("/chat/send", messageData);

      if (response.data) {
        // Emit socket event
        socket.emit("sendMessage", {
          ...response.data,
          sender: { _id: localStorage.getItem("userId") },
        });

        setMessage("");
        setSelectedVolunteers([]);
        setSelectAll(false);
        alert("Message sent successfully!");
      } else {
        throw new Error("No response from server");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      console.error("Error response:", err.response?.data);
      
      // More specific error messages based on the error type
      if (err.response?.status === 400) {
        setError(err.response.data.message || "Invalid message format. Please try again.");
      } else if (err.response?.status === 401) {
        setError("You are not authorized to send messages. Please log in again.");
      } else if (err.response?.status === 500) {
        setError("Server error occurred. Please try again later.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to send message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-messages-container">
      <div className="send-messages-header">Send Messages</div>
      <p className="send-messages-subtext">
        Send messages to volunteers from your events
      </p>

      <div className="send-messages-grid">
        <div className="left-panel">
          <label className="event-label">Select Event</label>
          <select
            className="event-dropdown"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">Choose an event...</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>

          {selectedEvent && volunteers.length > 0 && (
            <div className="recipients-list">
              <div className="recipients-header">
                <h2 className="recipients-title">Recipients</h2>
                <p className="recipients-count">
                  {selectedVolunteers.length} volunteer
                  {selectedVolunteers.length !== 1 ? "s" : ""} selected
                </p>
                <button className="select-all-button" onClick={handleSelectAll}>
                  {selectAll ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="recipients-container">
                {volunteers.map((volunteer) => (
                  <div
                    key={volunteer._id}
                    className={`recipient-item ${
                      selectedVolunteers.includes(volunteer._id)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => handleVolunteerSelection(volunteer._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedVolunteers.includes(volunteer._id)}
                      onChange={() => handleVolunteerSelection(volunteer._id)}
                      className="recipient-checkbox"
                    />
                    <div className="recipient-info">
                      <div className="recipient-name">{volunteer.name}</div>
                      <div className="recipient-email">{volunteer.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="right-panel">
          {error && <div className="error-box">{error}</div>}

          <h2 className="message-title">Compose Message</h2>
          <p className="message-subtext">
            Write your message to the selected volunteers
          </p>
          <textarea
            className="message-box"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
          />

          <button
            className={`send-button ${
              loading || !message.trim() || selectedVolunteers.length === 0
                ? "disabled"
                : ""
            }`}
            onClick={handleSendMessage}
            disabled={loading || !message.trim() || selectedVolunteers.length === 0}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMessages;
