import React from 'react';
import './index.css';
// import useLogin from '../../hooks/useLogin';
import useSignup from '../../hooks/useSignup';

const Signup = () => {
  const { username, password, handleSubmit, handleUsernameChange, handlePasswordChange } =
    useSignup();

  return (
    <div className='signup-container'>
      <h2>Join FakeStackOverflow Today!</h2>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          value={username}
          onChange={handleUsernameChange}
          placeholder='Choose a username'
          required
          className='input-text signup-input'
          id={'signupUsernameInput'}
        />
        <input
          type='password'
          value={password}
          onChange={handlePasswordChange}
          placeholder='Create a password'
          required
          className='input-text signup-input'
          id={'signupPasswordInput'}
        />
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
  );
};

export default Signup;
