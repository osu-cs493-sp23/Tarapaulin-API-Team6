const router = require("express").Router();

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
} = require('../models/assignments');
const { addAssignmentToCourseById } = require('../models/courses');
const { ObjectId } = require('mongodb');


/*
 * Route to create a new assignment
 */
router.post('/', requireAuthentication, rateLimit, async (req, res, next) => {
    const authorized = req?.user && req?.user?.role && (req?.user?.role == 'instructor' || req?.user?.role == 'admin')

  if (validateAgainstSchema(req.body, assignmentSchema)) {
    if (authorized) {
      try {
        const assignmentId = await insertNewAssignment(req.body);
        console.log("Assignment added id: ", assignmentId);
        if (assignmentId) {
          res.status(201).send({
            id: assignmentId,
          });
        } else {
          res.status(400).send({
            error: "unable to add assignment",
          });
        }
      } catch (err) {
        next(err);
      }
    } else {
      res.status(401).send({
        error: "invalid authorization to create assignment",
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid business object.",
    });
  }
});

/*
 * Route to get data about a specific assignment
 */
router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    try{
        const assignments = await getAssignmentById(id)

    if (assignments) {
      res.send(assignments);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

/*
 * DEBUG: Route to get all assignment data
 */
router.get('/', async (req, res, next) => {
    try{
        const assignments = await getAssignments()

    if (assignments) {
      res.send(assignments);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

/*
 * Route to update data about a specific assignment
 */
router.patch('/:id', requireAuthentication, async (req, res, next) => {
    const id = req.params.id
    const assignment = req.body
    const authorized = req?.user && req?.user?.role && (req?.user?.role == 'instructor' || req?.user?.role == 'admin')

  if (authorized) {
    try {
      const updated = await editAssignmentById(id, assignment);

      if (updated) {
        res.send();
      } else {
        res.status(404).send({ error: "Failed to update assignment" });
      }
    } catch (err) {
      next(err);
    }
  } else {
    res.status(403).send({
      error: "invalid authorization to create assignment",
    });
  }
});

/*
 * Route to delete a specific assignment
 */
router.delete('/:id', requireAuthentication, async (req, res, next) => {
    const id = req.params.id
    const authorized = req?.user && req?.user?.role && (req?.user?.role == 'instructor' || req?.user?.role == 'admin')

  if (authorized) {
    try {
      const result = await removeAssignmentById(id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(404).send({ error: "Delete assignment id not found" });
      }
    } catch (err) {
      next(err);
    }
  } else {
    res
      .status(403)
      .send({ error: "Unauthorized request made to delete assignment" });
  }
});

/*
 * Route to get a list of all submissions for an assignment
 */
router.get('/:id/submissions', requireAuthentication, async (req, res, next) => {
    const id = req.params.id
    const page = parseInt(req.query.page) || 1
    const studentId = req.query.studentId || null
    const authorized = req?.user && req?.user?.role && (req?.user?.role == 'instructor' || req?.user?.role == 'admin')
    // TODO: finnish when submissions gridfs done!!
    if (authorized){
        try{
            const subs = await getAssignmentSubmissionsById(id, page, studentId)
            if (subs){
                res.status(200).send({ submissions: subs})
            }else{
                res.status(404).send({ error: "Specific assignment id not found" })
            }
        }catch(err){
            next(err)
        }
      } catch (err) {
        next(err);
      }
    } else{
        res.status(403).send({ error: "Unauthorized request made to get assignment submissions" })
    }
  }
);

const fileTypes = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      const filename = crypto.randomBytes(16).toString("hex");
      const extension = fileTypes[file.mimetype];
      callback(null, `${filename}.${extension}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    callback(null, !!fileTypes[file.mimetype]);
  },
});

/*
 * Route to create a new submission for an assignment
 */
router.post('/:id/submissions', async (req, res, next) => {

})
