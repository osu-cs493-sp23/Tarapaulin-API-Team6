const db = require('../lib/sequelize')
const { DataTypes } = require("sequelize")
const { extractValidFields } = require('../lib/validation')
const { ObjectId } = require("mongodb")
const { getDbReference } = require('../lib/mongo')

const submissionSchemaSQL = {
    timestamp: { type: DataTypes.DATE, allowNull: false },
    grade: { type: DataTypes.FLOAT, allowNull: true },
    file: { type: DataTypes.STRING, allowNull: false },
}

const submissionFields = [
    'assignmentId',
    'studentId',
    'timestamp',
    'grade',
    'file',
]

const Submission = db.define('submission', submissionSchemaSQL)
 exports.submissionSchemaSQL = submissionSchemaSQL
 exports.submissionFields = submissionFields
 exports.Submission = Submission



/*
 * Executes a DB query to bulk insert an array of new assignments into the database.
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