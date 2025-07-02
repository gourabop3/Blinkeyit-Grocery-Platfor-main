const jwt = require("jsonwebtoken");

const auth = async (request, response, next) => {
  try {
    // Extract token from different sources
    const token =
      request.cookies.accessToken ||
      request?.headers?.authorization?.split(" ")[1] ||
      request?.headers?.Authorization?.split(" ")[1];

    console.log('Auth middleware - Token check:', {
      hasCookieToken: !!request.cookies.accessToken,
      hasAuthHeader: !!request?.headers?.authorization,
      hasAuthHeaderCap: !!request?.headers?.Authorization,
      origin: request.headers.origin,
      userAgent: request.headers['user-agent']
    });

    if (!token) {
      console.log('Auth middleware - No token provided');
      return response.status(401).json({
        message: "Access token is required. Please login to continue.",
        error: true,
        success: false,
        code: 'NO_TOKEN'
      });
    }

    // Check if SECRET_KEY_ACCESS_TOKEN exists
    if (!process.env.SECRET_KEY_ACCESS_TOKEN) {
      console.error('Auth middleware - SECRET_KEY_ACCESS_TOKEN not configured');
      return response.status(500).json({
        message: "Server configuration error",
        error: true,
        success: false,
      });
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

    if (!decode || !decode.id) {
      console.log('Auth middleware - Invalid token payload:', decode);
      return response.status(401).json({
        message: "Invalid access token. Please login again.",
        error: true,
        success: false,
        code: 'INVALID_TOKEN'
      });
    }

    request.userId = decode.id;
    console.log('Auth middleware - Success for user:', decode.id);

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return response.status(401).json({
        message: "Access token has expired. Please login again.",
        error: true,
        success: false,
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return response.status(401).json({
        message: "Invalid access token format. Please login again.",
        error: true,
        success: false,
        code: 'MALFORMED_TOKEN'
      });
    }

    return response.status(401).json({
      message: "Authentication failed. Please login again.",
      error: true,
      success: false,
      code: 'AUTH_FAILED'
    });
  }
};

module.exports = auth;
