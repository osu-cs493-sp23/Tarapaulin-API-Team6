const db = require('../lib/sequelize')
const { DataTypes } = require("sequelize")

const { User } = require('./users')

const courseSchemaSQL = {
    subject: { type: DataTypes.STRING, allowNull: false },
    number: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    term: { type: DataTypes.STRING, allowNull: false },
    instructorId: { type: DataTypes.INTEGER, allowNull: false }, //<-- foreign key
    // Students for enrollment??
}

const courseFields = [
    'subject',
    'number',
    'title',
    'term',
    'instructorId',
]

const Course = db.define('course', courseSchemaSQL)

module.exports = { courseSchemaSQL, courseFields, Course }