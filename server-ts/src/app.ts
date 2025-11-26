import express from "express"
import cors from "cors"
import "dotenv/config"

import { PrismaClient } from "./generated/prisma/client.js"
import router from "./routes/index.route.js"

const app = express()
export const prisma = new PrismaClient()
const PORT = process.env.PORT

app.use(express.json())
app.use(cors())

app.use("/", router)

app.listen(PORT, () => {
    console.log("listening on port :3000")
})
