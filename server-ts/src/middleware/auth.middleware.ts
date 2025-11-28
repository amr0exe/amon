import { Request, Response, NextFunction } from "express"
import { Prisma } from "../generated/prisma/client.js"

const checkAuthorization = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {}
