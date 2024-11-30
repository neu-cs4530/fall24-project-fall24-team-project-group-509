import React from 'react';
import './index.css';
import useLogin from '../../hooks/useLogin';

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
    <div className='login-container'>
      <div className='card'>
        <h2>Welcome Back to MindSync!</h2>
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
          <button type='submit' className='login-button'>
            Log In
          </button>
          {banMessage && <div className='error'>{banMessage}</div>}
          {errorMessage && <div className='error'>{errorMessage}</div>}
        </form>
        <p>
          Don’t have an account?{' '}
          <a href='/signup' className='switch-link'>
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
