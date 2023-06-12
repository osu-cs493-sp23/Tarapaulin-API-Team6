const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation')


const { CourseSchema,
        insertNewCourse,
        getCoursesPage,
        getCourseById } = require('../models/courses')

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

/* 
 * Route to create a new course
 */
router.post('/', async (req, res, next) => {
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
router.patch('/:id', async (req, res, next) => {

})

/* 
 * Route to delete a course by Id
 */
router.delete('/:id', async (req, res, next) => {

})

/* 
 * Route to get students in a course
 */
router.get('/:id/students', async (req, res, next) => {

})

/* 
 * Route to update students in a course
 */
router.post('/:id/students', async (req, res, next) => {

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


