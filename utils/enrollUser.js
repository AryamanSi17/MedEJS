const axios = require('axios');

const fetchCourseIdByCategory = async (categoryId) => {
  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'core_course_get_courses');
  formData.append('wstoken', "3fecec7d7227a4369b758e917800db5d");
  formData.append('options[categories][0]', categoryId);

  try {
    const response = await axios.post('https://moodle.upskill.globalmedacademy.com/webservice/rest/server.php', formData, {
      headers: formData.getHeaders()
    });

    if (response.status === 200 && response.data && response.data.length > 0) {
      return response.data[0].id; // Return the first course's ID from the category
    } else {
      throw new Error('No course found for the given category ID.');
    }
  } catch (error) {
    console.log(error);
    throw new Error('Failed to fetch course by category ID.');
  }
};

const enrollUserInCourse = async (userId, categoryID) => {
  const courseId = await fetchCourseIdByCategory(categoryID); // Fetch course ID based on category ID

  const formData = new FormData();
  formData.append('moodlewsrestformat', 'json');
  formData.append('wsfunction', 'enrol_manual_enrol_users');
  formData.append('wstoken', "3fecec7d7227a4369b758e917800db5d");
  formData.append('enrolments[0][roleid]', 5);
  formData.append('enrolments[0][userid]', userId);
  formData.append('enrolments[0][courseid]', courseId);

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

// Usage:
// await enrollUserInCourse(moodleUserId, 'D1');
