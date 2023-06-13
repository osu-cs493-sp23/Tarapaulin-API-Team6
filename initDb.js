/*
 * This file contains a simple script to populate the database with initial
 * data from the files in the data/ directory.
 */
// Use env varaible calues
require("dotenv").config()


const { courseFields, bulkInsertNewCourses } = require('./models/courses')
const { bulkInsertNewSubmissions } = require('./models/submissions')
const { userFields, bulkInsertNewUser } = require('./models/users')
const { assignmentFields, bulkInsertNewAssignments } = require('./models/assignments.js')

const courseData = require('./data/courses.json')
const assignmentData = require('./data/assignments.json')
const submissionData = require('./data/submissions.json')
const userData = require('./data/users.json')
const { connectToDb, closeDbConnection } = require("./lib/mongo")

connectToDb( async function () {
    users = await bulkInsertNewUser(userData)
    courses = await bulkInsertNewCourses(courseData)
    assignments = await bulkInsertNewAssignments(assignmentData)
    submissions = await bulkInsertNewSubmissions(submissionData)
    // await Course.bulkCreate(courseData, { fields: courseFields })
    // await Assignment.bulkCreate(assignmentData, { fields: assignmentFields })
    // await Submission.bulkCreate(submissionData, { fields: submissionFields })
    console.log(submissions)

    closeDbConnection(function () {
        console.log("== Init DB connection closed")
    })
})