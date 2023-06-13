const router = require('express').Router()
const bcrypt = require('bcryptjs')

const { requireAuthentication, generateAuthToken, isAdminLoggedIn} = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');
const { getDbReference } = require('../lib/mongo')

const { userSchema,
        insertNewUser,
        getUsers } = require('../models/users')



/* 
 * Route to create a new user
 */
router.post('/', isAdminLoggedIn, async (req, res, next) => {
    if(validateAgainstSchema(req.body, userSchema)){
        try {
            // Admin Handling
            if( req.body.role == "admin" ){
                if(!req.isUserAdmin){
                    res.status(403).send({
                    err: "Unauthorized; user not admin"
                    })
                    return
                }
            }
            req.body.password = await bcrypt.hash(req.body.password, 8)
            const user = await insertNewUser(req.body)
            res.status(201).send({ id: user })
        } catch (e) {
            next(e)
        }
    } else {
        res.status(400).send({
            error: "Request body is not a valid User object."
        })
    }
})


/* 
 * Route to log in a user
 */
router.post('/login', async (req, res, next) => {
    loginSchema = { email: {required: true}, password: {required: true} }
    if (validateAgainstSchema(req.body, loginSchema)) {
        try {
            const user = (await getDbReference().collection('users').aggregate([
                { $match: { email: req.body.email }}
            ]).toArray())[0]
            if (bcrypt.compareSync(req.body.password, user.password)) {
                token = generateAuthToken(user)
                res.status(200).send({ token: token })
            } else {
                res.status(401).send({error: "Credentials Invalid"})
            }
        } catch (e) {
            next(e)
        }
    } else {
        res.status(400).send({
            error: "Request body is not a valid User object."
        })
    }
})

/* 
 * Route to get data about a specific user
 */
router.get('/:id', async (req, res, next) => {

})

/*
 * debug route for getting all users and displaying Ids
 */
router.get('/', async (req, res, next) => {
    try {
        const users = await getUsers()
        res.status(200).send(users)
    } catch (err) {
        next(err)
    }

})

module.exports = router