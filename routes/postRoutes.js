const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/auth")
const Post = require("../models/Post")

// CREATE POST
router.post("/", authMiddleware, async (req, res) => {

    const newPost = new Post({
        title: req.body.title,
        content: req.body.content,
        images: req.body.images || [],
        author: req.user.id 
    })

    const saved = await newPost.save()

   

    res.json(saved)
})

// GET ALL POSTS
router.get("/", async (req, res) => {

    const posts = await Post.find()
        .populate("author", "username avatar")
        .populate({
            path: "comments",
            populate: {
                path: "userId",
                select: "username avatar"
            }
        })
        .sort({ createdAt: -1 })

    res.json(posts)
})

// GET POSTS BY USER
router.get("/user/:userId", async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.userId })
            .populate("author", "username avatar")
            .populate({
                path: "comments",
                populate: {
                    path: "userId",
                    select: "username avatar"
                }
            })
            .sort({ createdAt: -1 })

        res.json(posts)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

// GET SINGLE POST
router.get("/:id", async (req, res) => {

    const post = await Post.findById(req.params.id)
        .populate("author", "username avatar")

    res.json(post)

})


// UPDATE POST
router.put("/:id", authMiddleware, async (req, res) => {

    const post = await Post.findById(req.params.id)
    console.log("Post user:", post.author.toString())
    console.log("User login:", req.user.id)


    if (post.author.toString() !== req.user.id) {
        return res.status(403).json("Không có quyền")
    }
    if (!post) {
        return res.status(404).json("Post không tồn tại")
    }

    const updated = await Post.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: "after" }
    )

    res.json(updated)
})


// DELETE POST
router.delete("/:id", authMiddleware, async (req, res) => {

    const post = await Post.findById(req.params.id)

    // ❌ nếu không phải chủ bài
    if (post.author.toString() !== req.user.id) {
        return res.status(403).json("Bạn không có quyền")
    }
    if (!post) {
        return res.status(404).json("Post không tồn tại")
    }

    await post.deleteOne()

    res.json("Đã xoá")
})

router.put("/like/:id", authMiddleware, async (req, res) => {

    const post = await Post.findById(req.params.id)

    const userId = req.user.id

    if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id.toString() !== userId)
    } else {
        post.likes.push(userId)
    }

    await post.save()

    res.json(post)
})

const Notification = require("../models/Notification")

router.post("/like/:postId", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)

        if (!post) return res.status(404).json("Post không tồn tại")

        // toggle like
        const isLiked = post.likes.includes(req.user.id)

        if (isLiked) {
            post.likes.pull(req.user.id)
        } else {
            post.likes.push(req.user.id)

            // 🚨 tạo notification (không phải chính mình)
            if (post.user.toString() !== req.user.id) {
                await Notification.create({
                    recipient: post.user,
                    sender: req.user.id,
                    type: "like",
                    post: post._id
                })
            }
        }

        await post.save()
        res.json(post)

    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = router