import { useEffect, useState } from 'react';
import useUserContext from '../../../hooks/useUserContext';
import { BookmarkCollectionUpdatePayload } from '../../../types';

const NotificationsPage = () => {
  const { socket } = useUserContext();
  const [notifications, setNotifications] = useState<BookmarkCollectionUpdatePayload[]>([]);

  useEffect(() => {
    const handleCollectionUpdate = (update: BookmarkCollectionUpdatePayload) => {
      setNotifications(prev => [...prev, update]);
    };

    socket.on('collectionUpdate', handleCollectionUpdate);

    return () => {
      socket.off('collectionUpdate', handleCollectionUpdate);
    };
  }, [socket]);

  return (
    <div className='notifications-page'>
      <h1>Notifications</h1>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul>
          {notifications.map((notif, idx) => (
            <li key={idx}>
              <strong>{notif.updatedCollection.title}</strong>: A new post was added.
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
