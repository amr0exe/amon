import express from "express"
import {
    createComment,
    getComment,
} from "../controllers/comments.controller.js"
import { checkAuthorization } from "../middleware/auth.middleware.js"

const commentRouter = express.Router()

commentRouter.post("/comment", checkAuthorization, createComment)
commentRouter.get("/opp/:oppId/comments", checkAuthorization, getComment)

export default commentRouter
