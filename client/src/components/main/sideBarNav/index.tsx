import React from 'react';
import './index.css';
import { NavLink } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';

/**
 * The SideBarNav component has two menu items: "Questions" and "Tags".
 * It highlights the currently selected item based on the active page and
 * triggers corresponding functions when the menu items are clicked.
 */
const SideBarNav = () => {
  const { username } = useUserContext().user;
  const modUsernames = ['mod1', 'mod2', 'mod3', 'mod4'];

  return (
    <div id='sideBarNav' className='sideBarNav'>
      <NavLink
        to='/home'
        id='menu_questions'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Questions
      </NavLink>
      <NavLink
        to='/tags'
        id='menu_tag'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Tags
      </NavLink>
      <NavLink
        to={`/user/${username}`}
        id='menu_user'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Profile
      </NavLink>
      {modUsernames.includes(username) && (
        <NavLink
          to='/flags'
          id='menu_flaggedPosts'
          className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
          Flagged Posts
        </NavLink>
      )}
      <NavLink
        to='/notifications'
        id='menu_notifications'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Inbox
      </NavLink>
      <NavLink
        to='/'
        id='menu_signout'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Sign Out
      </NavLink>
    </div>
  );
};

export default SideBarNav;
