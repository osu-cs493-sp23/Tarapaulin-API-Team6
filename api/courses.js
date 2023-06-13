const router = require('express').Router();
const { ObjectId } = require('mongodb')

const { validateAgainstSchema, detectUnknownFieldsAgainstSchema } = require('../lib/validation')
const { isAdminLoggedIn, requireAuthentication } = require('../lib/auth')


const { CourseSchema,
        insertNewCourse,
        getCoursesPage,
        getCourseById, 
        getStudentsByCourseId,
        editCourseById,
        removeCourseById,
        getCourses,
        addStudentsToCourseById,
        removeStudentsFromCourseById} = require('../models/courses')

/* 
 * Route to get all courses (Paginated)
 */
router.get('/', async (req, res, next) => {
    try {
        /*
         * Fetch page info, generate HATEOAS links for surrounding pages and then
         * send response.
         */
        const coursePage = await getCoursesPage(parseInt(req.query.page) || 1)
        coursePage.links = {}
        if (coursePage.page < coursePage.totalPages) {
            coursePage.links.nextPage = `/courses?page=${coursePage.page + 1}`
            coursePage.links.lastPage = `/courses?page=${coursePage.totalPages}`
        }
        if (coursePage.page > 1) {
            coursePage.links.prevPage = `/courses?page=${coursePage.page - 1}`
            coursePage.links.firstPage = '/courses?page=1'
        }
        res.status(200).send(coursePage)
    } catch (err) {
        next(err)
    }
})

router.get('/debug/', async (req, res, next) => {
    try {
        /*
         * Fetch page info, generate HATEOAS links for surrounding pages and then
         * send response.
         */
        const coursePage = await getCourses()
        res.status(200).send(coursePage)
    } catch (err) {
        next(err)
    }
})

/* 
 * Route to create a new course
 */
router.post('/', isAdminLoggedIn, async (req, res, next) => {
    if(req.isUserAdmin){
        if (validateAgainstSchema(req.body, CourseSchema)) {
            try {
                const id = await insertNewCourse(req.body)
                res.status(201).send({
                    id: id
                })
            } catch (err) {
                next(err)
            }
        } else {
            res.status(400).send({
                error: "Request body is not a valid Course object."
            })
        }
    } else {
        res.status(403).send({
            error: "User does not have permission to preform this action."
        })
    }
})

/* 
 * Route to get course by Id
 */
router.get('/:id', async (req, res, next) => {
    try {
        const course = await getCourseById(req.params.id)
        if (course) {
            res.status(200).send(course)
        } else {
            next()
        }
    } catch (err) {
        next(err)
    }
})

/* 
 * Route to update a course by Id
 */
router.patch('/:id', requireAuthentication, async (req, res, next) => {
    if(detectUnknownFieldsAgainstSchema(req.body, CourseSchema)) {
        try {
            const reqCourse = await getCourseById(req.params.id)
            if(!reqCourse){ next(); return }
            const instructorId = reqCourse.instructorId
            if(instructorId == req.user.id || req.user.role == "admin"){
                const course = await editCourseById(req.params.id, req.body)
                if (course) {
                    res.status(200).send(course)
                } else {
                    next()
                }
            } else {
                res.status(403).send({
                    error: "User does not have permission to preform this action."
                })
            }
        } catch (err) {
            next(err)
        }
    } else {
        res.status(400).send({
            error: "Request body does not contain a valid Course object update"
        })
    }
})

/* 
 * Route to delete a course by Id
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
    const reqCourse = await getCourseById(req.params.id)
    if(!reqCourse){ next(); return }
    const instructorId = reqCourse.instructorId

    if(instructorId == req.user.id || req.user.role == "admin"){
        const result = await removeCourseById(req.params.id)
        if(result) {
            res.status(204).send()
        } else {
            next();
        }
    } else {
        res.status(403).send({
            error: "User does not have permission to preform this action."
        })
    }
})

/* 
 * Route to update students in a course
 */
router.post('/:id/students', requireAuthentication, async (req, res, next) => {
    const reqCourse = await getCourseById(req.params.id)
    if(!reqCourse){ next(); return }
    const instructorId = reqCourse.instructorId
    addRemoveSchema = {
        add: {required: true},
        remove: {required: true}
    }
    if(instructorId == req.user.id || req.user.role == "admin"){
        if (validateAgainstSchema(req.body, addRemoveSchema)) {
            try {
                additions = req.body.add
                removals = req.body.remove
                const result1 = await removeStudentsFromCourseById(new ObjectId(req.params.id), removals)
                const result2 = await addStudentsToCourseById(new ObjectId(req.params.id), additions)
                
            
                if (result1 && result2) {
                    res.status(200).send()
                } else {
                    next()
                }
            } catch (err) {
                next(err)
            }
        } else {
            res.status(400).send({
                error: "Request body is not a valid Course object."
            })
        }
    } else {
        res.status(403).send({
            error: "User does not have permission to preform this action."
        })
    }
})

/* 
 * Route to get students in a course
 */
router.get('/:id/students', requireAuthentication, async (req, res, next) => {
    const reqCourse = await getCourseById(req.params.id)
    if(!reqCourse){ next(); return }
    const instructorId = reqCourse.instructorId
    if(instructorId == req.user.id || req.user.role == "admin"){
        try {
            const course = await getStudentsByCourseId(req.params.id)
            if (course) {
                res.status(200).send(course)
            } else {
                next()
            }
        } catch (err) {
            next(err)
        }
    } else {
        res.status(403).send({
            error: "User does not have permission to preform this action."
        })
    }
})

/* 
 * Route to get a csv file containing list of the students enrolled in the course
 */
router.get('/:id/roster', async (req, res, next) => {

})

/* 
 * Route to get assignments in a course
 */
router.get('/:id/assignments', async (req, res, next) => {

})


module.exports = router


