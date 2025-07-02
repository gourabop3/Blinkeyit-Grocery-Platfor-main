/**
 * Check if user has valid authentication token
 * @returns {boolean} - true if user has valid token, false otherwise
 */
export const checkAuthToken = () => {
  const accessToken = sessionStorage.getItem("accesstoken");
  const refreshToken = sessionStorage.getItem("refreshToken");
  
  return !!(accessToken && refreshToken);
};

/**
 * Get the current access token
 * @returns {string|null} - access token or null if not found
 */
export const getAccessToken = () => {
  return sessionStorage.getItem("accesstoken");
};

/**
 * Check if user is authenticated (has token and user data)
 * @param {object} user - user object from Redux store
 * @returns {boolean} - true if user is authenticated
 */
export const isUserAuthenticated = (user) => {
  const hasToken = checkAuthToken();
  const hasUserData = user && (user._id || user.email);
  
  return hasToken && hasUserData;
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  sessionStorage.removeItem("accesstoken");
  sessionStorage.removeItem("refreshToken");
};

/**
 * Validate token format (basic check)
 * @param {string} token - JWT token
 * @returns {boolean} - true if token has valid format
 */
export const isValidTokenFormat = (token) => {
  if (!token) return false;
  
  // Basic JWT format check (has 3 parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3;
};