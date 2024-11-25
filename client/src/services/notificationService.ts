import { FollowNotificationLog } from '../types';
import api from './config';

const NOTIFICATION_API_URL = `${process.env.REACT_APP_SERVER_URL}/user`;

/**
 * Fetches notifications for a specific user.
 * @param username - The username of the user whose notifications are being fetched.
 * @returns - An array of FollowNotificationLog objects representing the notifications.
 */
const getUserNotifications = async (username: string): Promise<FollowNotificationLog[]> => {
  const res = await api.get(`${NOTIFICATION_API_URL}/notifications/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching user notifications');
  }
  return res.data;
};

export default getUserNotifications;
