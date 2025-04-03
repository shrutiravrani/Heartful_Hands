import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Upload, Play, Trash2, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import './Training.css';

const Training = () => {
  const [trainingVideos, setTrainingVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    video: null
  });
  const [filterEvent, setFilterEvent] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchEvents();
    fetchTrainingVideos();
  }, []);

  useEffect(() => {
    // Update filtered videos when filterEvent changes
    if (filterEvent) {
      setFilteredVideos(trainingVideos.filter(video => video.eventId._id === filterEvent));
    } else {
      setFilteredVideos(trainingVideos);
    }
  }, [filterEvent, trainingVideos]);

  const fetchEvents = async () => {
    try {
      const response = await API.get('/events/created');
      setEvents(response.data);
    } catch (err) {
      setError('Failed to load events');
    }
  };

  const fetchTrainingVideos = async () => {
    try {
      setLoading(true);
      const response = await API.get('/training/user');
      setTrainingVideos(response.data);
      setFilteredVideos(response.data);
    } catch (err) {
      setError('Failed to load training videos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({ ...prev, video: file }));
    }
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      setError('');

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

      const formData = new FormData();
      formData.append('eventId', selectedEvent);
      formData.append('title', uploadData.title.trim());
      formData.append('video', uploadData.video);

      await API.post('/training/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadModal(false);
      setUploadData({
        title: '',
        video: null
      });
      fetchTrainingVideos();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload training video');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trainingId) => {
    if (window.confirm('Are you sure you want to delete this training video?')) {
      try {
        await API.delete(`/training/${trainingId}`);
        fetchTrainingVideos();
      } catch (err) {
        setError('Failed to delete training video');
      }
    }
  };

  const handleReorder = async (trainingId, direction) => {
    try {
      const video = trainingVideos.find(v => v._id === trainingId);
      if (!video) return;

      const currentOrder = video.order || 0;
      const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

      // Don't allow reordering if we're at the limits
      if (newOrder < 0 || newOrder >= trainingVideos.length) return;
      
      await API.put(`/training/order/${video.eventId._id}`, {
        trainingId,
        newOrder
      });
      
      // Update the local state with the new order
      const updatedVideos = [...trainingVideos];
      const videoIndex = updatedVideos.findIndex(v => v._id === trainingId);
      const targetIndex = direction === 'up' ? videoIndex - 1 : videoIndex + 1;

      // Swap the orders
      [updatedVideos[videoIndex].order, updatedVideos[targetIndex].order] = 
      [updatedVideos[targetIndex].order, updatedVideos[videoIndex].order];

      // Sort the videos by order
      updatedVideos.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setTrainingVideos(updatedVideos);
      setFilteredVideos(updatedVideos);
    } catch (err) {
      console.error('Reorder error:', err);
      setError('Failed to reorder training video');
    }
  };

  const getVideoUrl = (videoUrl) => {
    if (!videoUrl) {
      console.error('No video URL provided');
      return '';
    }
    
    console.log('Processing video URL:', videoUrl);
    
    // If the URL is already a full URL, return it
    if (videoUrl.startsWith('http')) {
      console.log('Using full URL:', videoUrl);
      return videoUrl;
    }
    
    // Remove any undefined prefix
    const cleanUrl = videoUrl.replace(/^undefined/, '');
    
    // Otherwise, construct the full URL using the API base URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const fullUrl = `${baseUrl}${cleanUrl}`;
    console.log('Constructed full URL:', fullUrl);
    return fullUrl;
  };

  const handleVideoError = (e) => {
    console.error('Video playback error:', e);
    const video = e.target;
    console.log('Video details:', {
      src: video.src,
      error: video.error,
      errorCode: video.error?.code,
      errorMessage: video.error?.message,
      networkState: video.networkState,
      readyState: video.readyState
    });
    setError('Failed to load video. Please try again later.');
  };

  const renderVideoPlayer = (video) => {
    if (!video || !video.videoUrl) {
      console.error('Invalid video object:', video);
      return <div className="video-thumbnail">No video available</div>;
    }

    const videoUrl = getVideoUrl(video.videoUrl);
    console.log('Rendering video player:', {
      videoId: video._id,
      videoUrl,
      title: video.title,
      originalUrl: video.videoUrl
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

  const renderEventManagerView = () => (
    <div className="training-container">
      <div className="training-header">
        <h1>Training Videos</h1>
        <button 
          className="upload-button"
          onClick={() => setUploadModal(true)}
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

      {loading ? (
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

      {uploadModal && (
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
              <button onClick={() => setUploadModal(false)}>Cancel</button>
              <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVolunteerView = () => (
    <div className="training-container">
      <div className="training-header">
        <h1>Training Videos</h1>
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

      {loading ? (
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