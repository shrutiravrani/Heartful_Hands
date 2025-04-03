import React, { useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api';
import './RateVolunteer.css';

const RateVolunteer = ({ volunteerId, eventId, onRatingComplete }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = async (value) => {
    setRating(value);
    setShowFeedback(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      if (!rating) {
        toast.error('Please select a rating');
        return;
      }

      setIsSubmitting(true);
      const response = await API.post(`/events/${eventId}/rate`, {
        volunteerId,
        rating: Number(rating),
        feedback: feedback || ''
      });
      
      toast.success('Rating submitted successfully!');
      if (onRatingComplete) {
        onRatingComplete(response.data);
      }
    } catch (error) {
      console.error('Rating error:', error);
      toast.error(error.response?.data?.error || 'Error submitting rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rate-volunteer">
      <h3>Rate Volunteer</h3>
      <form onSubmit={handleSubmit}>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-button ${star <= (hover || rating) ? 'active' : ''}`}
              onClick={() => handleRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                size={24}
                className={star <= (hover || rating) ? 'filled' : 'empty'}
              />
            </button>
          ))}
        </div>
        {showFeedback && (
          <div className="feedback-section">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add your feedback (optional)"
              className="feedback-input"
            />
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RateVolunteer; 