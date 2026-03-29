const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({
    title: String,
    content: String,
    images: [String],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model("Post", PostSchema)