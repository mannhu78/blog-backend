const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // người nhận
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },   // người tạo
    type: { type: String, enum: ["like", "comment"] },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    isRead: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model("Notification", notificationSchema)