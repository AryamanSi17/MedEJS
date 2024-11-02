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
    console.error('Error fetching Moodle user ID:', error.message);
    throw new Error('Failed to retrieve user ID.');
  }
};

// Function to enroll user in a course
const enrollUserInCourse = async (userEmail, courseId) => {
  try {
    const moodleUserId = await getUserIdFromUsername(userEmail); // Fetch Moodle user ID based on email

    const formData = new FormData();
    formData.append('moodlewsrestformat', 'json');
    formData.append('wsfunction', 'enrol_manual_enrol_users');
    formData.append('wstoken', process.env.MOODLE_TOKEN);
    formData.append('enrolments[0][roleid]', 5); // Assuming role ID for student
    formData.append('enrolments[0][userid]', moodleUserId); // Using Moodle user ID
    formData.append('enrolments[0][courseid]', courseId); // Using the course ID

    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders()
    });

    if (response.status === 200) {
      console.log('User enrolled in the course successfully.');
      console.log(response.data);
      return response.data; // Return the enrollment response
    } else {
      console.log('Failed to enroll user in the course.');
      console.log(response.data);
      throw new Error('Enrollment failed');
    }
  } catch (error) {
    console.error('Error enrolling user in course:', error.message);
    throw new Error('Failed to enroll user in the course.');
  }
};

// Function to search for a course by its name and return its details
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
      console.log(`Course ID: ${response.data.courses[0].id}`);
      console.log(`Course Full Name: ${response.data.courses[0].fullname}`);
      console.log(`Course Short Name: ${response.data.courses[0].shortname}`);
      return response.data.courses[0];
    } else {
      console.log('No course found with the specified name.');
      return null;
    }
  } catch (error) {
    console.error('Error searching for course:', error.message);
    throw new Error('Failed to search for course.');
  }
};

// Function to create a new course in Moodle
const createCourseInMoodle = async (courseName) => {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'core_course_create_courses');
  formData.append('wstoken', process.env.MOODLE_TOKEN);
  formData.append('courses[0][fullname]', courseName);
  formData.append('courses[0][shortname]', courseName.replace(/\s+/g, '_'));
  formData.append('courses[0][categoryid]', 1); // Set to appropriate Moodle category ID
  formData.append('courses[0][visible]', 1); // Make the course visible

  try {
    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders()
    });

    if (response.data && response.data[0] && response.data[0].id) {
      console.log(`Course created with ID: ${response.data[0].id}`);
      return response.data[0].id;
    } else {
      throw new Error('Failed to create course in Moodle.');
    }
  } catch (error) {
    console.error('Error creating course in Moodle:', error.message);
    throw new Error('Failed to create course in Moodle.');
  }
};

// Function to get or create course ID by name
async function getOrCreateCourseIdByName(courseName) {
  try {
    const course = await searchAndLogCourseDetails(courseName); // Search for the course
    if (course) {
      return course.id; // Return the existing course ID
    } else {
      // Course not found, so create it
      return await createCourseInMoodle(courseName);
    }
  } catch (error) {
    console.error('Error getting or creating course ID:', error.message);
    throw error;
  }
}

module.exports = {
  enrollUserInCourse,
  searchAndLogCourseDetails,
  getOrCreateCourseIdByName
};
