
import express from "express"
import { createComment } from "../controllers/comments.controller.js"

const commentRouter = express.Router()

commentRouter.post("/comment", createComment)

export default commentRouter