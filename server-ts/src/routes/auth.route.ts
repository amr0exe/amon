import express from "express"
import {
    loginVerify,
    loginRequest,
    registerUser,
} from "../controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/register", registerUser)
authRouter.post("/login/request", loginRequest)
authRouter.post("/login/verify", loginVerify)

export default authRouter
