import React from 'react';
import './index.css';
import useSignup from '../../hooks/useSignup';

const Signup = () => {
  const {
    username,
    password,
    confirmPassword,
    handleSubmit,
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    errorMessage,
  } = useSignup();

  return (
    <div className='signup-container'>
      <div className='card'>
        <h2>Join MindSync Today!</h2>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            value={username}
            onChange={handleUsernameChange}
            placeholder='Choose a username'
            required
            className='input-text signup-input'
            id='signupUsernameInput'
          />
          <input
            type='password'
            value={password}
            onChange={handlePasswordChange}
            placeholder='Create a password'
            required
            className='input-text signup-input'
            id='signupPasswordInput'
          />
          <input
            type='password'
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder='Confirm your password'
            required
            className='input-text signup-input'
            id='signupConfirmPasswordInput'
          />
          {errorMessage && <div className='error'>{errorMessage}</div>}
          <button type='submit' className='signup-button'>
            Sign Up
          </button>
        </form>
        <p>
          Already have an account?{' '}
          <a href='/' className='switch-link'>
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
