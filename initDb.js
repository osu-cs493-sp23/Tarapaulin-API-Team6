/*
 * This file contains a simple script to populate the database with initial
 * data from the files in the data/ directory.
 */
// Use env varaible calues
require("dotenv").config()

const { bulkInsertNewCourses } = require('./models/courses')
const { bulk } = require('./models/submissions')
const { userFields, bulkInsertNewUser } = require('./models/users')
const { bulkInsertNewAssignments } = require('./models/assignments')

const courseData = require('./data/courses.json')
const assignmentData = require('./data/assignments.json')
const submissionData = require('./data/submissions.json')
const userData = require('./data/users.json')
const { connectToDb } = require("./lib/mongo")

connectToDb( async function () {
    thing = await bulkInsertNewUser(userData)
    newthing = await bulkInsertNewCourses(courseData)
    //console.log("hello")
    //console.log()
    //console.log(bulkInsertNewAssignments)
    //newerthing = await bulkInsertNewAssignments(assignmentData)
    // await Course.bulkCreate(courseData, { fields: courseFields })
    // await Assignment.bulkCreate(assignmentData, { fields: assignmentFields })
    // await Submission.bulkCreate(submissionData, { fields: submissionFields })
    console.log(thing)
    console.log(newthing)
    //console.log(newerthing)
    return
})