import express from "express"
import {
    raiseOpinion,
    getOpinions,
} from "../controllers/opinions.controller.js"

const oppRouter = express.Router()

oppRouter.post("/opp", raiseOpinion)
oppRouter.get("/opp", getOpinions)

export default oppRouter
