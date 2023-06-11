const db = require('../lib/sequelize')
const { DataTypes } = require("sequelize")

const assignmentSchemaSQL = {
    // courseId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    due: { type: DataTypes.DATE, allowNull: false },
}

const assignmentFields = [
    'courseId',
    'title',
    'points',
    'due',
]

const Assignment = db.define('assignment', assignmentSchemaSQL)


module.exports = { assignmentSchemaSQL, assignmentFields, Assignment }