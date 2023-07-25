// Middleware to check if the user's email is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.email) {
      // Email is authenticated, allow access to the next middleware or route handler
      next();
    } else {
      // Email is not authenticated, redirect to the page where the user needs to enter their email
      res.redirect('/auth_email'); // Replace '/enterEmail' with the appropriate route for the page where the user enters their email and verifies it using OTP
    }
  }
  
  module.exports = isAuthenticated;
  