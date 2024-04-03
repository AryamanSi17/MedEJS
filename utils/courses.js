const { Course } = require('./db')
let courseData = [
  {
    courseID: '017AE2',
    name: 'Professional Certificate in Diabetes Management',
    currentPrice: 30000,
    discountedPrice: 35000,
    imagePath: 'assets/images/course/course-list-01.jpg',
    courseDetailLink: '/course-details-professional-certificate-in-diabetes-management',
    duration: '3 Months',
    description: 'Support and provide counseling to all diabetic patients & their families',
    logos: [
      { src: "assets/images/MedicollLogos/Diabeteslogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/HEE_logo.jpg", alt: "Health Education England" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/NHSGEP logo.jpg", alt: "Genomics Education Programme" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/NHSLW logo.jpg", alt: "Liverpool Women's NHS Foundation Trust" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/RCGP logo.jpg", alt: "Royal College of General Practitioners" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/UOL logo.jpg", alt: "University of Pool" }
    ],
    category: "Diabetes Management"
  },
  {
    courseID: '698C4B',
    name: 'Advanced Professional Certificate in Diabetes Management',
    currentPrice: 70000,
    discountedPrice: 75000,
    imagePath: 'assets/images/course/course-list-01a.jpg',
    courseDetailLink: '/course-details-advanced-professional-certificate-in-diabetes-management',
    duration: '6 Months',
    description: 'Design comprehensive diabetes care plans, diabetes reversal programs',
    logos: [
      { src: "assets/images/MedicollLogos/Diabeteslogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/HEE_logo.jpg", alt: "Health Education England" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/NHSGEP logo.jpg", alt: "Genomics Education Programme" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/NHSLW logo.jpg", alt: "Liverpool Women's NHS Foundation Trust" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/RCGP logo.jpg", alt: "Royal College of General Practitioners" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/UOL logo.jpg", alt: "University of Pool" }
    ],
    category: "Diabetes Management"
  },
  {
    courseID: '82E26F',
    name: 'Fellowship in Integrated Management of Diabetes',
    currentPrice: 80000,
    discountedPrice: 100000,
    imagePath: 'assets/images/course/course-list-01a.jpg',
    courseDetailLink: '/course-details-fellowship-in-integrated-diabetes-management',
    duration: '9 Months',
    description: 'Learn to address diabetes complications and become expert',
    logos: [
      { src: "assets/images/MedicollLogos/Diabeteslogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/HEE_logo.jpg", alt: "Health Education England" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/NHSGEP logo.jpg", alt: "Genomics Education Programme" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/NHSLW logo.jpg", alt: "Liverpool Women's NHS Foundation Trust" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/RCGP logo.jpg", alt: "Royal College of General Practitioners" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/UOL logo.jpg", alt: "University of Pool" }
    ],
    category: "Diabetes Management"
  },
  {
    courseID: '508CCF',
    name: 'Fellowship in Diabetes Management',
    currentPrice: 135000,
    discountedPrice: 145000,
    imagePath: 'assets/images/course/course-list-01b.jpg',
    courseDetailLink: '/course-details-fellowship-in-diabetes-management',
    duration: '12 Months',
    description: 'Learn to address diabetes complications and become an expert',
    logos: [
      { src: "assets/images/MedicollLogos/Diabeteslogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/HEE_logo.jpg", alt: "Health Education England" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/NHSGEP logo.jpg", alt: "Genomics Education Programme" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/NHSLW logo.jpg", alt: "Liverpool Women's NHS Foundation Trust" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/RCGP logo.jpg", alt: "Royal College of General Practitioners" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/UOL logo.jpg", alt: "University of Pool" }
    ],
    category: "Diabetes Management"
  },
  {
    courseID: "3C7E73",
    name: "Professional Certificate in Critical Care",
    currentPrice: 35000,
    discountedPrice: 40000,
    imagePath: "assets/images/course/course-list-03.jpg",
    courseDetailLink: "/course-details-professional-certificate-in-critical-care",
    description: 'Understand and treat critically ill patients',
    logos: [
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/eIntegrity_logo.jpg", "alt": "eIntegrity" },
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/HEE_logo.jpg", "alt": "Health Education England" },
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/Intensive care logo.jpg", "alt": "Intensive Care Society" },
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/RCOA_logo.jpg", "alt": "Royal College of Anaesthetists" }
    ],
    category: "cat--1"
  },
  {
    courseID: "C61D75",
    name: "Advanced Professional Certificate in Critical Care",
    currentPrice: 75000,
    discountedPrice: 80000,
    imagePath: "assets/images/course/course-list-03a.jpg",
    courseDetailLink: "/course-details-advanced-professional-certificate-in-critical-care",
    description:"Provide essential care to the critically ill patients",
    logos: [
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/eIntegrity_logo.jpg", "alt": "eIntegrity" },
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/HEE_logo.jpg", "alt": "Health Education England" },
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/Intensive care logo.jpg", "alt": "Intensive Care Society" },
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/RCOA_logo.jpg", "alt": "Royal College of Anaesthetists" }
    ],
  category: "cat--2"
  },
  {
    courseID: "DFBC22",
    name: "Fellowship in Critical Care",
    currentPrice: 145000,
    discountedPrice: 155000,
    imagePath: "assets/images/course/course-list-03b.jpg",
    courseDetailLink: "/course-details-fellowship-in-critical-care",
    description:"Provide comprehensive ICU care & management",
    logos: [
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/eIntegrity_logo.jpg", "alt": "eIntegrity" },
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/HEE_logo.jpg", "alt": "Health Education England" },
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/Intensive care logo.jpg", "alt": "Intensive Care Society" },
      { "src": "assets/images/MedicollLogos/CriticalCarelogos/RCOA_logo.jpg", "alt": "Royal College of Anaesthetists" }
    ],
    category: "cat--3"
  },
  {
    courseID: "FAF478",
    name: "Professional Certificate in General Practice (Internal Medicine)",
    currentPrice: 35000,
    discountedPrice: 40000,
    imagePath: "assets/images/course/course-list-04a.jpg",
    courseDetailLink: "/course-details-professional-certificate-in-general-practice",
    description:"Manage patients with clinical competence using latest guidelines",
    logos: [
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/eIntegrity_logo.jpg", "alt": "eIntegrity" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/HEE_logo.jpg", "alt": "Health Education England" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/RCP logo.jpg", "alt": "Royal College of Physicians" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/RCPE logo.jpg", "alt": "Royal College of Physicians of Edinburgh" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/RCPSG logo.png", "alt": "Royal College of Physicians and Surgeons of Glasgow" }
    ],
    category: "cat--1"
  },
  {
    courseID: "8B0ACC",
    name: "Advanced Professional Certificate in General Practice (Internal Medicine)",
    currentPrice: 75000,
    discountedPrice: 80000,
    imagePath: "assets/images/course/course-list-06a.jpg",
    courseDetailLink: "/course-details-advanced-professional-certificate-in-general-practice",
    description:"",
    logos: [
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/eIntegrity_logo.jpg", "alt": "eIntegrity" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/HEE_logo.jpg", "alt": "Health Education England" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/RCP logo.jpg", "alt": "Royal College of Physicians" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/RCPE logo.jpg", "alt": "Royal College of Physicians of Edinburgh" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/RCPSG logo.png", "alt": "Royal College of Physicians and Surgeons of Glasgow" }
    ],
    category: "cat--2"
  },
  {
    courseID: "2B7F22",
    name: "Fellowship in General Practice (Internal Medicine)",
    currentPrice: 145000,
  discountedPrice: 155000,
    imagePath: "assets/images/course/course-list-06a.jpg",
    courseDetailLink: "/course-details-fellowship-in-general-practice",
    description:"",
    logos: [
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/eIntegrity_logo.jpg", "alt": "eIntegrity" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/HEE_logo.jpg", "alt": "Health Education England" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/RCP logo.jpg", "alt": "Royal College of Physicians" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/RCPE logo.jpg", "alt": "Royal College of Physicians of Edinburgh" },
      { "src": "assets/images/MedicollLogos/InternalMedicinelogos/RCPSG logo.png", "alt": "Royal College of Physicians and Surgeons of Glasgow" }
    ],
    category: "cat--3"
  }
  ,{
    courseID: "FM01",
    name: "Professional Certificate in Family Medicine",
    currentPrice: 35000,
    discountedPrice: 40000,
    imagePath: "assets/images/course/familymedicine/pic_4.jpg",
    courseDetailLink: "/course-details-professional-certificate-in-family-medicine",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/Cardologylogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Cardologylogos/elfh_logo.png", alt: "eLearning for Health Care" },
      { src: "assets/images/MedicollLogos/Cardologylogos/HEE_logo.jpg", alt: "Health Education England" }
    ],
    category: "cat--1"
  },
  {
    courseID: "FM02",
    name: "Advanced Professional Certificate in Family Medicine",
    currentPrice: 75000,
    discountedPrice: 80000,
    imagePath: "assets/images/course/familymedicine/pic_3.jpg",
    courseDetailLink: "/course-details-advanced-professional-certificate-in-family-medicine",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/Cardologylogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Cardologylogos/elfh_logo.png", alt: "eLearning for Health Care" },
      { src: "assets/images/MedicollLogos/Cardologylogos/HEE_logo.jpg", alt: "Health Education England" }
    ],
    category: "cat--2"
  },
  {
    courseID: "FM03",
    name: "Fellowship in Family Medicine",
    currentPrice: 145000,
    discountedPrice: 155000,
    imagePath: "assets/images/course/familymedicine/pic_4.jpg",
    courseDetailLink: "/course-details-fellowship-in-family-medicine",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/Cardologylogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Cardologylogos/elfh_logo.png", alt: "eLearning for Health Care" },
      { src: "assets/images/MedicollLogos/Cardologylogos/HEE_logo.jpg", alt: "Health Education England" }
    ],
    category: "cat--3"
  },
  {
    courseID: "GO01",
    name: "Professional Certificate in Gynecology and Obstetrics",
    currentPrice: 35000,
    discountedPrice: 40000,
    imagePath: "assets/images/course/familymedicine/pic_4.jpg",
    courseDetailLink: "/course-details-professional-certificate-in-gynecology-and-obstetrics",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/Cardologylogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Cardologylogos/elfh_logo.png", alt: "eLearning for Health Care" },
      { src: "assets/images/MedicollLogos/Cardologylogos/HEE_logo.jpg", alt: "Health Education England" }
    ],
    category: "cat--1"
  },
  {
    courseID: "GO02",
    name: "Advanced Professional Certificate in Gynecology and Obstetrics",
    currentPrice: 75000,
    discountedPrice: 80000,
    imagePath: "assets/images/course/familymedicine/pic_4.jpg",
    courseDetailLink: "/course-details-advanced-professional-certificate-in-gynecology-and-obstetrics",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/Cardologylogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Cardologylogos/elfh_logo.png", alt: "eLearning for Health Care" },
      { src: "assets/images/MedicollLogos/Cardologylogos/HEE_logo.jpg", alt: "Health Education England" }
    ],
    category: "cat--2"
  },
  {
    courseID: "GO03",
    name: "Fellowship in Gynecology and Obstetrics",
    currentPrice: 145000,
    discountedPrice: 155000,
    imagePath: "assets/images/course/familymedicine/pic_4.jpg",
    courseDetailLink: "/course-details-fellowship-in-gynecology-and-obstetrics",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/Cardologylogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Cardologylogos/elfh_logo.png", alt: "eLearning for Health Care" },
      { src: "assets/images/MedicollLogos/Cardologylogos/HEE_logo.jpg", alt: "Health Education England" }
    ],
    category: "cat--3"
  },
  {
    courseID: "PD01",
    name: "Professional Certificate in Pediatrics",
    currentPrice: 42500,
    discountedPrice: 50000,
    imagePath: "assets/images/course/course-list-08.jpg",
    courseDetailLink: "/course-details",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/HEE_logo.jpg", alt: "Health Education England" },
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/RCGP logo.jpg", alt: "Royal College of General Practitioners" }
    ],
    category: "cat--1"
  },
  {
    courseID: "PD02",
    name: "Advanced Professional Certificate in Pediatrics",
    currentPrice: 63750,
    discountedPrice: 75000,
    imagePath: "assets/images/course/course-list-08a.jpg",
    courseDetailLink: "/course-details",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/HEE_logo.jpg", alt: "Health Education England" },
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/RCGP logo.jpg", alt: "Royal College of General Practitioners" }
    ],
    category: "cat--2"
  },
  {
    courseID: "PD03",
    name: "Fellowship in Pediatrics",
    currentPrice: 114750,
    discountedPrice: 180000,
    imagePath: "assets/images/course/course-list-08b.jpg",
    courseDetailLink: "/course-details",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/HEE_logo.jpg", alt: "Health Education England" },
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/RCGP logo.jpg", alt: "Royal College of General Practitioners" }
    ],
    category: "cat--3"
  },
  {
    courseID: "ECG01",
    name: "Professional Certificate in ECG Interpretation",
    currentPrice: 8500,
    discountedPrice: 10000,
    imagePath: "assets/images/course/course-list-07.jpg",
    courseDetailLink: "/course-details",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/HEE_logo.jpg", alt: "Health Education England" },
      { src: "assets/images/MedicollLogos/FamilyMedicinelogos/RCGP logo.jpg", alt: "Royal College of General Practitioners" }
    ],
    category: "cat--1"
  },
  {
    courseID: "PDM01",
    name: "Professional Certificate in Pediatric Diabetes",
    currentPrice: 8500,
    discountedPrice: 10000,
    imagePath: "assets/images/course/course-list-05.jpg",
    courseDetailLink: "/course-details",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/Diabeteslogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/HEE_logo.jpg", alt: "Health Education England" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/NHSGEP logo.jpg", alt: "Genomics Education Programme" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/NHSLW logo.jpg", alt: "Liverpool Women's NHS Foundation Trust" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/RCGP logo.jpg", alt: "Royal College of General Practitioners" },
      { src: "assets/images/MedicollLogos/Diabeteslogos/UOL logo.jpg", alt: "University of Pool" }
    ],
    category: "cat--1"
  },
  {
    courseID: "CC01",
    name: "Professional Certificate in Clinical Cardiology",
    currentPrice: 42500,
    discountedPrice: 50000,
    imagePath: "assets/images/course/course-list-06.jpg",
    courseDetailLink: "/course-details",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/Cardologylogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Cardologylogos/elfh_logo.png", alt: "eLearning for Health Care" },
      { src: "assets/images/MedicollLogos/Cardologylogos/HEE_logo.jpg", alt: "Health Education England" }
    ],
    category: "cat--1"
  },
  {
    courseID: "ACC01",
    name: "Advanced Professional Certificate in Clinical Cardiology",
    currentPrice: 125000,
    discountedPrice: 106250,
    imagePath: "assets/images/course/course-list-06b.jpg",
    courseDetailLink: "/course-details",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/Cardologylogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Cardologylogos/elfh_logo.png", alt: "eLearning for Health Care" },
      { src: "assets/images/MedicollLogos/Cardologylogos/HEE_logo.jpg", alt: "Health Education England" }
    ],
    category: "cat--2"
  },
  {
    courseID: "FCC01",
    name: "Fellowship in Clinical Cardiology",
    currentPrice: 125000,
    discountedPrice: 106250,
    imagePath: "assets/images/course/course-list-06b.jpg",
    courseDetailLink: "/course-details",
    description:"",
    logos: [
      { src: "assets/images/MedicollLogos/Cardologylogos/eIntegrity_logo.jpg", alt: "eIntegrity" },
      { src: "assets/images/MedicollLogos/Cardologylogos/elfh_logo.png", alt: "eLearning for Health Care" },
      { src: "assets/images/MedicollLogos/Cardologylogos/HEE_logo.jpg", alt: "Health Education England" }
    ],
    category: "cat--3"
  }
  
  
];
function formatIndianNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format prices
courseData.forEach(course => {
  course.currentPrice = formatIndianNumber(course.currentPrice);
  course.discountedPrice = formatIndianNumber(course.discountedPrice);
});
// Assuming you want to insert all courses into the database
// Remove commas from the formatted Indian number
function removeCommas(number) {
  return number.replace(/,/g, '');
}

