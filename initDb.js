/*
 * This file contains a simple script to populate the database with initial
 * data from the files in the data/ directory.
 */
// Use env varaible calues
// require("dotenv").configure()

const sequelize = require('./lib/sequelize')
const { Course, Assignment, Submission, User } = require('./models/associations')
const { assignmentFields } = require('./models/assignments')
const { courseFields } = require('./models/courses')
const { submissionFields } = require('./models/submissions')
const { userFields } = require('./models/users')

const courseData = require('./data/courses.json')
const assignmentData = require('./data/assignments.json')
const submissionData = require('./data/submissions.json')
const userData = require('./data/users.json')

sequelize.sync().then(async function () {
    await User.bulkCreate(userData, { fields: userFields })
    await Course.bulkCreate(courseData, { fields: courseFields })
    await Assignment.bulkCreate(assignmentData, { fields: assignmentFields })
    await Submission.bulkCreate(submissionData, { fields: submissionFields })
})