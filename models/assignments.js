const { ObjectId } = require("mongodb")
const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')
const { submissionSchema } = require('./submissions')

const assignmentSchema = {
    courseId: { required: true},
    title: { required: true },
    points: { required: true },
    due: { required: true },
    // submissions: { required: true}
}
exports.assignmentSchema = assignmentSchema 

/* 
 * Returns null if id or assignment document is not found otherwise returns the assignment (without submission data)
 */
async function getAssignmentById(id){
    const db = getDbReference()
    const collection = db.collection('assignments')

    let assignment = null
    if (ObjectId.isValid(id)){
        // Projection to not include submissions
        assignment = await collection.findOne({ _id: new ObjectId(id) }, {submissions: 0})
    }
    return assignment
}
exports.getAssignmentById = getAssignmentById


/*
 * Debug function for bulk adding
 */
async function getAssignments(){
    const db = getDbReference()
    const collection = db.collection('assignments')

    const assignments = await collection.find({}).toArray()
    return assignments
}
exports.getAssignments = getAssignments

/* 
 * Inserts a new assignment into the DB. Returns promise that resolves to the ID of the newly-created assignment
 */
async function insertNewAssignment(assignment){
    assignment = extractValidFields(assignment, assignmentSchema)
    const db = getDbReference()
    const collection = db.collection('assignments')
    const result = await collection.insertOne(assignment)
    console.log(result)
    return result.insertedId
}
exports.insertNewAssignment = insertNewAssignment

/*
 * Executes a DB query to bulk insert an array of new assignments into the database.
 * Returns a Promise that resolves to a map of the IDs of the newly-created
 * assignment entries.
 */
async function bulkInsertNewAssignments(assignments){
    const { getCourses, addAssignmentsToCourseById } = require('./courses')
    const courses = await getCourses()
    const assignmentsToInsert = assignments.map(function (assignment) {
        const fields = extractValidFields(assignment, assignmentSchema)
        const courseId = (courses[fields.courseId - 1])._id
        fields.courseId = courseId
        return fields
    })

    const db = getDbReference()
    const collection = db.collection('assignments')
    const result = await collection.insertMany(assignmentsToInsert)
    ids = Object.values(result.insertedIds)
    for(var i = 0, assignment, assignmentId; 
        assignment = assignmentsToInsert[i], assignmentId = ids[i];
        i++ ){
        
        addAssignmentsToCourseById(assignment.courseId, [assignmentId])
    }

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
        result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: assignmentValues})
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
        result = await collection.deleteOne({_id: new ObjectId(id)})
    }

    return result
}
exports.removeAssignmentById = removeAssignmentById

/* 
 * Returns a list of submissions if an assignment Id is valid otherwise returns null
 * Provide the assignment id and an optional studentId to get submissions only from that student
 */
async function getAssignmentSubmissionsById(id, pageNum, studentId = null){
    const db = getDbReference()
    const asgnCollection = db.collection('assignments')
    const subsCollection = db.collection('submissions')
    // TODO: FINISH WHEN SUBMISSIONS DONE
    
    let subs = null
    if (ObjectId.isValid(id)){
        const pageSize = 1
        subs = await asgnCollection.aggregate([
            { $match: { _id: new ObjectId(id) } },
            { $facet: {
                metadata: [ { $count: "total" }, { $addFields: { page: parseInt(pageNum) } } ],
                data: [ { $skip: 20 }, { $limit: pageSize } ]
            }},
            { $project: { submissions: 1 } }
        ]).toArray()
    }

    return subs
}
exports.getAssignmentSubmissionsById = getAssignmentSubmissionsById

/* 
 * Appends a new submission to an existing assignment
 * if it fails to find a matching assignment or the submission object is incorrect it will return undefined
 * Otherwise it will return the result of the update
 */
// FIXME: have to change in case assignment doesnt start with any submissions
async function insertSubmissionToAssignmentById(id, submission){
    const submissionValues = extractValidFields(submission, submissionSchema)

    const db = getDbReference()
    const collection = db.collection('assignments')
    
    let result = null
    if (ObjectId.isValid(id) && submissionValues && Object.keys(submissionValues).length > 0){
        result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $push: submissionValues}
        )
    }

    return result?.matchedCount > 0 ? result : undefined;
}
exports.insertSubmissionToAssignmentById = insertSubmissionToAssignmentById


