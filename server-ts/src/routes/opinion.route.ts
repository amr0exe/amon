import express from "express"
import {
    raiseOpinion,
    getOpinions,
    getSingleOpinion,
} from "../controllers/opinions.controller.js"
import { checkAuthorization } from "../middleware/auth.middleware.js"

const oppRouter = express.Router()

oppRouter.post("/opp", checkAuthorization, raiseOpinion)
oppRouter.get("/opp", checkAuthorization, getOpinions)
oppRouter.get("/opp/:id", getSingleOpinion)

export default oppRouter
