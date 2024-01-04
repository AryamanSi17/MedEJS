  const { User } = require('./db'); // Ensure the path is correct

  function generateEnrollmentNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
  }

  async function getUniqueEnrollmentNumber() {
    let enrollmentNumber = generateEnrollmentNumber();
    let user = await User.findOne({ enrollmentNumber });
    
    while(user) {
      enrollmentNumber = generateEnrollmentNumber();
      user = await User.findOne({ enrollmentNumber });
    }
    
    return enrollmentNumber;
  }

  module.exports = getUniqueEnrollmentNumber;
