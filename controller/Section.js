const Section = require('../models/sectionModel');
const Course = require('../models/courseModel');
const {modelConstants} = require("../utils/constants");
exports.createSection = async (req, res) => {
    try {

        const {sectionName, courseId} = req.body;
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'Please enter all details in section. Please try again'
            })
        }
        const newSection = await Section.create({sectionName})
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id
                }
            },
            {new: true}
        ).populate({
            path: "courseContent", populate: {
                path: modelConstants.subSection
            }
        },).exec();
        return res.status(200).json({
            status: true,
            message: 'Section Created Successfully',
            updatedCourseDetails,
        })
    } catch (err) {
        console.log("Error creating section", err);
        return res.status(500).json({
            status: false,
            message: 'Error creating Section'
        });
    }
}

exports.updateSection = async (req, res) => {
    try {
        const {sectionName, sectionId} = req.body;
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Please enter all details in update section. Please try again'
            })
        }

        const updatedSection = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true})
        return res.status(200).json({
            status: true,
            message: 'Section Updated Successfully',
            updatedSection
        })


    } catch (err) {
        console.log("Error updating section", err);
        return res.status(500).json({
            success: false,
            message: 'Error updating section. Please try again'

        })
    }
}

exports.deleteSection = async (req, res) => {
    try {
        const {sectionId, courseId} = req.params;
        if (!sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'Please enter section id or courseId.'
            })
        }


        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $pull: {
                    courseContent: [{_id: sectionId}],
                },

            },
            {new: true}
        )
        console.log("updated course details ", updatedCourseDetails)
        if (!updatedCourseDetails) {
            return res.status(400).json({
                success: false,
                message: 'Error deleting Section course does not exist'
            })
        }
        if (updatedCourseDetails.courseContent.includes(sectionId)) {
//todo throw error
        }

        const deleteStatus = await Section.findByIdAndDelete(sectionId)
        return res.status(200).json({
            status: true,
            message: 'Section deleted',
            deleteStatus
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting section',
        })
    }
}