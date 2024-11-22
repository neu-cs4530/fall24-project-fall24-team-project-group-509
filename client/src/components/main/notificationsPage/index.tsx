import React, { useEffect, useState } from 'react';
import { BookmarkCollectionUpdatePayload } from '../../../types';
import useUserContext from '../../../hooks/useUserContext';

/**
 * NotificationPage Component:
 * Displays real-time updates for bookmark collections a user is following.
 */
const NotificationPage = () => {
  const { socket } = useUserContext();
  const [notifications, setNotifications] = useState<BookmarkCollectionUpdatePayload[]>([]);

  useEffect(() => {
    // Listen for collection updates
    const handleCollectionUpdate = (update: BookmarkCollectionUpdatePayload) => {
      console.log('Received collection update:', update);
      setNotifications(prev => [update, ...prev]); // Add new notifications at the top
    };

    socket.on('collectionUpdate', handleCollectionUpdate);

    // Cleanup listener on unmount
    return () => {
      socket.off('collectionUpdate', handleCollectionUpdate);
    };
  }, [socket]);

  return (
    <div className='notification-page'>
      <h1>Notifications</h1>
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul className='notification-list'>
          {notifications.map((notification, index) => (
            <li key={index} className='notification-item'>
              <p>
                A new question was added to the collection:{' '}
                <strong>{notification.updatedCollection.title}</strong>
              </p>
              <p>
                <em>Collection ID:</em> {notification.collectionId}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationPage;
