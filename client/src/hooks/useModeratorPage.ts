import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import { getPendingFlags } from '../services/moderatorService';
import { Flag } from '../types';

const useModeratorPage = () => {
  const { user, socket } = useUserContext();
  const [pendingFlags, setPendingFlags] = useState<Flag[]>([]);

  useEffect(() => {
    // Fetch initial pending flags
    const fetchFlags = async () => {
      try {
        const flags = await getPendingFlags(user.username);
        setPendingFlags(flags);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching pending flags:', error);
      }
    };

    fetchFlags();

    socket.on('flagUpdate', (newFlag: Flag) => {
      setPendingFlags(prevFlags => [...prevFlags, newFlag]);
    });

    return () => {
      socket.off('flagUpdate');
    };
  }, [user.username, socket]);

  return { user, pendingFlags };
};

export default useModeratorPage;
