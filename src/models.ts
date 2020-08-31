'use strict'
const mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema

const UserSchema = new Schema({
    userName: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        require: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
})

const RoomSchema = new Schema({
    roomName: {
        type: String
    },
    messages: [
        {
            userName: {type: String},
            message: {type: String},
            creadted: {
                type: Date,
                default: Date.now
            }
        }
    ],
    created: {
        type: Date,
        default: Date.now
    }
})

const MessageSchema = new Schema({
    user: UserSchema,
    roomName: {type: String, unique: true},
    message: String,
    created: {
        type: Date,
        default: Date.now
    }
})

// compare function , compare password pass as argument with hashed password store in database
UserSchema.methods.comparePassword = function(password:String) {
    return bcrypt.compareSync(password, this.hashedPassword)
}


export const User = mongoose.model('User', UserSchema)
const Message = mongoose.model('Message', MessageSchema)
const Room = mongoose.model('Room', RoomSchema)

module.exports = { User, Message, Room }