import { Request, Response } from "express"
import { prisma } from "../app.js"

const createComment = async (req: Request, res: Response) => {
    const { nickname, oppId, content } = req.body

    if (!nickname || !oppId || !content) {
        console.log("ReqBody empty!!! Comment module")
        return res.status(204).json({
            status: "fail",
            message: "request body empty",
        })
    }

    const user = await prisma.user.findFirst({ where: { nickname } })
    if (!user) {
        return res.status(404).json({
            status: "failed",
            message: "User doesn't exist !!!",
        })
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                opinionId: oppId,
                userId: user.id,
            },
        })

        return res.status(200).json({
            status: "success",
            message: "Comment added to discussions successfully",
            comment: comment,
        })
    } catch (err) {
        console.log("Comment Creation Error !!! ", err)
    }
}
const getComment = async (req: Request, res: Response) => {
    const { oppId } = req.params
    const page = parseInt(req.query.page as string) || 1
    const pageSize = 3

    const [comments, total] = await Promise.all([
        prisma.comment.findMany({
            where: { opinionId: parseInt(oppId) },
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                opinionId: true,
                userId: true,
            },
        }),
        prisma.comment.count({ where: { opinionId: parseInt(oppId) } }),
    ])

    const hasMore: Boolean = page * pageSize < total

    return res.status(200).json({
        status: "success",
        message: "Successfully fetched comments !!!",
        hasMore,
        comments,
    })
}

export { createComment, getComment }
