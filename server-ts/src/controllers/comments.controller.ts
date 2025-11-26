import { Request, Response } from "express"
import { prisma } from "../app.js"

const createComment = async (req: Request, res: Response) => {
    const { userId, oppId, content } = req.body

    if (!userId || !oppId || !content) {
        console.log("ReqBody empty!!! Comment module")
        return res.status(204).json({
            status: "fail",
            message: "request body empty",
        })
    }

	try {
		const comment = await prisma.comment.create({
			data: {
				content,
				opinionId: oppId,
				userId
			}
		})

		return res.status(200).json({
			status: "success",
			message: "Comment added to discussions successfully",
			comment: comment
		})
	} catch (err) {
		console.log("Comment Creation Error !!! ", err)
	}
}

export { createComment }