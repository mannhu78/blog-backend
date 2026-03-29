const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,

    avatar: {
        type: String,
        default: "https://api.dicebear.com/7.x/adventurer/svg?seed=default"
    },

    bio: {
        type: String,
        default: ""
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }],

    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }],

    sentRequests: [{
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }]

}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema)