const router = require('express').Router();

const { validateAgainstSchema, detectUnknownFieldsAgainstSchema } = require('../lib/validation')
const { requireAuthentication } = require('../lib/auth')
const {  
    assignmentSchema,
    getAssignmentById,
    getAssignments,
    insertNewAssignment,
    editAssignmentById,
    removeAssignmentById,
    getAssignmentSubmissionsById,
    insertSubmissionToAssignmentById
} = require('../models/assignments')


/* 
 * Route to create a new assignment
 */
router.post('/', requireAuthentication, async (req, res, next) => {
    console.log("Auth: ", req.user)
    const authorized = req?.user && req?.user?.role && (req?.user?.role == 'instructor' || req?.user?.role == 'admin')

    if (validateAgainstSchema(req.body, assignmentSchema)){
        if (authorized){
            try{
                const assignmentId = await insertNewAssignment(req.body)
                console.log('Assignment added id: ', assignmentId)
                if (assignmentId){
                    res.status(201).send({
                        id: assignmentId
                    })
                }else{
                    res.status(400).send({
                        error: 'unable to add assignment'
                    })
                }
    
            }catch(err){
                next(err)
            }
        }else{
            res.status(401).send({
                error: 'invalid authorization to create assignment'
            })
        }
    }else{
        res.status(400).send({
            error: "Request body is not a valid business object."
        })
    }
})

/* 
 * Route to get data about a specific assignment
 */
router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    try{
        const assignments = await getAssignmentById(id)

        if (assignments){
            res.send(assignments)
        }else{
            next()
        }
    }catch(err){
        next(err)
    }
})

/* 
 * DEBUG: Route to get all assignment data
 */
router.get('/', async (req, res, next) => {
    try{
        const assignments = await getAssignments()

        if (assignments){
            res.send(assignments)
        }else{
            next()
        }
    }catch(err){
        next(err)
    }
})

/* 
 * Route to update data about a specific assignment
 */
router.patch('/:id', async (req, res, next) => {

})

/* 
 * Route to delete a specific assignment
 */
router.delete('/:id', async (req, res, next) => {
})

/* 
 * Route to get a list of all submissions for an assignment
 */
router.get('/:id/submissions', async (req, res, next) => {

})

/* 
 * Route to create a new submission for an assignment
 */
router.post('/:id/submissions', async (req, res, next) => {

})

module.exports = router