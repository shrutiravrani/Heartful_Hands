import React, { useEffect, useState } from 'react';
import API from '../api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications from API...');
        const { data } = await API.get('/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        console.log('Notifications fetched:', data);
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err.response?.data?.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification) => (
          <li key={notification._id}>
            <p>{notification.message}</p>
            <p>{new Date(notification.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
