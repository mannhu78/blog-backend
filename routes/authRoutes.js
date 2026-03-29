const express = require("express")
const router = express.Router()
const User = require("../models/user")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// REGISTER
router.post("/register", async (req, res) => {
    try {
        let { username, email, password } = req.body

        email = email.toLowerCase().trim()

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json("Email đã tồn tại")
        }

        const hashed = await bcrypt.hash(password, 10)

        const user = new User({
            username,
            email,
            password: hashed
        })

        await user.save() 

        const token = jwt.sign(
            { id: user._id },
            "mysecretkey"
        )

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username
            }
        })

    } catch (err) {
        console.error(err)
        res.status(500).json("Server error")
    }
})

// LOGIN
router.post("/login", async (req, res) => {

    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json("User not found")

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json("Wrong password")

    const token = jwt.sign(
        { id: user._id },
        "mysecretkey"
    )

    res.json({
        token, user: {
            id: user._id,
            username: user.username
        } })
})

module.exports = router