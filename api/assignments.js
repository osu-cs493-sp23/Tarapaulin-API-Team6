const router = require("express").Router();

const { validateAgainstSchema, detectUnknownFieldsAgainstSchema } = require('../lib/validation')
const { requireAuthentication, nonBlockingAuthentication } = require('../lib/auth')
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
const { addAssignmentsToCourseById, 
        getCourseById, 
        removeAssignmentsFromCourseById 
} = require('../models/courses');

const { ObjectId } = require('mongodb');
const { rateLimit } = require('../lib/redis');
const multer = require('multer')
const crypto = require("node:crypto")
const fs = require("node:fs")

/*
 * Route to create a new assignment
 */
router.post('/', requireAuthentication, rateLimit, async (req, res, next) => {
  const authorized = req?.user && req?.user?.role && (req?.user?.role == 'instructor' || req?.user?.role == 'admin')

  if (validateAgainstSchema(req.body, assignmentSchema)) {
    const courseId = req?.body?.courseId
    const instructorId = (await getCourseById(courseId))?.instructorId;
    // TOOD: FIX AUTH
    if (authorized && instructorId == req?.user?.id) {
      try {
        let assignmentId = await insertNewAssignment(req.body);

        if (assignmentId) {
          const added = await addAssignmentsToCourseById(new ObjectId(courseId), [assignmentId])

          if (added){
            console.log("Assignment added id: ", assignmentId);
            res.status(201).send({
              id: assignmentId,
            });
          }else{
            res.status(400).send({
              error: "unable to add assignment to course",
            });
          }
          
        } else {
          res.status(400).send({
            error: "unable to add assignment",
          });
        }
      } catch (err) {
        next(err);
      }
    } else {
      res.status(403).send({
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
  
  let courseId = null
  let instructorId = null
  try{
    courseId = (await getAssignmentById(id))?.courseId
    instructorId = (await getCourseById(courseId))?.instructorId;
  }catch(err){
    next(err)
  }

  const authorized = req?.user && req?.user?.role && req?.user?.role == 'instructor' 
                     && instructorId && instructorId == req?.user?.id;

  const isAdmin = req?.user?.role == 'admin'
  // TODO: fix auth
  if (authorized || isAdmin) {
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
  let courseId = null
  let instructorId = null
  try{
    courseId = (await getAssignmentById(id))?.courseId
    instructorId = (await getCourseById(courseId))?.instructorId;
  }catch(err){
    next(err)
  }

  const authorized = req?.user && req?.user?.role && instructorId 
                     && ((req?.user?.role == 'instructor' && instructorId == req?.user?.id) 
                     || req?.user?.role == 'admin')
  if (authorized) {
    try {
      const assignments = [new ObjectId(id)]
      let result = await removeAssignmentsFromCourseById(new ObjectId(courseId), assignments)
      if (result){
        result = await removeAssignmentById(id);
        if (result) {
          res.status(204).send();
        } else {
          res.status(404).send({ error: "Delete assignment id not found" });
        }
      }else{
        res.status(404).send({ error: "Delete course id not found" });
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
router.get("/:id/submissions", requireAuthentication, rateLimit, async (req, res, next) => {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const studentId = req.query.studentId || null;
    const authorized =
      req?.user &&
      req?.user?.role &&
      (req?.user?.role == "instructor" || req?.user?.role == "admin");
    // TODO: fix auth
    if (authorized) {
      try {
        const submissions = await getAssignmentSubmissionsById(id, page, studentId);
        if (submissions) {
          res.send(submissions);
        } else {
          console.log("no subs");
          next();
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
router.post("/:id/submissions", upload.single("file"), requireAuthentication, rateLimit, async (req, res, next) => {
    const id = req.params.id;
    // TODO: fix auth (only student in that classs can submit)
    if (req.file && req.body && req.body.studentId) {
      const submission = {
        contentType: req.file.mimetype,
        filename: req.file.filename,
        path: req.file.path,
        assignmentId: id,
        studentId: req.body.studentId,
        timestamp: new Date().toISOString(),
        grade: undefined,
      };
      // Save submission info to the database and get the submission ID
      //const id = await saveSubmissionFile(submission);
      const submissionId = await insertSubmissionToAssignmentById(
        id,
        submission
      );
      // Perform further processing or send the submission ID to a queue
      // if necessary
      // ...
      console.log(submissionId);
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted:", req.file.path);
        }
      });

      // Delete file from uploads/
      res.status(200).send({
        id: submissionId,
        url: `/media/submissions/${submissionId}`,
      });
    } else {
      res.status(400).send({
        err: "Invalid file or missing assignment/student information",
      });
    }
  }
);
module.exports = router