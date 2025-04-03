import React, { useState, useEffect } from 'react';
import API from '../api';
import { io } from 'socket.io-client';
import './VolunteerChat.css';

const socket = io(API.defaults.baseURL, {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
};

const formatMessageDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

const VolunteerChat = () => {
  const [senders, setSenders] = useState([]);
  const [selectedSender, setSelectedSender] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadMessages, setUnreadMessages] = useState({});

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      socket.emit('joinUserRoom', userId);
    }

    socket.on('receiveMessage', (message) => {
      if (selectedSender && message.sender._id === selectedSender._id) {
        setMessages(prev => [...prev, message]);
      } else {
        setUnreadMessages(prev => ({
          ...prev,
          [message.sender._id]: (prev[message.sender._id] || 0) + 1
        }));
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedSender]);

  useEffect(() => {
    const fetchSenders = async () => {
      try {
        setError('');
        const response = await API.get('/chat/senders');
        setSenders(response.data);
      } catch (err) {
        setError('Failed to load conversations');
      }
    };
    fetchSenders();
  }, []);

  useEffect(() => {
    if (selectedSender) {
      const fetchMessages = async () => {
        try {
          setLoading(true);
          const response = await API.get(`/chat/messages/${selectedSender._id}`);
          console.log('Messages with media:', response.data.filter(msg => msg.media));
          setMessages(response.data);
          setUnreadMessages(prev => ({
            ...prev,
            [selectedSender._id]: 0
          }));
        } catch (err) {
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
        message: newMessage.trim()
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const renderMediaContent = (message) => {
    if (!message.media) return null;

    const mediaUrl = `${API.defaults.baseURL}${message.media.url}`;
    console.log('Media URL:', mediaUrl);

    if (message.media.type === 'photo') {
      return (
        <div className="message-media">
          <img 
            src={mediaUrl}
            alt={mediaUrl}
            className="message-image"
            onError={(e) => {
              const parent = e.target.parentNode;
              const link = document.createElement('a');
              link.href = mediaUrl;
              link.target = '_blank';
              link.textContent = 'View Image';
              link.className = 'media-link';
              parent.replaceChild(link, e.target);
            }}
          />
        </div>
      );
    } else if (message.media.type === 'video') {
      return (
        <div className="message-media">
          <video 
            controls
            className="message-video"
            onError={(e) => {
              const parent = e.target.parentNode;
              const link = document.createElement('a');
              link.href = mediaUrl;
              link.target = '_blank';
              link.textContent = 'View Video';
              link.className = 'media-link';
              parent.replaceChild(link, e.target);
            }}
          >
            <source src={mediaUrl} type="video/mp4" />
            <a href={mediaUrl} target="_blank" rel="noopener noreferrer">Download Video</a>
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
          <h1 className="chat-title">Chat with Event Managers</h1>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="chat-body">
          {/* Sender List */}
          <div className="sender-list">
            <h2 className="sender-list-title">Conversations</h2>
            <div className="sender-list-items">
              {senders.map(sender => (
                <div
                  key={sender._id}
                  className={`sender-item ${selectedSender?._id === sender._id ? 'selected' : ''}`}
                  onClick={() => setSelectedSender(sender)}
                >
                  <div className="sender-info">
                    <div className="sender-name">{sender.name}</div>
                    {unreadMessages[sender._id] > 0 && (
                      <div className="unread-count">{unreadMessages[sender._id]}</div>
                    )}
                  </div>
                  <div className="sender-last-message">{sender.lastMessage}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {selectedSender ? (
              <>
                <div className="chat-header">
                  <div className="chat-header-info">
                    <div className="chat-header-avatar">{selectedSender.name.charAt(0)}</div>
                    <div className="chat-header-name">{selectedSender.name}</div>
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

                <div className="chat-input">
                  <textarea
                    className="chat-textarea"
                    rows="3"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <button
                    className="chat-send-button"
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

export default VolunteerChat;
