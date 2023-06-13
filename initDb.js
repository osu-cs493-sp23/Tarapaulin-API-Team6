/*
 * This file contains a simple script to populate the database with initial
 * data from the files in the data/ directory.
 */
// Use env varaible calues
require("dotenv").config()


const { courseFields, bulkInsertNewCourses } = require('./models/courses')
const { submissionFields } = require('./models/submissions')
const { userFields, bulkInsertNewUser } = require('./models/users')
const { assignmentFields, bulkInsertNewAssignment } = require('./models/assignments.js')

const courseData = require('./data/courses.json')
const assignmentData = require('./data/assignments.json')
const submissionData = require('./data/submissions.json')
const userData = require('./data/users.json')
const { connectToDb } = require("./lib/mongo")

connectToDb( async function () {
    users = await bulkInsertNewUser(userData)
    courses = await bulkInsertNewCourses(courseData)
    assignments = await bulkInsertNewAssignment(assignmentData)
    // await Course.bulkCreate(courseData, { fields: courseFields })
    // await Assignment.bulkCreate(assignmentData, { fields: assignmentFields })
    // await Submission.bulkCreate(submissionData, { fields: submissionFields })
    console.log(users)
    return
})