const axios = require('axios');
const FormData = require('form-data'); // Ensure you have this package installed

// Function to get Moodle user ID from email
const getUserIdFromUsername = async (email) => {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'core_user_get_users_by_field');
  formData.append('wstoken', process.env.MOODLE_TOKEN);
  formData.append('field', 'username');
  formData.append('values[0]', email);

  try {
    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders()
    });

    if (response.status === 200 && response.data.length > 0) {
      console.log('User ID:', response.data[0].id);
      return response.data[0].id;  // Returns the user ID
    } else {
      throw new Error('User not found.');
    }
  } catch (error) {
    console.log(error);
    throw new Error('Failed to retrieve user ID.');
  }
};

// Function to enroll user in a course
const enrollUserInCourse = async (userEmail, courseId) => {
  const moodleUserId = await getUserIdFromUsername(userEmail); // Fetch Moodle user ID based on email

  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'enrol_manual_enrol_users');
  formData.append('wstoken', process.env.MOODLE_TOKEN);
  formData.append('enrolments[0][roleid]', 5);
  formData.append('enrolments[0][userid]', moodleUserId); // Using Moodle user ID
  formData.append('enrolments[0][courseid]', courseId); // Using the course ID

  try {
    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders()
    });

    if (response.status === 200) {
      console.log('User enrolled in the course successfully.');
      console.log(response.data);
    } else {
      console.log('Failed to enroll user in the course.');
      console.log(response.data);
    }
  } catch (error) {
    console.log(error);
    throw new Error('Failed to enroll user in the course.');
  }
};
// Function to search for a course by its name (or any other criteria) and return its details
const searchAndLogCourseDetails = async (courseName) => {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'core_course_search_courses');
  formData.append('wstoken', process.env.MOODLE_TOKEN);
  formData.append('criterianame', 'search'); // This is not a field filter but a search term
  formData.append('criteriavalue', courseName);

  try {
    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders(),
    });

    if (response.data && response.data.courses && response.data.courses.length > 0) {
      // Assuming the first course is the correct one
      console.log('Course found:', response.data.courses[0]);
      // Log the course details
      console.log(`Course ID: ${response.data.courses[0].id}`);
      console.log(`Course Full Name: ${response.data.courses[0].fullname}`);
      console.log(`Course Short Name: ${response.data.courses[0].shortname}`);
    } else {
      console.log('No course found with the specified name.');
    }
  } catch (error) {
    console.error('Error searching for course:', error.message);
  }

};
async function getCourseIdByName(courseName) {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'core_course_search_courses');
  formData.append('wstoken', process.env.MOODLE_TOKEN);
  formData.append('criterianame', 'search');
  formData.append('criteriavalue', courseName);

  try {
    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders()
    });

    if (response.data && response.data.courses && response.data.courses.length > 0) {
      // Assuming the first course in the list is the correct one, since short names are typically unique
      return response.data.courses[0].id; // Return the course ID
    } else {
      throw new Error('Course not found.');
    }
  } catch (error) {
    console.error('Error getting course ID:', error);
    throw error;
  }
}

module.exports = {
  enrollUserInCourse,searchAndLogCourseDetails,getCourseIdByName
};