import React, { useEffect, useState, useCallback, useMemo } from 'react';
import API from '../api';
import { Search } from 'lucide-react';
import './VolunteerEvents.css';

const VolunteerEvents = () => {
  // State management
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    applicationStatus: 'all'
  });

  // Fetch events from API
  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page,
        limit: 20,
        ...(filters.date && { date: filters.date })
      }).toString();
      
      const response = await API.get(`/events?${queryParams}`);
      
      if (!response.data) {
        console.error('No data in response');
        setAllEvents([]);
        setTotalPages(1);
        return;
      }

      const eventsArray = Array.isArray(response.data) 
        ? response.data 
        : response.data.events || [];

      if (eventsArray.length > 0) {
        const now = new Date();
        const upcomingEvents = eventsArray.filter(event => 
          new Date(event.date) >= now
        );
        
        setAllEvents(upcomingEvents);
        
        const total = Array.isArray(response.data) 
          ? eventsArray.length 
          : response.data.total || eventsArray.length;
        
        setTotalPages(Math.ceil(total / 20));
      } else {
        setAllEvents([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to fetch events.');
      setAllEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters.date]);

  // Apply filters and search
  const filteredEvents = useMemo(() => {
    let result = [...allEvents];
    
    // Apply application status filter
    if (filters.applicationStatus !== 'all') {
      result = result.filter(event => 
        filters.applicationStatus === 'applied' ? event.hasApplied : !event.hasApplied
      );
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term)
      );
    }
    
    // Sort events by date
    return result.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [allEvents, filters.applicationStatus, searchTerm]);

  // Update events when filters change
  useEffect(() => {
    setEvents(filteredEvents);
  }, [filteredEvents]);

  // Initial load and when page/date changes
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Handle event application
  const handleApply = async (eventId) => {
    try {
      // Update UI immediately
      setAllEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId 
            ? { ...event, hasApplied: true, isApplying: true }
            : event
        )
      );

      const response = await API.post(`/events/${eventId}/apply`);
      
      if (response && response.status >= 200 && response.status < 300) {
        alert("Successfully applied for the event!");
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
      
      if (err.response?.data?.error === 'You have already applied for this event') {
        alert("You have already applied for this event.");
        setAllEvents(prevEvents => 
          prevEvents.map(event => 
            event._id === eventId 
              ? { ...event, hasApplied: true, isApplying: false }
              : event
          )
        );
      } else if (err.response?.status === 500) {
        alert("Thanks for applying for the event.");
        setAllEvents(prevEvents => 
          prevEvents.map(event => 
            event._id === eventId 
              ? { ...event, hasApplied: true, isApplying: false }
              : event
          )
        );
      } else {
        alert("Thanks for applying for the event. Please try again.");
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

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  if (isLoading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="volunteer-events-container">
      <h2>Available Events</h2>
      
      {/* Search and Filters */}
      <div className="search-filters-container">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
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
