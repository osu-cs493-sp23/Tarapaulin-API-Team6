const { ObjectId } = require("mongodb")
const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')
const { submissionSchema } = require('./submissions')

const assignmentSchema = {
    courseId: { required: true},
    title: { required: true },
    points: { required: true },
    due: { required: true },
    submissions: { required: true}
}
exports.assignmentSchema = assignmentSchema 

/* 
 * Returns null if id or assignment document is not found otherwise returns the assignment (without submission data)
 */
async function getAssignmentById(id){
    const db = getDbReference()
    const collection = db.collection('assignments')

    let assignment = null
    if (ObjectId.isValid(userId)){
        // Projection to not include submissions
        assignment = await collection.findOne({ _id: id}).project({submissions: 0})
    }
    return assignment
}
exports.getAssignmentById = getAssignmentById

/* 
 * Inserts a new assignment into the DB. Returns promise that resolves to the ID of the newly-created assignment
 */
async function insertNewAssignment(assignment){
    user = extractValidFields(assignment, assignmentSchema)
    const db = getDbReference()
    const collection = db.collection('assignments')
    const result = collection.insertOne(assignment)
    return result.insertedId
}
exports.insertNewAssignment = insertNewAssignment

/*
 * Executes a DB query to bulk insert an array of new assignments into the database.
 * Returns a Promise that resolves to a map of the IDs of the newly-created
 * assignment entries.
 */
async function bulkInsertNewAssignments(assignments){
    const { getCourses } = require('./courses')
    const courses = await getCourses()
    const assignmentsToInsert = assignments.map(function (assignment) {
        const fields = extractValidFields(assignment, assignmentSchema)
        fields.courseId = (courses[fields.courseId - 1])._id
        return fields
    })

    const db = getDbReference()
    const collection = db.collection('assignments')
    const result = await collection.insertMany(assignmentsToInsert)
    return result.insertedIds
}
exports.bulkInsertNewAssignments = bulkInsertNewAssignments

/*
 * Partial update to be applied to a specified assignment
 * If no rows changed returns undefined otherwise returns the result
 */
async function editAssignmentById(id, assignment){
    const assignmentValues = extractValidFields(assignment, assignmentSchema)
    const db = getDbReference()
    const collection = db.collection('assignments')

    let result = undefined
    if (ObjectId.isValid(id)){
        result = await collection.update({ _id: new ObjectId(id) }, assignmentValues)
    }
    
    return result?.matchedCount > 0 ? result : undefined;
}
exports.editAssignmentById = editAssignmentById

/* 
 * Removes an assignment by id returns ta writeResult on successful delete
 * if it failed to delete the writeResult should contain a 'writeConcernError" field
 * If invalid objectId returns null
 */
async function removeAssignmentById(id){
    const db = getDbReference()
    const collection = db.collection('assignments')
    
    let result = null
    if (ObjectId.isValid(id)){
        result = collection.remove({_id: new ObjectId(id)})
    }

    return result
}
exports.removeAssignmentById = removeAssignmentById

/* 
 * Returns a list of submissions if an assignment Id is valid otherwise returns null
 */
async function getAssignmentSubmissionsById(id){
    const db = getDbReference()
    const collection = db.collection('assignments')

    let subs = null
    if (ObjectId.isValid(id)){
        subs = await collection.aggregate([
            { $match: { _id: new ObjectId(id) } },
            { $project: { submissions: 1 } }
        ]).toArray()
        return subs[0]
    }

    return subs
}
exports.getAssignmentSubmissionsById = getAssignmentSubmissionsById

async function insertSubmissionToAssignmentById(id, submission){
    const submissionValues = extractValidFields(submission, submissionSchema)

    const db = getDbReference()
    const collection = db.collection('assignments')
    
    let result = null
    if (ObjectId.isValid(id)){
        result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $push: submission}
        )
    }

    return result?.matchedCount > 0 ? result : undefined;
}
exports.insertSubmissionToAssignmentById = insertSubmissionToAssignmentById



