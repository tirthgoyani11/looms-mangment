import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
// import { auth } from '../services/firebase';
// import { signInWithEmailAndPassword } from 'firebase/auth';

/**
 * The redesigned Login component with a modern, glassmorphism UI.
 */
const Login = () => {
  const { setIsAuthenticated } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // --- UNCOMMENT FOR FIREBASE ---
      // await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully!');
      setIsAuthenticated(true);
      window.location.hash = '#dashboard';
    } catch (err) {
      console.error("Login Error:", err.message);
      setError('Failed to log in. Please check your email and password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      {/* The glass-card class will be defined in index.css */}
      <div className="glass-card w-full max-w-md p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
        <p className="text-center text-gray-400 mb-8">Sign in to access your dashboard</p>
        
        <form onSubmit={handleLogin}>
          {/* Email Input with Icon */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {/* Email Icon SVG */}
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
            </div>
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input with Icon */}
          <div className="relative mb-6">
             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {/* Lock Icon SVG */}
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          )}

          {/* Upgraded Submit Button */}
          <button
            type="submit"
            className="btn-gradient w-full text-white font-bold py-3 px-4 rounded-lg"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don't have an account?{' '}
          <a href="#register" className="text-blue-400 hover:underline font-semibold">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
