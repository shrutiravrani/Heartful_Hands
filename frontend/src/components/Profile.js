import React, { useState, useEffect } from "react";
import API from "../api";
import { Camera, Save, Edit3, X, Star, Calendar, Clock, StarHalf } from "lucide-react"; // Modern Icons
import "./Profile.css"; // Import refined styling
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import { useParams, useNavigate } from "react-router-dom";

const Profile = () => {
  const { id, username } = useParams(); // Get either volunteer ID or username from URL
  const navigate = useNavigate();
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    role: "",
    profileImage: "",
    keySkills: [],
    experience: [],
    availability: {
      weekdays: true,
      weekends: true,
      specificDays: []
    },
    preferredEventTypes: [],
    eventsParticipated: {
      total: 0,
      completed: 0,
      ongoing: 0
    },
    ratings: {
      averageRating: 0,
      totalRatings: 0,
      reviews: []
    },
    achievements: [],
    certifications: [],
    recentEvents: []
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  // New state for managing skills input
  const [newSkill, setNewSkill] = useState("");
  const [newExperience, setNewExperience] = useState({
    title: "",
    organization: "",
    duration: "",
    description: ""
  });

  const [activeModal, setActiveModal] = useState(null);

  // Helper function to get full image URL
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Use environment variable for base URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${imageUrl}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        let response;
        
        console.log('Fetching profile with:', { id, username });
        
        if (username) {
          // Fetching by username
          console.log('Fetching by username:', username);
          response = await API.get(`/users/volunteer/${username}`);
          setIsOwnProfile(false);
        } else if (id) {
          // Fetching by ID
          console.log('Fetching by ID:', id);
          response = await API.get(`/users/profile/${id}`);
          setIsOwnProfile(false);
        } else {
          // Fetching own profile
          console.log('Fetching own profile');
          response = await API.get("/users/profile");
          setIsOwnProfile(true);
        }
        
        const { data } = response;
        console.log('Profile Data:', data);
        
        if (!data) {
          throw new Error('No data received from server');
        }
        
        setProfile(data);
        
        if (data.profileImage) {
          const fullImageUrl = getFullImageUrl(data.profileImage);
          console.log('Setting Preview URL:', fullImageUrl);
          setPreviewUrl(fullImageUrl);
        }
      } catch (error) {
        console.error('Profile Fetch Error:', error);
        let errorMessage = "Error fetching profile: ";
        
        if (error.response) {
          console.error('Error response:', error.response.data);
          if (error.response.status === 404) {
            errorMessage += username 
              ? `Volunteer "${username}" not found`
              : id 
                ? `User with ID "${id}" not found`
                : "Profile not found";
          } else if (error.response.status === 401) {
            errorMessage += "You are not authorized to view this profile. Please log in again.";
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          } else if (error.response.status === 400) {
            errorMessage += error.response.data?.error || "Invalid request";
          } else {
            errorMessage += error.response.data?.error || error.response.data?.message || error.message;
          }
        } else if (error.request) {
          console.error('Error request:', error.request);
          errorMessage += "No response from server. Please check your internet connection.";
        } else {
          console.error('Error message:', error.message);
          errorMessage += error.message;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, username, navigate]);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }

      setSelectedFile(file);
      setError("");
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await API.post("/users/upload-profile-image", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (!response.data || !response.data.imageUrl) {
        throw new Error('No image URL in response');
      }
      
      return response.data.imageUrl;
    } catch (error) {
      console.error('Upload Error:', error);
      throw new Error(error.response?.data?.message || "Failed to upload image");
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      setError('');

      // Handle image upload first if there's a new image
      let profileImageUrl = profile.profileImage;
      if (selectedFile) {
        try {
          profileImageUrl = await uploadImage(selectedFile);
        } catch (error) {
          console.error('Image upload error:', error);
          toast.error("Failed to upload image: " + error.message);
          setLoading(false);
          return;
        }
      }

      // Prepare update data
      const updateData = {
        name: profile.name,
        bio: profile.bio || '',
        profileImage: profileImageUrl,
        keySkills: profile.keySkills || [],
        experience: profile.experience || [],
        availability: profile.availability || {
          weekdays: true,
          weekends: true,
          specificDays: []
        },
        preferredEventTypes: profile.preferredEventTypes || [],
        achievements: profile.achievements || [],
        certifications: profile.certifications || []
      };

      const response = await API.put("/users/profile", updateData);
      
      if (response.data && response.data.user) {
        setProfile(response.data.user);
        setPreviewUrl(getFullImageUrl(response.data.user.profileImage));
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.keySkills?.includes(newSkill.trim())) {
      const updatedSkills = [...(profile.keySkills || []), newSkill.trim()];
      setProfile(prev => ({ ...prev, keySkills: updatedSkills }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = (profile.keySkills || []).filter(skill => skill !== skillToRemove);
    setProfile(prev => ({ ...prev, keySkills: updatedSkills }));
  };

  const handleAddExperience = () => {
    if (newExperience.title && newExperience.organization) {
      try {
        const updatedExperience = [...(profile.experience || []), { ...newExperience }];
        setProfile(prev => ({
          ...prev,
          experience: updatedExperience
        }));
        setNewExperience({
          title: "",
          organization: "",
          duration: "",
          description: ""
        });
      } catch (error) {
        console.error('Error adding experience:', error);
        setError('Failed to add experience. Please try again.');
        toast.error('Failed to add experience');
      }
    } else {
      setError('Please fill in at least the title and organization fields.');
      toast.error('Please fill in required fields');
    }
  };

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="filled" size={20} />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="filled" size={20} />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="empty" size={20} />);
    }

    return stars;
  };

  return (
    <div className="profile-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="profile-header">
        <div className="profile-image-container">
          <img 
            src={previewUrl || getFullImageUrl(profile.profileImage) || '/default-avatar.png'} 
            alt={profile.name}
            className="profile-image"
          />
          {isOwnProfile && (
            <label className="image-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="image-upload-input"
                hidden
              />
              <Camera className="camera-icon" />
            </label>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-name-section">
            <h2>{profile.name}</h2>
            {isOwnProfile && (
              <button 
                className="edit-button"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Save size={20} />
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <Edit3 size={20} />
                    <span>Edit</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className="role-badge">{profile.role}</p>
          {profile.role === 'volunteer' && (
            <div className="profile-rating">
              <div className="rating-stars">
                {renderRatingStars(profile.ratings.averageRating)}
              </div>
              <span className="rating-text">
                {profile.ratings.averageRating.toFixed(1)} ({profile.ratings.totalRatings} ratings)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="profile-right-column">
        {!isEditing ? (
          profile.role === 'volunteer' && (
            <>
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <Calendar size={24} />
                  <h3>Accepted Events</h3>
                  <p>Total: {profile.eventsParticipated?.total || 0}</p>
                  <p>Completed: {profile.eventsParticipated?.completed || 0}</p>
                  <p>Ongoing: {profile.eventsParticipated?.ongoing || 0}</p>
                </div>

                <div className="stat-card">
                  <Star size={24} />
                  <h3>Rating</h3>
                  <p className="rating">
                    {typeof profile.ratings?.averageRating === 'number' 
                      ? profile.ratings.averageRating.toFixed(1) 
                      : '0.0'} / 5.0
                  </p>
                  <p>({profile.ratings?.totalRatings || 0} reviews)</p>
                </div>

                <div className="stat-card">
                  <Clock size={24} />
                  <h3>Availability</h3>
                  <p>{profile.availability?.weekdays ? "Weekdays" : ""}</p>
                  <p>{profile.availability?.weekends ? "Weekends" : ""}</p>
                </div>
              </div>

              {/* Two Column Sections */}
              <div className="two-column-sections">
                <div 
                  className="section-container clickable-section"
                  onClick={() => {
                    console.log('Opening skills modal');
                    setActiveModal('skills');
                  }}
                >
                  <h3 className="section-title">Key Skills</h3>
                  <div className="skills-grid">
                    {(profile.keySkills || []).slice(0, 3).map((skill, index) => (
                      <div key={index} className="skill-tag">
                        {skill}
                      </div>
                    ))}
                    {profile.keySkills?.length > 3 && (
                      <div className="more-skills">
                        +{profile.keySkills.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                <div 
                  className="section-container clickable-section"
                  onClick={() => {
                    console.log('Opening experience modal');
                    setActiveModal('experience');
                  }}
                >
                  <h3 className="section-title">Experience</h3>
                  <div className="experience-preview">
                    {(profile.experience || []).slice(0, 2).map((exp, index) => (
                      <div key={index} className="experience-item">
                        <div className="experience-title">{exp.title}</div>
                        <div className="experience-org">{exp.organization}</div>
                      </div>
                    ))}
                    {profile.experience?.length > 2 && (
                      <div className="more-experience">
                        +{profile.experience.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Only show achievements and reviews for own profile */}
              {isOwnProfile && (
                <>
                  <div 
                    className="section-container clickable-section"
                    onClick={() => {
                      console.log('Opening achievements modal');
                      setActiveModal('achievements');
                    }}
                  >
                    <h3 className="section-title">Achievements</h3>
                    <div className="achievements-grid">
                      <div className="achievement-count">
                        {profile.achievements?.length || 0} Achievements
                      </div>
                    </div>
                  </div>

                  {/* Recent Reviews */}
                  {profile.ratings?.reviews?.length > 0 && (
                    <div className="recent-reviews-section">
                      <h3>Recent Reviews</h3>
                      <div className="reviews-grid">
                        {profile.ratings.reviews.slice(0, 3).map((review, index) => (
                          <div key={index} className="review-card">
                            <div className="review-header">
                              <div className="review-rating">
                                {renderRatingStars(review.rating)}
                              </div>
                              <span className="review-date">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="review-comment">{review.review}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Modals */}
              <Modal
                isOpen={activeModal === 'skills'}
                onClose={() => {
                  console.log('Closing skills modal');
                  setActiveModal(null);
                }}
                title="Key Skills"
              >
                <div className="modal-skills-grid">
                  {(profile.keySkills || []).map((skill, index) => (
                    <div key={index} className="modal-skill-tag">
                      <div className="skill-label">Skill {index + 1}</div>
                      <div className="skill-value">{skill}</div>
                    </div>
                  ))}
                </div>
              </Modal>

              <Modal
                isOpen={activeModal === 'experience'}
                onClose={() => {
                  console.log('Closing experience modal');
                  setActiveModal(null);
                }}
                title="Experience"
              >
                <div className="modal-experience-list">
                  {(profile.experience || []).map((exp, index) => (
                    <div key={index} className="modal-experience-card">
                      <div className="experience-label">Experience {index + 1}</div>
                      <div className="experience-content">
                        <div className="experience-field">
                          <span className="field-label">Title:</span>
                          <span className="field-value">{exp.title}</span>
                        </div>
                        <div className="experience-field">
                          <span className="field-label">Organization:</span>
                          <span className="field-value">{exp.organization}</span>
                        </div>
                        <div className="experience-field">
                          <span className="field-label">Duration:</span>
                          <span className="field-value">{exp.duration}</span>
                        </div>
                        <div className="experience-field">
                          <span className="field-label">Description:</span>
                          <span className="field-value">{exp.description}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Modal>

              {/* Only show achievements and reviews modals for own profile */}
              {isOwnProfile && (
                <>
                  <Modal
                    isOpen={activeModal === 'achievements'}
                    onClose={() => {
                      console.log('Closing achievements modal');
                      setActiveModal(null);
                    }}
                    title="Achievements"
                  >
                    <div className="modal-achievements-list">
                      {(profile.achievements || []).map((achievement, index) => (
                        <div key={index} className="modal-achievement-card">
                          <div className="achievement-label">Achievement {index + 1}</div>
                          <div className="achievement-content">
                            <div className="achievement-field">
                              <span className="field-label">Title:</span>
                              <span className="field-value">{achievement.title || 'No title'}</span>
                            </div>
                            <div className="achievement-field">
                              <span className="field-label">Description:</span>
                              <span className="field-value">{achievement.description || 'No description'}</span>
                            </div>
                            <div className="achievement-field">
                              <span className="field-label">Date:</span>
                              <span className="field-value">
                                {achievement.date ? new Date(achievement.date).toLocaleDateString() : 'No date'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!profile.achievements || profile.achievements.length === 0) && (
                        <div className="no-achievements-message">
                          No achievements yet
                        </div>
                      )}
                    </div>
                  </Modal>

                  <Modal
                    isOpen={activeModal === 'reviews'}
                    onClose={() => {
                      console.log('Closing reviews modal');
                      setActiveModal(null);
                    }}
                    title="Reviews"
                  >
                    <div className="modal-reviews-list">
                      {(profile.ratings?.reviews || []).map((review, index) => (
                        <div key={index} className="modal-review-card">
                          <div className="review-label">Review {index + 1}</div>
                          <div className="review-content">
                            <div className="review-field">
                              <span className="field-label">Rating:</span>
                              <div className="review-rating">
                                {renderRatingStars(review.rating || 0)}
                              </div>
                            </div>
                            <div className="review-field">
                              <span className="field-label">Comment:</span>
                              <span className="field-value">{review.review || 'No comment'}</span>
                            </div>
                            <div className="review-field">
                              <span className="field-label">Date:</span>
                              <span className="field-value">
                                {review.date ? new Date(review.date).toLocaleDateString() : 'No date'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!profile.ratings?.reviews || profile.ratings.reviews.length === 0) && (
                        <div className="no-reviews-message">
                          No reviews yet
                        </div>
                      )}
                    </div>
                  </Modal>
                </>
              )}
            </>
          )
        ) : (
          <div className="profile-form">
            <div className="form-row">
              <div className="form-field">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-field full-width">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profile.bio || ""}
                onChange={handleChange}
                className="form-textarea"
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>

            {profile.role === 'volunteer' && (
              <>
                {/* Skills Input */}
                <div className="form-field full-width">
                  <label>Key Skills</label>
                  <div className="skills-input-container">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="form-input"
                      placeholder="Add a skill"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddSkill}
                      className="button add-btn"
                      type="button"
                    >
                      Add
                    </button>
                  </div>
                  <div className="skills-grid">
                    {(profile.keySkills || []).map((skill, index) => (
                      <div key={index} className="skill-tag">
                        {skill}
                        <X
                          size={16}
                          className="remove-skill"
                          onClick={() => handleRemoveSkill(skill)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Input */}
                <div className="form-field full-width">
                  <label>Experience</label>
                  <div className="experience-input-container">
                    <input
                      type="text"
                      value={newExperience.title}
                      onChange={(e) => setNewExperience({
                        ...newExperience,
                        title: e.target.value
                      })}
                      className="form-input"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={newExperience.organization}
                      onChange={(e) => setNewExperience({
                        ...newExperience,
                        organization: e.target.value
                      })}
                      className="form-input"
                      placeholder="Organization"
                    />
                    <input
                      type="text"
                      value={newExperience.duration}
                      onChange={(e) => setNewExperience({
                        ...newExperience,
                        duration: e.target.value
                      })}
                      className="form-input"
                      placeholder="Duration (e.g., Jan 2022 - Present)"
                    />
                    <textarea
                      value={newExperience.description}
                      onChange={(e) => setNewExperience({
                        ...newExperience,
                        description: e.target.value
                      })}
                      className="form-textarea"
                      placeholder="Description"
                      rows="3"
                    />
                    <button
                      onClick={handleAddExperience}
                      className="button add-btn"
                      type="button"
                    >
                      Add Experience
                    </button>
                  </div>
                </div>

                {/* Availability Section */}
                <div className="form-field">
                  <label>Availability</label>
                  <div className="checkbox-group">
                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={profile.availability?.weekdays || false}
                        onChange={(e) => setProfile({
                          ...profile,
                          availability: {
                            ...(profile.availability || { weekdays: false, weekends: false, specificDays: [] }),
                            weekdays: e.target.checked
                          }
                        })}
                      />
                      <label>Weekdays</label>
                    </div>
                    <div className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={profile.availability?.weekends || false}
                        onChange={(e) => setProfile({
                          ...profile,
                          availability: {
                            ...(profile.availability || { weekdays: false, weekends: false, specificDays: [] }),
                            weekends: e.target.checked
                          }
                        })}
                      />
                      <label>Weekends</label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="button-container">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                  setPreviewUrl(getFullImageUrl(profile.profileImage));
                  setError("");
                }}
                className="cancel-button"
                disabled={loading}
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="save-button"
                disabled={loading}
              >
                {loading ? "Saving..." : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
