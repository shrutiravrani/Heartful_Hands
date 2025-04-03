import React, { useState } from 'react';
import RateVolunteer from './RateVolunteer';
import './EventCompletion.css';

const EventCompletion = ({ event, volunteer, onComplete, onClose }) => {
  const [formData, setFormData] = useState({
    hoursServed: '',
    feedback: '',
    skillsDemonstrated: []
  });

  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState({});

  const skillOptions = [
    'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Time Management',
    'Technical Skills', 'Customer Service', 'Organization', 'Adaptability', 'Initiative'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => {
      const skills = prev.skillsDemonstrated.includes(skill)
        ? prev.skillsDemonstrated.filter(s => s !== skill)
        : [...prev.skillsDemonstrated, skill];
      return { ...prev, skillsDemonstrated: skills };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.hoursServed) newErrors.hoursServed = 'Hours served is required';
    else if (isNaN(formData.hoursServed) || formData.hoursServed <= 0) newErrors.hoursServed = 'Enter a valid number of hours';
    
    if (!formData.feedback.trim()) newErrors.feedback = 'Feedback is required';
    if (formData.skillsDemonstrated.length === 0) newErrors.skills = 'Select at least one skill';
    if (!rating) newErrors.rating = 'Rate the volunteer';

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      onComplete({ ...formData, rating });
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="event-completion-form">
      <h2>Complete Volunteer Participation</h2>
      <p className="volunteer-name">Volunteer: {volunteer.name}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="hoursServed">Hours Served:</label>
          <input
            type="number"
            id="hoursServed"
            name="hoursServed"
            value={formData.hoursServed}
            onChange={handleInputChange}
            min="0"
            step="0.5"
          />
          {errors.hoursServed && <span className="error">{errors.hoursServed}</span>}
        </div>

        <div className="form-group">
          <RateVolunteer
            volunteerId={volunteer._id}
            eventId={event._id}
            onRatingComplete={(ratingData) => setRating(ratingData.rating)}
          />
          {errors.rating && <span className="error">{errors.rating}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="feedback">Feedback:</label>
          <textarea
            id="feedback"
            name="feedback"
            value={formData.feedback}
            onChange={handleInputChange}
            rows="4"
          />
          {errors.feedback && <span className="error">{errors.feedback}</span>}
        </div>

        <div className="form-group">
          <label>Skills Demonstrated:</label>
          <div className="skills-grid">
            {skillOptions.map(skill => (
              <label key={skill} className="skill-item">
                <input
                  type="checkbox"
                  checked={formData.skillsDemonstrated.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                />
                {skill}
              </label>
            ))}
          </div>
          {errors.skills && <span className="error">{errors.skills}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">Complete Participation</button>
          <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EventCompletion;
