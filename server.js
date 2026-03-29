const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const Post = require("./models/Post")
const postRoutes = require("./routes/postRoutes")
const authRoutes = require("./routes/authRoutes")
const commentRoutes = require("./routes/comments")
const userRoutes = require("./routes/userRoutes")
const PORT = process.env.PORT || 5000

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err))

app.get("/", (req, res) => {
    res.send("Blog API running")
})

app.use("/api/users", userRoutes)

app.use("/api/posts", postRoutes)


app.get("/create", async (req, res) => {

    const post = new Post({
        title: "First Blog",
        content: "Hello this is my first post"
    })

    await post.save()

    res.send("Post created")
})

app.use("/api/auth", authRoutes)

app.use("/api/comments", commentRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})