const express = require("express")
const router = express.Router()
const User = require("../models/user")
const authMiddleware = require("../middleware/auth")
const Notification = require("../models/Notification")
const mongoose = require("mongoose")

// GET PROFILE
router.get("/me", authMiddleware, async (req, res) => {
    console.log("USER ID:", req.user.id)
    const user = await User.findById(req.user.id).select("-password")
        .populate("friends", "username avatar")
    res.json(user)
})

//  UPDATE PROFILE
router.put("/me", authMiddleware, async (req, res) => {

    console.log("BODY:", req.body)
    console.log("USER:", req.user)

    try {
        const updated = await User.findByIdAndUpdate(
            req.user.id,
            req.body,
            { new: true }
        )

        res.json(updated)
    } catch (err) {
        console.log("ERROR:", err)
        res.status(500).json(err.message)
    }
})


router.post("/add-friend/:id", authMiddleware, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id)
        const targetUser = await User.findById(req.params.id)

        if (!targetUser) {
            return res.status(404).json("User not found")
        }

        if (currentUser._id.equals(targetUser._id)) {
            return res.status(400).json("Không thể kết bạn với chính mình")
        }

        // đã là bạn
        if (currentUser.friends?.includes(targetUser._id)) {
            return res.status(400).json("Đã là bạn")
        }

        // đã gửi trước đó
        if (currentUser.sentRequests?.includes(targetUser._id)) {
            return res.status(400).json("Đã gửi rồi")
        }

        // đảm bảo mảng tồn tại
        currentUser.sentRequests = currentUser.sentRequests || []
        targetUser.friendRequests = targetUser.friendRequests || []

        // push đúng chỗ
        currentUser.sentRequests.push(targetUser._id)
        targetUser.friendRequests.push(currentUser._id)

        await currentUser.save()
        await targetUser.save()

        res.json("Đã gửi lời mời")

    } catch (err) {
        console.error(err)
        res.status(500).json("Server error")
        console.log(err.response?.data)
    }
})

router.get("/friend-requests", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id)
        .populate("friendRequests", "username avatar")

    res.json(user.friendRequests)
})

router.post("/accept-friend/:id", authMiddleware, async (req, res) => {
    const currentUser = await User.findById(req.user.id)
    const sender = await User.findById(req.params.id)

    // add friend
    currentUser.friends.push(sender._id)
    sender.friends.push(currentUser._id)

    // remove request
    currentUser.friendRequests = currentUser.friendRequests.filter(
        id => !id.equals(sender._id)
    )
    sender.sentRequests = sender.sentRequests.filter(
        id => !id.equals(currentUser._id)
    )

    await currentUser.save()
    await sender.save()

    res.json("Đã chấp nhận")
})

router.post("/reject-friend/:id", authMiddleware, async (req, res) => {
    const currentUser = await User.findById(req.user.id)
    const sender = await User.findById(req.params.id)

    currentUser.friendRequests = currentUser.friendRequests.filter(
        id => !id.equals(sender._id)
    )

    sender.sentRequests = sender.sentRequests.filter(
        id => !id.equals(currentUser._id)
    )

    await currentUser.save()
    await sender.save()

    res.json("Đã từ chối")
})

router.post("/remove-friend/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id
        const friendId = req.params.id

        // xoá 2 chiều
        await User.findByIdAndUpdate(userId, {
            $pull: { friends: friendId }
        })

        await User.findByIdAndUpdate(friendId, {
            $pull: { friends: userId }
        })

        res.json("Đã huỷ kết bạn")
    } catch (err) {
        res.status(500).json("Lỗi server")
    }
})

router.get("/friends", authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id)
        .populate("friends", "username avatar")

    res.json(user.friends)
})
router.get("/notifications", authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user.id
        })
        .populate("sender", "username avatar")
        .populate("post")
        .sort({ createdAt: -1 })

        res.json(notifications)

    } catch (err) {
        res.status(500).json(err)
    }
})

router.post("/notifications/read", authMiddleware, async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user.id },
        { isRead: true }
    )
    res.json("Đã đọc")
})

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json("ID không hợp lệ")
        }

        const user = await User.findById(id)
        res.json(user)

    } catch (err) {
        console.error(err)
        res.status(500).json(err.message)
    }
})

module.exports = router