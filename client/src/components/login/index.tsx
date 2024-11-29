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
    errorMessage,
  } = useLogin();

  return (
    <div className='container'>
      <h2>Welcome Back to FakeStackOverflow!</h2>
      <h4>Please log in to continue</h4>
    <div className='login-container'>
      <h2>Welcome to MindSync!</h2>
      <h4>Please log in to continue</h4>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          value={username}
          onChange={handleUsernameChange}
          placeholder='Enter your username'
          required
          className='input-text'
          id='loginUsernameInput'
        />
        <input
          type='password'
          value={password}
          onChange={handlePasswordChange}
          placeholder='Enter your password'
          required
          className='input-text'
          id='loginPasswordInput'
        />
        <div>
          <button type='submit' className='login-button'>
            Log In
          </button>
        </div>
        {banMessage === 'You are banned from the site.' && (
          <div className='error'>{banMessage}</div>
        )}
        {errorMessage && <div className='error'>{errorMessage}</div>}
      </form>
      <p>
        Don’t have an account?{' '}
        <a href='/signup' className='switch-link'>
          Sign Up
        </a>
      </p>
    </div>
  );
};

export default Login;
