// Import the necessary functions from the Firebase SDKs you need.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// As you add more Firebase services (like Storage or Functions), you will import them here.

/**
 * Your web app's Firebase configuration.
 * * IMPORTANT: For security, it's a best practice to store these values in
 * environment variables and not commit them directly into your source code,
 * especially if your repository is public.
 * * For example, in a Create React App project, you would store these in a .env file:
 * REACT_APP_API_KEY="your-api-key"
 * REACT_APP_AUTH_DOMAIN="your-auth-domain"
 * ...and so on.
 * * Then you would access them here like this: process.env.REACT_APP_API_KEY
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your actual API key
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", // Replace with your actual auth domain
  projectId: "YOUR_PROJECT_ID", // Replace with your actual project ID
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Replace with your actual storage bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your actual sender ID
  appId: "YOUR_APP_ID" // Replace with your actual app ID
};

// Initialize the Firebase app with your project's configuration.
// This should only be done once in your entire application.
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service.
// This 'auth' object is what you'll use to sign up, sign in, and manage users.
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service.
// This 'db' object is what you'll use to read from and write to your database.
export const db = getFirestore(app);

// You can export other Firebase services here as you add them.
// For example: export const storage = getStorage(app);
