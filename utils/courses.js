const db=require('./db')
const courses = [
  {
    courseID: '64b977cffa47d3d1072b49b7',
    name: 'Advanced Professional Certificate in Diabetes Management Course',
    realPrice: 7200000, // blank
    discountedPrice: 6500000, // in paise
    currency: 'inr'
  },
  {
    courseID: '64b977cffa47d3d1072b49b9',
    name: 'Professional Certificate in Diabetes Management Course',
    realPrice: 3500000, // blank
    discountedPrice: 3000000, // in paise
    currency: 'inr'
  },
  {
    courseID: '64b977cffa47d3d1072b49b8',
    name: 'Fellowship in Diabetes Management Course',
    realPrice: 13500000, // blank
    discountedPrice: 11000000, // in paise
    currency: 'inr'
  },
  {
    courseID: '64b977cffa47d3d1072b49c1',
    name: 'Professional Certificate in Critical Care',
    realPrice: 4000000,
    discountedPrice: 3500000,
    currency: 'inr'
  },
  {
    courseID: '64b977cffa47d3d1072b49c2',
    name: 'Advanced Professional Certificate in Critical Care',
    realPrice: 8000000,
    discountedPrice: 7500000,
    currency: 'inr'
  },
  {
    courseID: '64b977cffa47d3d1072b49c3',
    name: 'Fellowship in Critical Care',
    realPrice: 14500000,
    discountedPrice: 12000000,
    currency: 'inr'
  },

  // Internal Medicine Courses
  {
    courseID: '64b977cffa47d3d1072b49c4',
    name: 'Professional Certificate in Internal Medicine',
    realPrice: 4000000,
    discountedPrice: 3500000,
    currency: 'inr'
  },
  {
    courseID: '64b977cffa47d3d1072b49c5',
    name: 'Advanced Professional Certificate in Internal Medicine',
    realPrice: 8000000,
    discountedPrice: 7500000,
    currency: 'inr'
  },
  {
    courseID: '64b977cffa47d3d1072b49c6',
    name: 'Fellowship in Internal Medicine',
    realPrice: 14500000,
    discountedPrice: 12500000,
    currency: 'inr'
  }
  // Add other courses with their respective hexadecimal courseID here
];

async function insertCourses() {
  try {
    await db.mongoose.connect(process.env.MONGODB_URI);

    for (const course of courses) {
      const newCourse = new db.Course({
        courseID: course.courseID,
        name: course.name,
        realPrice: course.realPrice,
        discountedPrice: course.discountedPrice,
        currency: course.currency
      });

      await newCourse.save();
    }

    console.log('Courses inserted successfully');
  } catch (error) {
    console.error('Error inserting courses:', error);
  } finally {
    await db.mongoose.disconnect();
  }
}

// insertCourses();
module.exports = courses;
