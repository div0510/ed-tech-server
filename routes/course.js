const express = require('express');
const router = express.Router();

const {createCourse, showAllCourses, getCourseDetails} = require('../controller/Course');
const {createCategory, showAllCategories, categoryPageDetails} = require('../controller/Category')
const {createSection, updateSection, deleteSection} = require('../controller/Section');
const {createSubSection, updateSubSection, deleteSubSection} = require('../controller/SubSection');
const {createRating, getAllRating, getAverageRating} = require('../controller/ratingAndReview');
const {auth, isAdmin, isInstructor, isStudent} = require('../middleware/auth');


// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

//Course can only be created by instructor
router.post('/createCourse', auth, isInstructor, createCourse);
// Add a Section to a course
router.post('/addSection', auth, isInstructor, createSection);
// Update a section
router.post('/updateSection', auth, isInstructor, updateSection);
//Delete a section
router.post('/deleteSection', auth, isInstructor, deleteSection);
//Edit subsection
router.post('/updateSubSection', auth, isInstructor, updateSubSection);
//Delete subsection
router.post('/deleteSubSection', auth, isInstructor, deleteSubSection);
// Add subsection to section
router.post('/addSubSection', auth, isInstructor, createSubSection);
// Get all registered courses
router.post('/getAllCourses', showAllCourses);
//Get Details for a specific courses
router.post('/getCourseDetails', getCourseDetails);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
router.post('/createCategory', auth, isAdmin, createCategory);
//show all categories
router.get('/showAllCategories', showAllCategories);
//get category page details
router.post('/getCategoryPageDetails', categoryPageDetails);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
// Create Rating
router.post('/createRating', auth, isStudent, createRating);
// Get Average Details
router.post('/getAverageRating', getAverageRating);
// Get all the rating and reviews
router.get('/getReviews', getAllRating)

module.exports = router;
