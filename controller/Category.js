const Category = require('../models/categoryModel');
const {modelConstants} = require("../utils/constants");
exports.createCategory = async (req, res) => {
    try {
        const {name, description} = req.body;
        //validate Data
        if (!name || !description) {
            return res.status(400).json({
                status: false,
                message: 'Please enter all details in Category. Please try again'
            })
        }
        const categoryDetails = await Category.create({name: name, description: description});
        console.log(`Category Details :: ${categoryDetails}`);
        return res.status(200).json({
            success: true,
            message: 'Category Details successfully created!'
        })

    } catch (err) {
        console.log("Error in creating Category :: ", err);
        return res.status(500).send({
            status: false,
            message: `Error in creating Category :: ${err.message}`,
        })
    }
}

exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, {name: true, description: true});
        res.status(200).json({
            success: true,
            message: 'All Categories returned successfully!',
            allCategories: allCategories
        });
    } catch (err) {
        console.log("Error in showing all Categories :: ", err);
        return res.status(500).send({
            status: false,
            message: `Error in showing all Categories :: ${err.message}`,
        })
    }
}

// exports.categoryPageDetails = async (req, res) => {
//     try {
//         const {categoryId} = req.body;
//         const selectedCategory = await Category.findById(categoryId).populate(modelConstants.courses).exec();
//         console.log(`Selected Category :: ${selectedCategory}`);
//
//         if (!selectedCategory) {
//             console.log("Selected Category not found");
//             return res.status(404).send({
//                 success: false,
//                 message: 'Category not found'
//             })
//         }
//
//         if (selectedCategory.courses.length === 0) {
//             console.log("No courses found for selected category");
//             return res.status(404).send({
//                 success: false,
//                 message: 'No courses found for selected category'
//             })
//         }
//
//         const selectedCourses = selectedCategory.courses;
//
//         // Get courses for other categories
//         const categoriesExceptSelected = await Category.find({
//             _id: {$ne: categoryId}
//         }).populate(modelConstants.courses);
//         let differentCourses = [];
//         for (const category of categoriesExceptSelected) {
//             differentCourses.push(...category.courses);
//         }
//
//         // Get top-selling courses across all categories
//         const allCategories = await Category.find().populate(modelConstants.courses);
//         const allCourses = allCategories.flatMap((category) => category.courses);
//         const mostSellingCourses = allCourses
//             .sort((a, b) => b.sold - a.sold)
//             .slice(0, 10);
//
//         return res.status(200).json({
//             success: true,
//             selectedCourses: selectedCourses,
//             differentCourses: differentCourses,
//             mostSellingCourses: mostSellingCourses,
//         })
//
//     } catch (err) {
//         console.log("Error in categoryPageDetails :: ", err);
//         return res.status(500).json({
//             status: false,
//             message: `Error in categoryPageDetails :: ${err.message}`,
//         })
//     }
// }

exports.categoryPageDetails = async (req, res) => {
    try {
        const {categoryId} = req.body;
        const selectedCategory = await Category.findById(categoryId).populate(modelConstants.courses).exec();
        if (!selectedCategory) {
            console.log("category not found in categoryPageDetails :: ");
            return res.status(404).send({
                status: false,
                message: 'Category not found'
            })
        }

        const differentCategories = await Category.find({_id: {$ne: categoryId}}).populate(modelConstants.courses).exec();
//todo get top 10 selling courses
        return res.status(200).json({
            success: true,
            message: 'Category Details found successfully!',
            data: {
                selectedCategory,
                differentCategories,
            }
        })


    } catch (err) {
        return res.status(500).json({
            status: false,
            message: `Error in categoryPageDetails :: ${err.message}`,
        })
    }
}