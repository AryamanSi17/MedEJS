const jwt = require('jsonwebtoken');
const User = require('../User'); // Adjust the path according to your project structure
const JWT_SECRET = 'med ejs is way to success'; // Replace with your JWT secret or import it from your config file

const checkUploadedFiles = async (req, res, next) => {
  try {
    // Extract the JWT token from the cookie
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).send('Unauthorized: No token provided');
    }

    // Verify and decode the token to get the user's ID
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Find the user by ID and check if they have uploaded the required files
    const user = await User.findById(userId);
    if (!user || (user.uploadedFiles && user.uploadedFiles.length === 0)) {
      // Redirect to the data route if the user hasn't uploaded any files
      return res.redirect('/data');
    }

    // If the user has uploaded the required files, call the next middleware
    next();
  } catch (error) {
    console.error('Error in checkUploadedFiles middleware:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = checkUploadedFiles;
