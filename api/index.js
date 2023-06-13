const { Router } = require('express')
const router = Router()

router.use('/assignments', require('./assignments'))
router.use('/courses', require('./courses'))
router.use('/users', require('./users'))
const {
    getSubmissionDownloadStreamById
  } = require("../models/submissions");
router.get("/media/submissions/:id", function (req, res, next) {
    getSubmissionDownloadStreamById(req.params.id)
        .on("error", function (err) {
            if (err.code === "ENOENT") {
                next();
            } else {
                next(err);
            }
        })
        .on("file", function (file) {
            res.status(200).type(file.metadata.contentType);
        })
        .pipe(res);
});
module.exports = router