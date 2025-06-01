// hooks/userHook.js
// This hook is being replaced by the AuthContext
// Keeping this file for backward compatibility but redirecting to AuthContext

import { useAuth } from '../contexts/AuthContext';

export const UserProvider = ({ children, onLanguageChange }) => {
  // Directly using AuthProvider
  const AuthProvider = require('../contexts/AuthContext').AuthProvider;
  return <AuthProvider onLanguageChange={onLanguageChange}>{children}</AuthProvider>;
};

export const useUser = () => {
  const auth = useAuth();
  
  // Map AuthContext methods to userHook methods for backward compatibility
  return {
    user: auth.currentUser,
    loading: auth.loading,
    login: auth.login,
    signup: auth.signup,
    logout: auth.logout
  };
};