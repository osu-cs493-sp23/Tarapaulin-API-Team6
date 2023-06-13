const { ObjectId, GridFSBucket } = require('mongodb')

const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

const CourseSchema = {
    subject: { required: true },
    number: { required: true },
    title: { required: true },
    term: { required: true },
    instructorId: { required: true }
    // students: { required: false },
    // assignments: {required: false }
}
exports.CourseSchema = CourseSchema


async function insertNewCourse(course) {
    course = extractValidFields(course, CourseSchema)
    const db = getDbReference()
    const collection = db.collection('courses')
    const result = await collection.insertOne(course)
    return result.insertedId
}
exports.insertNewCourse = insertNewCourse

async function addAssignmentsToCourseById(id, assignments) {
    const db = getDbReference()
    const collection = db.collection('courses')

    const results = await collection.updateOne(
        { _id: id },
        { $push: { assignments: { $each: assignments } }}
    )
    if(results.matchedCount == 0){
        return undefined
    }
    return results
}
exports.addAssignmentsToCourseById = addAssignmentsToCourseById


async function addStudentsToCourseById(id, students) {
    const db = getDbReference()
    const collection = db.collection('courses')

    const results = await collection.updateOne(
        { _id: id },
        { $push: { students: { $each: students } } }
    )
    if(results.matchedCount == 0){
        return undefined
    }
    return results
}
exports.addStudentsToCourseById = addStudentsToCourseById

async function removeStudentsFromCourseById(id, students) {
    const db = getDbReference()
    const collection = db.collection('courses')

    const results = await collection.updateOne(
        { _id: id },
        { $pull: { students: { $in: students } } }
    )
    if(results.matchedCount == 0){
        return undefined
    }
    return results
}
exports.removeStudentsFromCourseById = removeStudentsFromCourseById

async function bulkInsertNewCourses(courses){
    const { getUsers } = require("./users")
    const users = await getUsers()
    const coursesToInsert = courses.map(function (course) {
        const fields = extractValidFields(course, CourseSchema)
        fields.instructorId = (users[fields.instructorId - 1])._id
        return fields
    })

    const db = getDbReference()
    const collection = db.collection('courses')
    const result = await collection.insertMany(coursesToInsert)
    return result.insertedIds
}
exports.bulkInsertNewCourses = bulkInsertNewCourses

async function getCoursesPage(page) {
    const db = getDbReference()
    const collection = db.collection('courses')
    const count = await collection.countDocuments()

    /*
     * Compute last page number and make sure page is within allowed bounds.
     * Compute offset into collection.
     */
    const pageSize = 10
    const lastPage = Math.ceil(count / pageSize)
    page = page > lastPage ? lastPage : page
    page = page < 1 ? 1 : page
    const offset = (page - 1) * pageSize

    const results = await collection.find( {} )
        .project({ students: 0, 
                   assignments: 0 })
        .sort({ _id: 1 })
        .skip(offset)
        .limit(pageSize)
        .toArray()

    return {
        courses: results,
        page: page,
        totalPages: lastPage,
        pageSize: pageSize,
        count: count
    }
}
exports.getCoursesPage = getCoursesPage

async function getCourses() {
    const db = getDbReference()
    const collection = db.collection('courses')
    const count = await collection.countDocuments()

    const results = await collection.find( {} )
        .toArray()

    return results
}
exports.getCourses = getCourses

async function getCourseById(id) {
    const db = getDbReference()
    const collection = db.collection('courses')

    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const results = await collection.aggregate([
            { $match: { _id: new ObjectId(id) } },
            { $project: { students: 0, assignments: 0 } }
        ]).toArray()

        return results[0]
    }
}
exports.getCourseById = getCourseById

async function editCourseById(id, update) {
    const db = getDbReference()
    const collection = db.collection('courses')

    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const results = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        )
        if(results.matchedCount == 0){
            return undefined
        }

        return results
    }
}
exports.editCourseById = editCourseById


async function removeCourseById(id) {
    const db = getDbReference()
    const collection = db.collection('courses')
    
    if (ObjectId.isValid(id)){
        const result = await collection.deleteOne({
            _id: new ObjectId(id)
        })
        return (result.deletedCount > 0)
    }

    return undefined
    
}
exports.removeCourseById = removeCourseById

async function getStudentsByCourseId(id) {
    const db = getDbReference()
    const coursesCollection = db.collection('courses')
    const usersCollection = db.collection('users')

    if (!ObjectId.isValid(id)) {
        return null
    } else {
        // Get list of student ids for the course
        const studentIds = ((await coursesCollection.aggregate([
            { $match: { _id: new ObjectId(id) } },
            { $project: { students: 1 } }
        ]).toArray())[0])?.students
        // Get student details 1-by-1
        if(!studentIds){
            return {students: []}
        }
        results = []
        for( const student of studentIds ){
            results.push(
                (await usersCollection.aggregate([
                    { $match: {_id: new ObjectId(student) } }
                ])
                .toArray())[0]
            )
        }
        return { students: results }
    }
}
exports.getStudentsByCourseId = getStudentsByCourseId

async function getAssignmentsByCourseId(id) {
    const db = getDbReference()
    const coursesCollection = db.collection('courses')
    const assignmentsCollection = db.collection('assignments')

    if (!ObjectId.isValid(id)) {
        return null
    } else {
        // Get list of assignment ids for the course
        const assignmentIds = ((await coursesCollection.aggregate([
            { $match: { _id: new ObjectId(id) } },
            { $project: { assignments: 1 } }
        ]).toArray())[0])?.assignments
        // Get assignment details 1-by-1
        if(!assignmentIds){
            return {assignments: []}
        }
        results = []
        for( const assignment of assignmentIds ){
            results.push(
                (await assignmentsCollection.aggregate([
                    { $match: {_id: new ObjectId(assignment) } }
                ])
                .toArray())[0]
            )
        }
        return { assignments: results }
    }
}
exports.getAssignmentsByCourseId = getAssignmentsByCourseId

function convertToCSV(data) {
    const students = data.students;
  
    if (!Array.isArray(students)) {
      throw new Error('Students data is not an array');
    }
  
    if (students.length === 0) {
      throw new Error('Students data is empty');
    }
  
    const columns = ['_id', 'name', 'email'];
    const header = columns.join(',');
    const rows = students.map(student => columns.map(column => String(student[column])).join(','));
    return header + '\n' + rows.join('\n');
  }
  exports.convertToCSV = convertToCSV
