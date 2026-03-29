const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const Post = require("./models/Post")
const postRoutes = require("./routes/postRoutes")
const authRoutes = require("./routes/authRoutes")
const commentRoutes = require("./routes/comments")
const userRoutes = require("./routes/userRoutes")

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://admin:mannhu7804@cluster0.c4szm8q.mongodb.net/?appName=Cluster0")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err))

app.get("/", (req, res) => {
    res.send("Blog API running")
})

app.use("/users", userRoutes)

app.use("/posts", postRoutes)


app.get("/create", async (req, res) => {

    const post = new Post({
        title: "First Blog",
        content: "Hello this is my first post"
    })

    await post.save()

    res.send("Post created")
})

app.use("/auth", authRoutes)

app.use("/comments", commentRoutes)

app.listen(5000, () => {
    console.log("Server running on port 5000")
})