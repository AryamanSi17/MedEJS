// isAuthenticatedMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = "med ejs is way to success"; // Consider storing it in environment variables

function isAuthenticated(req, res, next) {
  const token = req.cookies && req.cookies['authToken'];
  
  if (!token) {
    return res.redirect('/loginn'); // Redirect to login if no token is provided
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // Store the user ID from the token in the request object
    next(); // Call the next middleware or route handler
  } catch (error) {
    console.error('Invalid token:', error);
    res.redirect('/loginn'); // Redirect to login if the token is invalid
  }
}

module.exports = isAuthenticated;
