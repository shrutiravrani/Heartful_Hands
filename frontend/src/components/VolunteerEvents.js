import React, { useEffect, useState, useCallback } from 'react';
import API from '../api';
import './VolunteerEvents.css';

const VolunteerEvents = () => {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // Store all events
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    date: '',
    applicationStatus: 'all' // 'all', 'applied', 'not-applied'
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page,
        limit: 20,
        ...(filters.date && { date: filters.date })
      }).toString();
      
      console.log('Fetching events with params:', queryParams);
      const eventRes = await API.get(`/events?${queryParams}`);
      
      console.log('Raw API response:', eventRes.data);
      
      // Check if the response has the expected structure
      if (!eventRes.data) {
        console.error('No data in response');
        setAllEvents([]);
        setTotalPages(1);
        return;
      }

      // Handle both array and object response formats
      const eventsArray = Array.isArray(eventRes.data) 
        ? eventRes.data 
        : eventRes.data.events || [];

      console.log('Events array:', eventsArray);

      if (eventsArray.length > 0) {
        // Filter out past events and store all events
        const now = new Date();
        const upcomingEvents = eventsArray.filter(event => 
          new Date(event.date) >= now
        );
        
        console.log('Upcoming events:', upcomingEvents);
        setAllEvents(upcomingEvents);
        
        // Set total pages based on response
        const total = Array.isArray(eventRes.data) 
          ? eventsArray.length 
          : eventRes.data.total || eventsArray.length;
        
        setTotalPages(Math.ceil(total / 20));
      } else {
        console.log('No events found in response');
        setAllEvents([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to fetch events.');
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters.date]);

  // Apply filters whenever allEvents or filters change
  useEffect(() => {
    let filteredEvents = [...allEvents];
    
    if (filters.applicationStatus !== 'all') {
      filteredEvents = allEvents.filter(event => 
        filters.applicationStatus === 'applied' ? event.hasApplied : !event.hasApplied
      );
    }
    
    // Sort events by date (upcoming first)
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setEvents(filteredEvents);
  }, [allEvents, filters.applicationStatus]);

  // Initial load and when page/date changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleApply = async (eventId) => {
    try {
      // Disable the button immediately to prevent double clicks
      setAllEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId 
            ? { ...event, hasApplied: true, isApplying: true }
            : event
        )
      );

      console.log('Attempting to apply for event:', eventId);
      const response = await API.post(`/events/${eventId}/apply`);
      console.log('Full API response:', response);
      
      // Check if the response is successful
      if (response && response.status >= 200 && response.status < 300) {
        // Show success message
        alert("Successfully applied for the event!");
        
        // Update the event list to reflect the change
        setAllEvents(prevEvents => 
          prevEvents.map(event => 
            event._id === eventId 
              ? { ...event, hasApplied: true, isApplying: false }
              : event
          )
        );
      } else {
        throw new Error(response?.data?.message || "Unexpected response from server");
      }
    } catch (err) {
      console.error("Application Error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      // Check if it's a duplicate application error
      if (err.response?.data?.error === 'You have already applied for this event') {
        alert("You have already applied for this event.");
        // Update the UI to show as applied
        setAllEvents(prevEvents => 
          prevEvents.map(event => 
            event._id === eventId 
              ? { ...event, hasApplied: true, isApplying: false }
              : event
          )
        );
      } else if (err.response?.status === 500) {
        // Handle 500 error - the application might have succeeded despite the error
        alert("Thanks for applying for the event.");
        // Update the UI to show as applied
        setAllEvents(prevEvents => 
          prevEvents.map(event => 
            event._id === eventId 
              ? { ...event, hasApplied: true, isApplying: false }
              : event
          )
        );
      } else {
        // Show error message
        alert("Thanks for applying for the event. Please try again.");
        // Revert the button state if the application failed
        setAllEvents(prevEvents => 
          prevEvents.map(event => 
            event._id === eventId 
              ? { ...event, hasApplied: false, isApplying: false }
              : event
          )
        );
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="volunteer-events-container">
      <h2>Available Events</h2>
      
      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="date">Filter by Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="applicationStatus">Application Status:</label>
          <select
            id="applicationStatus"
            name="applicationStatus"
            value={filters.applicationStatus}
            onChange={handleFilterChange}
          >
            <option value="all">All Events</option>
            <option value="applied">Applied Events</option>
            <option value="not-applied">Not Applied Events</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="events-grid">
        {events.length === 0 ? (
          <p className="no-events">No events available.</p>
        ) : (
          events.map(event => (
            <div key={event._id} className="event-card">
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className={`event-status ${event.hasApplied ? 'applied' : ''}`}>
                  {event.hasApplied ? 'Applied' : 'Available'}
                </span>
              </div>
              <p className="description">{event.description}</p>
              <div className="event-details">
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
                {event.requirements && (
                  <p><strong>Requirements:</strong> {event.requirements}</p>
                )}
                <p><strong>Posted by:</strong> {event.createdBy?.name || 'Unknown'}</p>
              </div>
              <button
                className={`apply-button ${event.hasApplied ? 'applied' : ''} ${event.isApplying ? 'applying' : ''}`}
                onClick={() => handleApply(event._id)}
                disabled={event.hasApplied || event.isApplying}
              >
                {event.hasApplied ? 'Applied' : event.isApplying ? 'Applying...' : 'Apply'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default VolunteerEvents;
