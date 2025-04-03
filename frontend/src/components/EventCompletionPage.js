import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { toast } from 'react-hot-toast';
import Modal from './Modal';
import './EventCompletionPage.css';

// Simple star rating component
const StarRating = ({ rating, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <div className="star-rating">
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : ''}`}
          onClick={() => onRatingChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

// Main event completion page component
const EventCompletionPage = () => {
  // Get event ID from URL params
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [event, setEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Fetch event and volunteer data
  useEffect(() => {
    const loadEventData = async () => {
      try {
        setLoading(true);
        
        // Get event details
        const eventData = await API.get(`/events/${eventId}`);
        setEvent(eventData.data);

        // Get accepted volunteers
        const volunteersData = await API.get(`/events/${eventId}/accepted-volunteers`);
        setVolunteers(volunteersData.data);
      } catch (err) {
        console.error('Error loading event data:', err);
        setError(err.response?.data?.message || 'Could not load event data');
        toast.error('Failed to load event information');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);

  // Handle opening rating modal for a volunteer
  const handleRateVolunteer = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setTempRating(volunteer.rating || 0);
    setFeedback(volunteer.feedback || '');
    setShowRatingModal(true);
  };

  // Submit rating for a volunteer
  const handleRatingSubmit = async (rating, feedback) => {
    if (!selectedVolunteer?._id) {
      toast.error('Please select a volunteer to rate');
      return;
    }

    // Check auth
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    try {
      // Submit rating to backend
      await API.post(`/events/${eventId}/rate`, {
        volunteerId: selectedVolunteer._id,
        rating: Number(rating),
        feedback: feedback || ''
      });

      // Update local state
      setVolunteers(prev => 
        prev.map(v => 
          v._id === selectedVolunteer._id 
            ? { ...v, rating, feedback }
            : v
        )
      );

      // Close modal and show success
      setShowRatingModal(false);
      setSelectedVolunteer(null);
      toast.success(selectedVolunteer.rating ? 'Rating updated!' : 'Thanks for rating!');
    } catch (err) {
      console.error('Rating submission failed:', err);
      
      if (err.response?.status === 401) {
        toast.error('Please log in again');
        navigate('/login');
        return;
      }

      toast.error(err.response?.data?.error || 'Could not submit rating');
    }
  };

  // Show loading or error states
  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!event) return <div className="error">Could not find this event</div>;

  return (
    <div className="event-completion-page">
      <div className="page-header">
        <h1>Rate Your Volunteers</h1>
        <h2>{event.title}</h2>
        <p className="event-date">
          Event Date: {new Date(event.date).toLocaleDateString()}
        </p>
      </div>

      <div className="volunteers-section">
        <h3>Volunteers to Rate</h3>
        {volunteers.length === 0 ? (
          <div className="no-volunteers">
            <p>No volunteers to rate for this event</p>
            <button 
              className="back-button"
              onClick={() => navigate('/event-manager-events')}
            >
              Back to Events
            </button>
          </div>
        ) : (
          <div className="volunteers-grid">
            {volunteers.map(volunteer => (
              <div key={volunteer._id} className="volunteer-card">
                <div className="volunteer-info">
                  <h4>{volunteer.name}</h4>
                  <p>{volunteer.email}</p>
                  {volunteer.rating ? (
                    <div className="rating-info">
                      <div className="star-rating-display">
                        {[...Array(5)].map((_, index) => (
                          <span
                            key={index}
                            className={`star ${index < volunteer.rating ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="feedback">{volunteer.feedback}</p>
                    </div>
                  ) : (
                    <span className="not-rated">Not rated yet</span>
                  )}
                </div>
                <div className="volunteer-actions">
                  <button
                    onClick={() => handleRateVolunteer(volunteer)}
                    className={`rate-btn ${volunteer.rating ? 'update' : ''}`}
                  >
                    {volunteer.rating ? 'Update Rating' : 'Rate Volunteer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRatingModal && selectedVolunteer && (
        <Modal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedVolunteer(null);
          }}
        >
          <div className="rating-modal">
            <h3>{selectedVolunteer.rating ? 'Update Rating' : 'Rate'} {selectedVolunteer.name}</h3>
            <div className="rating-input">
              <label>Rating:</label>
              <StarRating
                rating={tempRating}
                onRatingChange={setTempRating}
              />
            </div>
            <div className="feedback-input">
              <label>Feedback:</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your feedback..."
                className="feedback-text"
              />
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => handleRatingSubmit(tempRating, feedback)}
                className="submit-btn"
                disabled={tempRating === 0}
              >
                {selectedVolunteer.rating ? 'Update Rating' : 'Submit Rating'}
              </button>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedVolunteer(null);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EventCompletionPage; 