import express from "express"
import authRouter from "./auth.route.js"
import oppRouter from "./opinion.route.js"
import commentRouter from "./comment.route.js"
import searchRouter from "./search.route.js"

const router = express.Router()

router.use(authRouter)
router.use(oppRouter)
router.use(commentRouter)
router.use(searchRouter)

export default router
