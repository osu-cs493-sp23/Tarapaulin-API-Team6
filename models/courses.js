const db = require('../lib/sequelize')
const { DataTypes } = require("sequelize")

const { User } = require('./users')

const courseSchemaSQL = {
    subject: { type: DataTypes.STRING, allowNull: false },
    number: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    term: { type: DataTypes.STRING(6), allowNull: false },  // (fa/wi/sp/su)(yr)
    // instructorid: { type: DataTypes.INTEGER, allowNull: true }
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