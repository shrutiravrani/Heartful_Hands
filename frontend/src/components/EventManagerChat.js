import React, { useState, useEffect } from 'react';
import API from '../api';
import { io } from 'socket.io-client';
import './EventManagerChat.css';

// Socket connection setup
const socket = io(API.defaults.baseURL, {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

// Chat component for event managers
const EventManagerChat = () => {
  // State for managing chat
  const [senders, setSenders] = useState([]);
  const [selectedSender, setSelectedSender] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Socket connection and message handling
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      socket.emit('joinUserRoom', userId);
    }

    // Handle incoming messages
    socket.on('receiveMessage', (message) => {
      if (selectedSender && message.sender._id === selectedSender._id) {
        setMessages(prev => [...prev, message]);
      }
    });

    // Cleanup
    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedSender]);

  // Load list of volunteers who have messaged
  useEffect(() => {
    const getSenders = async () => {
      try {
        setError('');
        const { data } = await API.get('/chat/senders');
        setSenders(data);
      } catch (err) {
        console.error('Could not load conversations:', err);
        setError('Failed to load conversations');
      }
    };
    getSenders();
  }, []);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedSender) {
      const loadMessages = async () => {
        try {
          setLoading(true);
          setError('');
          const { data } = await API.get(`/chat/messages/${selectedSender._id}`);
          setMessages(data);
        } catch (err) {
          console.error('Could not load messages:', err);
          setError('Failed to load messages');
        } finally {
          setLoading(false);
        }
      };
      loadMessages();
    }
  }, [selectedSender]);

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSender) return;

    try {
      setLoading(true);
      const { data } = await API.post('/chat/reply', {
        recipientId: selectedSender._id,
        message: newMessage.trim(),
      });

      // Update messages immediately
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (err) {
      console.error('Message send failed:', err);
      setError('Could not send message');
    } finally {
      setLoading(false);
    }
  };

  // Format time for messages
  const getMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format date for messages
  const getMessageDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Render media content (photos/videos)
  const renderMedia = (message) => {
    if (!message.media) return null;

    const mediaUrl = `${API.defaults.baseURL}${message.media.url}`;

    if (message.media.type === 'photo') {
      return (
        <div className="message-media">
          <img 
            src={mediaUrl}
            alt="Message attachment"
            className="message-image"
            onClick={() => window.open(mediaUrl, '_blank')}
          />
        </div>
      );
    } else if (message.media.type === 'video') {
      return (
        <div className="message-media">
          <video 
            controls
            className="message-video"
          >
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chat-container">
      <div className="chat-wrapper">
        <div className="chat-header">
          <h1>Chat with Volunteers</h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="chat-body">
          {/* Conversations list */}
          <div className="senders-list">
            <div className="senders-header">
              <h2>Conversations</h2>
            </div>
            <div className="senders-list-body">
              {senders.map((sender) => (
                <div
                  key={sender._id}
                  className={`sender-item ${selectedSender?._id === sender._id ? 'selected' : ''}`}
                  onClick={() => setSelectedSender(sender)}
                >
                  <div className="sender-info">
                    <div className="sender-name">{sender.name}</div>
                    {sender.unreadCount > 0 && (
                      <span className="unread-count">
                        {sender.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main chat area */}
          <div className="chat-area">
            {selectedSender ? (
              <>
                <div className="chat-header-info">
                  <div className="sender-profile">
                    <span>{selectedSender.name.charAt(0)}</span>
                  </div>
                  <div className="sender-details">
                    <h2>{selectedSender.name}</h2>
                    <p>Online</p>
                  </div>
                </div>

                <div className="messages">
                  {messages.length > 0 &&
                    messages.map((message, index) => {
                      const prevMessage = messages[index - 1];
                      const currentDate = new Date(message.createdAt).toLocaleDateString();
                      const prevDate = prevMessage
                        ? new Date(prevMessage.createdAt).toLocaleDateString()
                        : '';

                      return (
                        <div key={message._id}>
                          {currentDate !== prevDate && (
                            <div className="message-date">
                              {getMessageDate(message.createdAt)}
                            </div>
                          )}

                          <div
                            className={`message ${message.sender._id === selectedSender._id ? 'received' : 'sent'}`}
                          >
                            <div className="message-content">
                              <div className="message-text">{message.text}</div>
                              {renderMedia(message)}
                              <div className="message-time">
                                {getMessageTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="message-input">
                  <textarea
                    className="input-text"
                    rows="2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <button
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim()}
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            ) : (
              <div className="select-conversation">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManagerChat;
