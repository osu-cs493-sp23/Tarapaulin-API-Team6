const { extractValidFields } = require('../lib/validation')
const { ObjectId } = require("mongodb")
const { getDbReference } = require('../lib/mongo')

const submissionSchema = {
    assignmentId: { required: true },
    studentId: { required: true },
    timestamp: { required: true },
    grade: { required: false },
    file: { required: true },
}

 exports.submissionSchema = submissionSchema


/*
 * Executes a DB query to bulk insert an array of new submissions into the database.
 * Returns a Promise that resolves to a map of the IDs of the newly-created
 * assignment entries.
 */
async function bulkInsertNewSubmissions(submissions){
    const { getUsers } = require('./users')
    const { getAssignments } = require('./assignments')
    const { addStudentToCourseById } = require('./courses')
    const users = await getUsers()
    const assignments = await getAssignments()

    const submissionsToInsert = submissions.map(function (submissions) {
        const fields = extractValidFields(submissions, submissionSchema)
        fields.studentId = (users[fields.studentId - 1])._id
        fields.assignmentId = (assignments[fields.assignmentId - 1])._id


        return fields
    })

    const db = getDbReference()
    const collection = db.collection('submissions')
    const result = await collection.insertMany(submissionsToInsert)

    const assignmentCollection = db.collection('assignments')
    for(var i = 0, submission; 
        submission = submissionsToInsert[i];
        i++ ){
        
        studentId = submission.studentId
        assignmentId = submission.assignmentId
        courseId = (await assignmentCollection.findOne( {
            _id: assignmentId
        })).courseId
        const result = await addStudentToCourseById(courseId, studentId)
    }
    return result.insertedIds

}
exports.bulkInsertNewSubmissions = bulkInsertNewSubmissions