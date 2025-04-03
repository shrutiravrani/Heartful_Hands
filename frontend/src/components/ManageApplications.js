import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const ManageApplications = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!id) {
          setError('No event ID provided');
          setLoading(false);
          return;
        }

        console.log('Event ID from params:', id);
        const response = await API.get(`/events/${id}/applications`);
        console.log("API Response:", response.data);
    
        if (!response.data || !Array.isArray(response.data.applicants)) {
          throw new Error('Invalid response format');
        }
    
        setApplications(response.data.applicants);
      } catch (err) {
        console.error("Error Fetching Applications:", err);
        console.error("Error details:", err.response?.data);
        setError(err.response?.data?.error || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [id]);

  const updateStatus = async (applicationId, newStatus) => {
    try {
      console.log(`Updating application ${applicationId} to ${newStatus}`);
      const response = await API.put(`/events/${id}/applications/${applicationId}`, { 
        status: newStatus.toLowerCase()
      });

      console.log('Update response:', response.data);

      if (response.status === 200) {
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
        alert(`Application ${newStatus.toLowerCase()} successfully`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.error || 'Failed to update application status');
    }
  };

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return (
    <div className="error-container">
      <p className="error">{error}</p>
      <button onClick={() => navigate('/event-manager-events')}>Back to Events</button>
    </div>
  );

  return (
    <div className="manage-applications-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Manage Applications</h2>
        <button 
          onClick={() => navigate('/event-manager-events')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Events
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="no-applications" style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>No applications for this event</p>
        </div>
      ) : (
        <div className="applications-list" style={{ display: 'grid', gap: '20px' }}>
          {applications.map(app => (
            <div 
              key={app._id} 
              className="application-card"
              style={{
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div className="application-info">
                <h3 style={{ margin: '0 0 10px 0' }}>{app.user?.name || 'Unknown'}</h3>
                <p><strong>Email:</strong> {app.user?.email || 'Unknown'}</p>
                <p><strong>Bio:</strong> {app.user?.bio || 'No bio available'}</p>
                <p><strong>Status:</strong> <span style={{
                  color: app.status === 'Pending' ? '#f0ad4e' : 
                         app.status === 'Accepted' ? '#5cb85c' : '#d9534f'
                }}>{app.status}</span></p>
              </div>
              
              <div className="action-buttons" style={{ 
                marginTop: '15px',
                display: 'flex',
                gap: '10px'
              }}>
                <button 
                  onClick={() => navigate(`/volunteer-profile/${app.user?._id}`)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0275d8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  View Profile
                </button>
                {app.status === 'Pending' && (
                  <>
                    <button 
                      onClick={() => updateStatus(app._id, 'Accepted')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#5cb85c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => updateStatus(app._id, 'Rejected')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#d9534f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
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
