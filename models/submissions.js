const db = require('../lib/sequelize')
const { DataTypes } = require("sequelize")

const submissionSchemaSQL = {
    assignmentId: { type: DataTypes.INTEGER, allowNull: false },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    timestamp: { type: DataTypes.DATE, allowNull: false },
    grade: { type: DataTypes.FLOAT, allowNull: true },
    file: { type: DataTypes.STRING, allowNull: false },
}

const submissionFields = [
    'assignmentId',
    'studentId',
    'timestamp',
    'grade',
    'file',
]

const Submission = db.define('submission', submissionSchemaSQL)


module.exports = { submissionSchemaSQL, submissionFields, Submission }