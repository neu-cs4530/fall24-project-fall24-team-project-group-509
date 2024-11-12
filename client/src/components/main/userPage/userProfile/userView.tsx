import React from 'react';
import { User } from '../../../../types';

interface UserViewProps {
  user: User;
}

const UserView: React.FC<UserViewProps> = ({ user }) => (
  <div className='user_view'>
    <a href={`/profile/${user.username}`}>{user.username}</a>
  </div>
);

export default UserView;
