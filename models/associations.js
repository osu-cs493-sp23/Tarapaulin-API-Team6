const db = require('../lib/sequelize')
const { DataTypes } = require("sequelize")

const { User } = require('./users')
const { Course } = require('./courses')
const { Assignment } = require('./assignments')
const { Submission } = require('./submissions')

/* 
    Course and User Association
*/
// Course belongs to a user that is an instructor (don't delete/update user if deleted or updated?)
// Enforce that only instructors can be associated with courses:
Course.belongsTo(User, {
    as: 'instructor',
    foreignKey: {
      name: 'instructorId',
      allowNull: false,
      validate: {
        isIn: [['instructor']] // Only users with the 'instructor' role can be associated
      }
    }
  });

// Course has many students (and admins?)
Course.belongsToMany(User, { through: 'CourseStudent', as: 'students' })
// User has many courses
User.belongsToMany(Course, { through: 'CourseStudent', as: 'courses' })

/* 
    Course and Assignment Association
*/

/* 
    Assignment and Submission Association
*/

/* 
    Submission and User Association
*/

