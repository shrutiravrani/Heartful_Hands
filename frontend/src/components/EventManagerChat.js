import React, { useState, useEffect } from 'react';
import API from '../api';
import { io } from 'socket.io-client';
import './EventManagerChat.css';

const socket = io(API.defaults.baseURL, {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

const EventManagerChat = () => {
  const [senders, setSenders] = useState([]);
  const [selectedSender, setSelectedSender] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Connect to socket when component mounts
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      socket.emit('joinUserRoom', userId);
    }

    // Listen for new messages
    socket.on('receiveMessage', (message) => {
      if (selectedSender && message.sender._id === selectedSender._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedSender]);

  // Fetch list of senders (volunteers who have sent messages)
  useEffect(() => {
    const fetchSenders = async () => {
      try {
        setError('');
        const response = await API.get('/chat/senders');
        setSenders(response.data);
      } catch (err) {
        console.error('Error fetching senders:', err);
        setError('Failed to load conversations');
      }
    };
    fetchSenders();
  }, []);

  // Fetch messages when a sender is selected
  useEffect(() => {
    if (selectedSender) {
      const fetchMessages = async () => {
        try {
          setLoading(true);
          setError('');
          const response = await API.get(`/chat/messages/${selectedSender._id}`);
          setMessages(response.data);
        } catch (err) {
          console.error('Error fetching messages:', err);
          setError('Failed to load messages');
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    }
  }, [selectedSender]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSender) return;

    try {
      setLoading(true);
      const response = await API.post('/chat/reply', {
        recipientId: selectedSender._id,
        message: newMessage.trim(),
      });

      // Add message to chat immediately
      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format message date
  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderMediaContent = (message) => {
    if (!message.media) return null;

    const mediaUrl = `${API.defaults.baseURL}${message.media.url}`;

    if (message.media.type === 'photo') {
      return (
        <div className="message-media">
          <img 
            src={mediaUrl}
            alt="Shared photo"
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
        {/* Header */}
        <div className="chat-header">
          <h1>Chat with Volunteers</h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="chat-body">
          {/* Senders List */}
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
                  <div className="sender-last-message">
                    {sender.lastMessage}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {selectedSender ? (
              <>
                {/* Chat Header */}
                <div className="chat-header-info">
                  <div className="sender-profile">
                    <span>{selectedSender.name.charAt(0)}</span>
                  </div>
                  <div className="sender-details">
                    <h2>{selectedSender.name}</h2>
                    <p>Online</p>
                  </div>
                </div>

                {/* Messages */}
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
                          {/* Show date if it changes */}
                          {currentDate !== prevDate && (
                            <div className="message-date">
                              {formatMessageDate(message.createdAt)}
                            </div>
                          )}

                          <div
                            className={`message ${message.sender._id === selectedSender._id ? 'received' : 'sent'}`}
                          >
                            <div className="message-content">
                              <div className="message-text">{message.text}</div>
                              {renderMediaContent(message)}
                              <div className="message-time">
                                {formatMessageTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Message Input */}
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
