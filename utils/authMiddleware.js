// authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = "med ejs is way to success"; // Make sure to keep this secret and possibly store it in environment variables

function checkUserLoggedIn(req, res, next) {
  let isUserLoggedIn = false;

  // Extract token from cookies
  const token = req.cookies && req.cookies['authToken'];
  // console.log("Token:", token); 

  if (token) {
    try {
      // Verify the token
      jwt.verify(token, JWT_SECRET);
      isUserLoggedIn = true;
    } catch (err) {
      // Token is invalid or expired
      isUserLoggedIn = false;
    }
  }

  // Attach the isUserLoggedIn status to the request object
  req.isUserLoggedIn = isUserLoggedIn;
  // console.log(isUserLoggedIn);
  // Continue to the next middleware or route handler
  next();
}

module.exports = checkUserLoggedIn;
