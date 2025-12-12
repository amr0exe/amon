import express from "express"
import { searchOpps } from "../controllers/search.conntroller.js"

const searchRouter = express.Router()

searchRouter.get("/search", searchOpps)

export default searchRouter
