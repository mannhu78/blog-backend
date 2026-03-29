const mongoose = require("mongoose")

const CommentSchema = new mongoose.Schema({
    content: String,

    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null 
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    }

}, { timestamps: true })

module.exports = mongoose.model("Comment", CommentSchema)