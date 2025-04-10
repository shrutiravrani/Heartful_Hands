import React, { useState, useEffect } from 'react';
import API from '../api';
import { Upload, Trash2, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import './Training.css';

const Training = () => {
  // State management
  const [trainingVideos, setTrainingVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    video: null
  });
  const [filterEvent, setFilterEvent] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user'));

  // Load initial data
  useEffect(() => {
    loadEvents();
    loadTrainingVideos();
  }, []);

  // Update filtered videos when filter changes
  useEffect(() => {
    const filtered = filterEvent
      ? trainingVideos.filter(video => video.eventId._id === filterEvent)
      : trainingVideos;
    setFilteredVideos(filtered);
  }, [filterEvent, trainingVideos]);

  // Load events created by the user
  const loadEvents = async () => {
    try {
      const response = await API.get('/events/created');
      setEvents(response.data);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error loading events:', err);
    }
  };

  // Load training videos
  const loadTrainingVideos = async () => {
    try {
      setIsLoading(true);
      const response = await API.get('/training/user');
      setTrainingVideos(response.data);
      setFilteredVideos(response.data);
    } catch (err) {
      setError('Failed to load training videos');
      console.error('Error loading training videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection for upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({ ...prev, video: file }));
    }
  };

  // Handle video upload
  const handleUpload = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Validate inputs
      if (!selectedEvent) {
        setError('Please select an event');
        return;
      }

      if (!uploadData.title.trim()) {
        setError('Please enter a title');
        return;
      }

      if (!uploadData.video) {
        setError('Please select a video file');
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('eventId', selectedEvent);
      formData.append('title', uploadData.title.trim());
      formData.append('video', uploadData.video);

      // Upload video
      await API.post('/training/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form and refresh videos
      setShowUploadModal(false);
      setUploadData({ title: '', video: null });
      loadTrainingVideos();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload training video');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video deletion
  const handleDelete = async (trainingId) => {
    if (!window.confirm('Are you sure you want to delete this training video?')) {
      return;
    }

    try {
      await API.delete(`/training/${trainingId}`);
      loadTrainingVideos();
    } catch (err) {
      setError('Failed to delete training video');
      console.error('Error deleting video:', err);
    }
  };

  // Handle video reordering
  const handleReorder = async (trainingId, direction) => {
    try {
      const video = trainingVideos.find(v => v._id === trainingId);
      if (!video) return;

      const currentOrder = video.order || 0;
      const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

      // Validate reorder bounds
      if (newOrder < 0 || newOrder >= trainingVideos.length) return;
      
      // Update order on server
      await API.put(`/training/order/${video.eventId._id}`, {
        trainingId,
        newOrder
      });
      
      // Update local state
      const updatedVideos = [...trainingVideos];
      const videoIndex = updatedVideos.findIndex(v => v._id === trainingId);
      const targetIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;

      // Swap orders
      [updatedVideos[videoIndex].order, updatedVideos[targetIndex].order] = 
      [updatedVideos[targetIndex].order, updatedVideos[videoIndex].order];

      // Sort by order
      updatedVideos.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setTrainingVideos(updatedVideos);
      setFilteredVideos(updatedVideos);
    } catch (err) {
      console.error('Reorder error:', err);
      setError('Failed to reorder training video');
    }
  };

  // Get full video URL
  const getVideoUrl = (videoUrl) => {
    if (!videoUrl) {
      console.error('No video URL provided');
      return '';
    }
    
    // Return full URL if already complete
    if (videoUrl.startsWith('http')) {
      return videoUrl;
    }
    
    // Clean and construct URL
    const cleanUrl = videoUrl.replace(/^undefined/, '');
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${cleanUrl}`;
  };

  // Handle video playback errors
  const handleVideoError = (e) => {
    console.error('Video playback error:', e);
    const video = e.target;
    console.log('Video error details:', {
      src: video.src,
      error: video.error,
      errorCode: video.error?.code,
      errorMessage: video.error?.message,
      networkState: video.networkState,
      readyState: video.readyState
    });
    setError('Failed to load video. Please try again later.');
  };

  // Render video player component
  const renderVideoPlayer = (video) => {
    if (!video?.videoUrl) {
      console.error('Invalid video object:', video);
      return <div className="video-thumbnail">No video available</div>;
    }

    const videoUrl = getVideoUrl(video.videoUrl);
    console.log('Rendering video:', {
      videoId: video._id,
      videoUrl,
      title: video.title
    });

    return (
      <div className="video-thumbnail">
        <video 
          key={videoUrl}
          src={videoUrl}
          controls 
          onError={handleVideoError}
          preload="metadata"
          playsInline
          crossOrigin="anonymous"
          style={{ width: '100%', maxHeight: '400px' }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  // Render event manager view
  const renderEventManagerView = () => (
    <div className="training-container">
      <div className="training-header">
        <h1>Training Videos</h1>
        <button 
          className="upload-button"
          onClick={() => setShowUploadModal(true)}
        >
          <Upload size={20} />
          Upload Training Video
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-section">
        <Filter size={20} />
        <select
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value)}
          className="event-filter"
        >
          <option value="">All Events</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading training videos...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="empty-state">
          <p>No training videos available. {filterEvent ? 'Try selecting a different event.' : 'Upload one to get started!'}</p>
        </div>
      ) : (
        <div className="training-grid">
          {filteredVideos.map((video) => (
            <div key={video._id} className="training-card">
              {renderVideoPlayer(video)}
              <div className="video-info">
                <h3>{video.title}</h3>
                <div className="video-meta">
                  <span>Event: {video.eventId.title}</span>
                </div>
              </div>
              <div className="video-actions">
                <button onClick={() => handleReorder(video._id, 'up')}>
                  <ArrowUp size={20} />
                </button>
                <button onClick={() => handleReorder(video._id, 'down')}>
                  <ArrowDown size={20} />
                </button>
                <button onClick={() => handleDelete(video._id)}>
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Upload Training Video</h2>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              required
            >
              <option value="">Select Event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Title"
              value={uploadData.title}
              onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              required
            />
            <div className="modal-actions">
              <button onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button onClick={handleUpload} disabled={isLoading}>
                {isLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render volunteer view
  const renderVolunteerView = () => (
    <div className="training-container">
      <div className="training-header">
        <h1>Training Videos</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading training videos...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="empty-state">
          <p>No training videos available. {filterEvent ? 'Try selecting a different event.' : 'Training videos will appear here once you are accepted into an event.'}</p>
        </div>
      ) : (
        <div className="training-grid">
          {filteredVideos.map((video) => (
            <div key={video._id} className="training-card">
              {renderVideoPlayer(video)}
              <div className="video-info">
                <h3>{video.title}</h3>
                <div className="video-meta">
                  <span>Event: {video.eventId.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return user?.role === 'event_manager' ? renderEventManagerView() : renderVolunteerView();
};

export default Training; 