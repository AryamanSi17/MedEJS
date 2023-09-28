const jwt = require('jsonwebtoken');
const {User} = require('./db'); // Adjust the path according to your project structure
const JWT_SECRET = 'med ejs is way to success'; // Replace with your JWT secret or import it from your config file

const checkUploadedDocuments = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    if (!token) return res.status(401).redirect('/login');

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    if (user.uploadedFiles && user.uploadedFiles.length < 4) {
      return res.redirect(`/upload-documents?courseID=${req.params.courseID}`);
    }

    next();
  } catch (error) {
    console.error('Error in checkUploadedDocuments middleware:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = checkUploadedDocuments;

