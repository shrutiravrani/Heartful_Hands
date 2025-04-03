import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { toast } from 'react-hot-toast';
import Modal from '../components/Modal';
import './EventCompletionPage.css';

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

const EventCompletionPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchEventAndVolunteers = async () => {
      try {
        setLoading(true);
        // Fetch event details
        const eventResponse = await API.get(`/events/${eventId}`);
        console.log('Event data:', eventResponse.data);
        setEvent(eventResponse.data);

        // Fetch accepted volunteers
        const volunteersResponse = await API.get(`/events/${eventId}/accepted-volunteers`);
        console.log('Volunteers data:', volunteersResponse.data);
        setVolunteers(volunteersResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        toast.error('Failed to load event and volunteer data');
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndVolunteers();
  }, [eventId]);

  const handleRateVolunteer = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setTempRating(volunteer.rating || 0);
    setFeedback(volunteer.feedback || '');
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (rating, feedback) => {
    try {
      if (!selectedVolunteer || !selectedVolunteer._id) {
        toast.error('Invalid volunteer selected');
        return;
      }

      console.log('Submitting rating with data:', {
        eventId,
        volunteerId: selectedVolunteer._id,
        rating,
        feedback
      });

      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in again');
        navigate('/login');
        return;
      }

      const response = await API.post(`/events/${eventId}/rate`, {
        volunteerId: selectedVolunteer._id,
        rating: Number(rating),
        feedback: feedback || ''
      });

      console.log('Rating submission response:', response.data);

      // Update local state
      setVolunteers(prevVolunteers => 
        prevVolunteers.map(v => 
          v._id === selectedVolunteer._id 
            ? { ...v, rating, feedback }
            : v
        )
      );

      setShowRatingModal(false);
      setSelectedVolunteer(null);
      toast.success(selectedVolunteer.rating ? 'Rating updated successfully' : 'Volunteer rated successfully');
    } catch (err) {
      console.error('Error rating volunteer:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });

      if (err.response?.status === 401) {
        toast.error('Please log in again');
        navigate('/login');
        return;
      }

      toast.error(err.response?.data?.error || err.response?.data?.details || 'Failed to rate volunteer');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!event) return <div className="error">Event not found</div>;

  return (
    <div className="event-completion-page">
      <div className="page-header">
        <h1>Rate Volunteers</h1>
        <h2>{event.title}</h2>
        <p className="event-date">
          Date: {new Date(event.date).toLocaleDateString()}
        </p>
      </div>

      <div className="volunteers-section">
        <h3>Accepted Volunteers</h3>
        {volunteers.length === 0 ? (
          <div className="no-volunteers">
            <p>No accepted volunteers to rate</p>
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
                placeholder="Enter your feedback..."
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