const express = require("express")
const router = express.Router()
const Comment = require("../models/Comment")
const authMiddleware = require("../middleware/auth")
const Post = require("../models/Post")
const Notification = require("../models/Notification")
const mongoose = require("mongoose")

// tạo comment
router.post("/", authMiddleware, async (req, res) => {
    try {

        console.log("=== CREATE COMMENT ===")
        console.log("BODY:", req.body)
        console.log("USER:", req.user)

        if (!req.body.content || !req.body.postId) {
            return res.status(400).json("Thiếu dữ liệu")
        }

        const post = await Post.findById(req.body.postId)
        console.log("POST:", post)

        if (!post) {
            return res.status(404).json("Post không tồn tại")
        }

        const comment = new Comment({
            content: req.body.content,
            postId: req.body.postId,
            userId: req.user.id,
            parentId: req.body.parentId || null
        })

        const saved = await comment.save()

        await Post.findByIdAndUpdate(req.body.postId, {
            $push: { comments: saved._id }
        })
        console.log("POST AUTHOR:", post?.author)
        console.log("CURRENT USER:", req.user._id)

        if (post.author && post.author.toString() !== req.user.id) {
            await Notification.create({
                recipient: post.author,
                sender: req.user.id,
                type: "comment",
                post: post._id
            })
        }

        const populated = await Comment.findById(saved._id)
            .populate("userId", "_id username avatar")

        res.json(populated)

    } catch (err) {
        console.error("COMMENT ERROR:", err)
        res.status(500).json(err.message)
    }
})
//  lấy comment theo post
router.get("/:postId", async (req, res) => {

    const comments = await Comment.find({ postId: req.params.postId })
        .populate("userId", "_id username avatar")
        .sort({ createdAt: 1 })

    res.json(comments)
})

router.put("/like/:id", authMiddleware, async (req, res) => {
    try {
        console.log("=== LIKE COMMENT ===")
        console.log("PARAM ID:", req.params.id)
        console.log("USER:", req.user._id)

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json("ID không hợp lệ")
        }

        const comment = await Comment.findById(id)
        console.log("COMMENT:", comment)

        if (!comment) {
            return res.status(404).json("Comment không tồn tại")
        }

        const userId = req.user.id

        if (!comment.likes) comment.likes = []

        const isLiked = comment.likes.some(
            i => i.toString() === userId.toString()
        )

        if (isLiked) {
            comment.likes = comment.likes.filter(
                i => i.toString() !== userId.toString()
            )
        } else {
            comment.likes.push(userId)
        }

        await comment.save()

        res.json(comment)

    } catch (err) {
        console.error("LIKE ERROR:", err)
        res.status(500).json(err.message)
    }
})


module.exports = router