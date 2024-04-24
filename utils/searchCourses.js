const { Course } = require('./db'); // Ensure the path is correct and imports are proper

const searchCourses = async (query) => {
    try {
        const pattern = new RegExp(query, 'i'); // 'i' for case-insensitive
        const courses = await Course.find({
            name: { $regex: pattern }
        });
        return courses;
    } catch (error) {
        console.error("Error searching courses:", error);
        throw error;
    }
};

module.exports=searchCourses;