import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { API_ENDPOINTS } from '../config/api';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = (email: string, password: string) => {
    setLoading(true);
    setError('');
    
    // Mock authentication - accept any credentials
    setTimeout(() => {
      const mockUser = {
        id: '1',
        username: email.split('@')[0],
        email: email,
        mobile: '+1234567890',
        profilePicture: '',
        bio: 'Mock user for testing',
        issuesReported: 5,
        reputationPoints: 150,
        badges: ['Reporter', 'Helper']
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setLoading(false);
      onLogin();
    }, 500);
  };

  const handleSignUp = (userData: {
    name: string;
    username: string;
    email: string;
    mobile: string;
    password: string;
    dateOfBirth: string;
  }) => {
    setLoading(true);
    setError('');
    
    // Mock registration - accept any data
    setTimeout(() => {
      const mockUser = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        mobile: userData.mobile,
        profilePicture: '',
        bio: 'New user',
        issuesReported: 0,
        reputationPoints: 0,
        badges: []
      };
      
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setLoading(false);
      onLogin();
    }, 500);
  };

  return (
    <>
      {isSignUp ? (
        <SignUp
          onSignUp={handleSignUp}
          onSwitchToSignIn={() => {
            setIsSignUp(false);
            setError('');
          }}
          loading={loading}
          error={error}
        />
      ) : (
        <SignIn
          onSignIn={handleSignIn}
          onSwitchToSignUp={() => {
            setIsSignUp(true);
            setError('');
          }}
          loading={loading}
          error={error}
        />
      )}
    </>
  );
};

export default Auth;