import { Request, Response } from "express"
import { prisma } from "../app.js"

const searchOpps = async (req: Request, res: Response) => {
    const q = req.query.q as string

    if (!q || q.length < 2) {
        return res.status(200).json([])
    }

    const word = q.split(" ").filter(Boolean)
    const results = await prisma.opinion.findMany({
        where: {
            AND: word.map(wrd => ({
                opinion: { 
                    contains: wrd,
                    mode: "insensitive"
                }
            }))
        },
        take: 4,
        select: {
            id: true,
            opinion: true,
            createdAt: true,
            userId: true,
            _count: { select: { comments: true } },
        },
    })

    res.status(200).json(results)
}

export { searchOpps }
