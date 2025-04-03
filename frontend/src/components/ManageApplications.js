import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import './ManageApplications.css';

const ManageApplications = () => {
  // Get event ID from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch applications when component mounts
  useEffect(() => {
    const getApplications = async () => {
      try {
        // Validate event ID
        if (!id) {
          setErrorMessage('Event ID is missing');
          setIsLoading(false);
          return;
        }

        // Fetch applications from API
        const response = await API.get(`/events/${id}/applications`);
        
        // Validate response data
        if (!response.data?.applicants) {
          throw new Error('Invalid response from server');
        }

        // Update applications state
        setApplications(response.data.applicants);
      } catch (error) {
        // Handle API errors
        const errorMsg = error.response?.data?.error || 'Failed to load applications';
        setErrorMessage(errorMsg);
        console.error('Error loading applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getApplications();
  }, [id]);

  // Handle application status updates
  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      // Update application status
      const response = await API.put(`/events/${id}/applications/${applicationId}`, { 
        status: newStatus.toLowerCase()
      });

      // Update local state if API call succeeds
      if (response.status === 200) {
        setApplications(currentApps => 
          currentApps.map(app => 
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        );
        alert(`Application ${newStatus.toLowerCase()} successfully`);
      }
    } catch (error) {
      // Handle update errors
      const errorMsg = error.response?.data?.error || 'Failed to update application status';
      alert(errorMsg);
      console.error('Error updating application:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading applications...</p>
      </div>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <div className="error-container">
        <p className="error-message">{errorMessage}</p>
        <button 
          className="back-button"
          onClick={() => navigate('/event-manager-events')}
        >
          Back to Events
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="manage-applications-container">
      <div className="header-section">
        <h2>Manage Applications</h2>
        <button 
          className="back-button"
          onClick={() => navigate('/event-manager-events')}
        >
          Back to Events
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="no-applications">
          <p>No applications for this event</p>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(application => (
            <div 
              key={application._id} 
              className="application-card"
            >
              <div className="application-info">
                <h3>{application.user?.name || 'Unknown'}</h3>
                <p><strong>Email:</strong> {application.user?.email || 'Unknown'}</p>
                <p><strong>Bio:</strong> {application.user?.bio || 'No bio available'}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`status-badge status-${application.status.toLowerCase()}`}>
                    {application.status}
                  </span>
                </p>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="view-profile-button"
                  onClick={() => navigate(`/volunteer-profile/${application.user?._id}`)}
                >
                  View Profile
                </button>
                {application.status === 'Pending' && (
                  <>
                    <button 
                      className="accept-button"
                      onClick={() => handleStatusUpdate(application._id, 'Accepted')}
                    >
                      Accept
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleStatusUpdate(application._id, 'Rejected')}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageApplications;
