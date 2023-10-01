// authMiddleware.js
const jwt = require('jsonwebtoken');
const {User} = require('./db'); // Adjust the path as needed
const JWT_SECRET = "med ejs is way to success"; // Consider storing it in environment variables


async function checkUserLoggedIn(req, res, next) {
  req.isUserLoggedIn = false;
  req.user = null; // Initialize user property on the request object
  
  // Extract token from cookies
  const token = req.cookies && req.cookies['authToken'];
  
  if (token) {
    try {
      // Verify and decode the token to get the user's ID
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId; // Get userId from decoded token
      
      try {
        // Fetch the user's details from the database using the userId
        const user = await User.findById(userId);
        
        if (user) {
          req.isUserLoggedIn = true;
          req.user = {
            username: user.username,
            fullname: user.fullname
          };
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    } catch (err) {
      // Token is invalid or expired
      console.error('Error verifying token:', err);
    }
  }
  
  next(); // Continue to the next middleware or route handler
}


module.exports = checkUserLoggedIn;
