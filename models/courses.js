const { ObjectId, GridFSBucket } = require('mongodb')

const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

const CourseSchema = {
    subject: { required: true },
    number: { required: true },
    title: { required: true },
    term: { required: true },
    instructorId: { required: true },
    students: { required: false },
    assignments: {required: false }
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
    console.log(results)

    return {
        courses: results,
        page: page,
        totalPages: lastPage,
        pageSize: pageSize,
        count: count
    }
}
exports.getCoursesPage = getCoursesPage

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

        return { courses: results[0] }
    }
}
exports.getCourseById = getCourseById



// Patch can use findAndModify