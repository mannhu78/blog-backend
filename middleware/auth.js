const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json("Không có token")
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            return res.status(401).json("Token rỗng")
        }

        const decoded = jwt.verify(token, "mysecretkey")

        req.user = decoded
        next()

    } catch (err) {
        console.error(err)
        return res.status(403).json("Token không hợp lệ")
    }
}
module.exports = authMiddleware