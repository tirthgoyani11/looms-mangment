import React, { useState, useContext } from 'react';

// Import the AppContext to access global functions, like setIsAuthenticated.
import { AppContext } from '../App';

// In a real app, you would import your Firebase auth functions.
// import { auth } from '../services/firebase'; // Assuming you have this file
// import { createUserWithEmailAndPassword } from 'firebase/auth';

/**
 * The Register component provides a user interface for creating a new account.
 */
const Register = () => {
  // Use the useContext hook to get the setIsAuthenticated function from the global context.
  const { setIsAuthenticated } = useContext(AppContext);

  // State to manage the input fields.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State to manage any error messages during registration.
  const [error, setError] = useState('');

  /**
   * Handles the form submission event for registration.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleRegister = async (e) => {
    // Prevent the default form submission behavior (page reload).
    e.preventDefault();
    setError(''); // Reset any previous errors.

    // --- FORM VALIDATION ---
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return; // Stop the function if passwords don't match.
    }

    // --- FIREBASE REGISTRATION LOGIC ---
    // The commented-out code below shows how you would handle registration with Firebase.
    try {
      // Use the Firebase auth instance to create a new user.
      // await createUserWithEmailAndPassword(auth, email, password);
      
      // If registration is successful:
      console.log('User registered and logged in successfully!');
      setIsAuthenticated(true); // Update the global authentication state.
      window.location.hash = '#dashboard'; // Redirect the new user to the dashboard.

    } catch (err) {
      // If registration fails, display an error message.
      console.error("Registration Error:", err.message);
      // Provide a more user-friendly error message.
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center mt-10 md:mt-16">
      <div className="card w-full max-w-md p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Create Account</h2>
        
        <form onSubmit={handleRegister}>
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {/* Confirm Password Input */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Error Message Display */}
          {error && (
            <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Sign Up
          </button>
        </form>

        {/* Link to Login Page */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <a href="#login" className="text-blue-400 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
