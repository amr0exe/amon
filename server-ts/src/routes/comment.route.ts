import express from "express"
import {
    createComment,
    getComment,
} from "../controllers/comments.controller.js"

const commentRouter = express.Router()

commentRouter.post("/comment", createComment)
commentRouter.get("/opp/:oppId/comments", getComment)

export default commentRouter
