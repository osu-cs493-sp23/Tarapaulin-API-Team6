const { ObjectId } = require("mongodb")
const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')

const userSchema = {
    name: { required: true },
    email: { required: true },
    password: { required: true },
    role: {  required: true }
}

const userFields = [
    'name',
    'email',
    'password',
    'role',
    'courses'
]

module.exports = { userSchema, userFields }

/* 
 * Returns null if userId or user document is not found otherwise returns the user
 */
async function getUserById(userId){
    const db = getDbReference()
    const collection = db.collection('users')

    if (!ObjectId.isValid(userId)){
        return null
    }else{
        const users = await collection.findOne({ _id: new ObjectId(userId)})
        if (users){
            return users
        }else{
            return null
        }
    }
}
exports.getUserById = getUserById

/* 
 * Inserts a new uwsert into the DB. Returns promise that resolves to the ID of the newly-created user
 */
async function insertNewUser(user){
    user = extractValidFields(user, userSchema)
    const db = getDbReference()
    const collection = db.collection('users')
    const result = collection.insertOne(user)
    return result.insertedId
}
exports.insertNewUser = insertNewUser

/*
 * Executes a DB query to bulk insert an array new users into the database.
 * Returns a Promise that resolves to a map of the IDs of the newly-created
 * user entries.
 */
async function bulkInsertNewUser(users){
    const usersToInsert = users.map(function (user) {
        return extractValidFields(user, userSchema)
    })

    const db = getDbReference()
    const collection = db.collection('users')
    const result = await collection.insertMany(usersToInsert)
    return result.insertedIds
}
exports.bulkInsertNewUser = bulkInsertNewUser

