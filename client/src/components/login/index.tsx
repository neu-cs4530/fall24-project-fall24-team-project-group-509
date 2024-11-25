import React from 'react';
import './index.css';
import useLogin from '../../hooks/useLogin';

/**
 * Login Component contains a form that allows the user to input their username, which is then submitted
 * to the application's context through the useLoginContext hook.
 */
const Login = () => {
  const {
    username,
    password,
    handleSubmit,
    handleUsernameChange,
    handlePasswordChange,
    banMessage,
  } = useLogin();

  return (
    <div className='container'>
      <h2>Welcome to FakeStackOverflow!</h2>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          value={username}
          onChange={handleUsernameChange}
          placeholder='Enter your username'
          required
          className='input-text'
          id={'usernameInput'}
        />
        <input
          type='password'
          value={password}
          onChange={handlePasswordChange}
          placeholder='Enter your password'
          required
          className='input-text'
          id={'passwordInput'}
        />
        <button type='submit' className='login-button'>
          Submit
        </button>
        {banMessage === 'You are banned from the site.' && (
          <div className='error'>{banMessage}</div>
        )}
      </form>
    </div>
  );
};

export default Login;
