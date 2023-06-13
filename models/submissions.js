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
    const submissionsToInsert = submissions.map(function (submissions) {
        return extractValidFields(submissions, submissionSchemaSQL)
    })

    const db = getDbReference()
    const collection = db.collection('submissions')
    const result = await collection.insertMany(submissionsToInsert)
    return result.insertedIds
}
exports.bulkInsertNewSubmissions = bulkInsertNewSubmissions