// Format prices
courseData.forEach(course => {
  course.currentPrice = removeCommas(course.currentPrice);
  course.discountedPrice = removeCommas(course.discountedPrice);
});

// Assuming you have already defined the Course model

// // Now you can use the Course model to insert data into the database
// async function uploadNewCourses(courseData) {
//   try {
//     // Delete all existing courses
//     await Course.deleteMany();
    
//     // Insert new courses
//     await Course.insertMany(courseData);
    
//     console.log(`${courseData.length} courses uploaded successfully.`);
//   } catch (error) {
//     console.error(`Error uploading courses: ${error}`);
//   }
// }
// Function to update courseData array from MongoDB
// async function updateCourseDataFromDB() {
//   try {
//     const coursesFromDB = await Course.find(); // Retrieve all courses from MongoDB
//     // Update courseData array with data from MongoDB
//     courseData = coursesFromDB.map(course => course.toObject());
//   } catch (error) {
//     console.error(`Error updating courseData from MongoDB: ${error}`);
//   }
// }

// // Function to update MongoDB from courseData array
// async function updateDBFromCourseData() {
//   try {
//     // Update MongoDB with data from courseData array
//     await Course.deleteMany(); // Clear existing data
//     await Course.insertMany(courseData); // Insert new data
//   } catch (error) {
//     console.error(`Error updating MongoDB from courseData: ${error}`);
//   }
// }

// // Watch for changes in MongoDB and update courseData array
// Course.watch().on('change', () => {
//   updateCourseDataFromDB();
// });
// // uploadNewCourses(courseData);
// // Example: Watch for changes in courseData array and update MongoDB
// // This is a simplified example, you should implement your own logic for detecting changes
// setInterval(() => {
//   updateDBFromCourseData();
// }, 60000); // Update MongoDB every minute, adjust as needed
module.exports=courseData;
