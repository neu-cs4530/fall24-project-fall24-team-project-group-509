import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';
import { BookmarkCollectionUpdatePayload, FollowNotificationLog } from '../../../types';
import getUserNotifications from '../../../services/notificationService';
import './index.css';

const NotificationPage = () => {
  const { socket, user } = useUserContext(); // Accessing the socket and user instance from context
  const [notifications, setNotifications] = useState<FollowNotificationLog[]>([]);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getUserNotifications(user.username);
        if (response) {
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.collectionId));
            const uniqueFetched = response.filter(n => !existingIds.has(n.collectionId));
            return [...prev, ...uniqueFetched]; // Preserve order by appending new notifications
          });
        }
      } catch (err) {
        setError('Failed to fetch notifications. Please try again later.');
      }
    };

    fetchNotifications();
  }, [user.username]);

  // Handle real-time updates via socket
  useEffect(() => {
    const handleCollectionUpdate = (update: BookmarkCollectionUpdatePayload) => {
      setNotifications(prev => [
        {
          qTitle: update.updatedCollection.title, // Always use collection title
          collectionId: update.collectionId,
          bookmarkCollectionTitle: update.updatedCollection.title,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    };

    socket.on('collectionUpdate', handleCollectionUpdate);

    return () => {
      socket.off('collectionUpdate', handleCollectionUpdate);
    };
  }, [socket]);

  const handleNotificationClick = (collectionId: string) => {
    navigate(`/user/bookmarks/${collectionId}`); // Navigate to the collection page
  };

  return (
    <div className='notification-page'>
      {error && <p className='error-message'>{error}</p>}
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul className='notification-list'>
          {notifications.map((notification, index) => (
            <li
              key={index}
              className='notification-item'
              onClick={() => handleNotificationClick(notification.collectionId)}
              style={{ cursor: 'pointer' }}>
              <p>
                A new question was added to the collection:{' '}
                <strong>{notification.bookmarkCollectionTitle}</strong>
              </p>
              <p>
                <em>Question Added:</em>{' '}
                <span className='question-item'>{notification.qTitle}</span>
              </p>
              <p>
                <em>Received at:</em> {new Date(notification.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPage;
