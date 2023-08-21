const jwt = require('jsonwebtoken');

// Middleware to log the token from request cookies
const logToken = (req, res, next) => {
  const authToken = req.cookies.authToken;

  if (authToken) {
    console.log('Token received:', authToken);
  } else {
    console.log('No token received');
  }

  next();
};

// Middleware to verify JWT token from cookies and extract user information
const authenticateToken = (req, res, next) => {
  const authToken = req.cookies.authToken;

  if (!authToken) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(authToken, 'your_secret_key_here', (err, decodedToken) => {
    if (err) {
      console.log('Invalid token:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = decodedToken; // Store the entire decoded token in req.user
    console.log('Token verification successful');
    next();
  });
};

module.exports = { logToken, authenticateToken };
