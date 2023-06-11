const db = require('../lib/sequelize')
const { DataTypes } = require("sequelize")

const userSchemaSQL = {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM(['admin', 'instructor', 'student']), allowNull: false }
}

const userFields = [
    'name',
    'email',
    'password',
    'role'
]

const User = db.define('user', userSchemaSQL)


module.exports = { userSchemaSQL, userFields, User }