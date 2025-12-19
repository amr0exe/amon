import { Request, Response } from "express"
import { prisma } from "../app.js"
import { getPubKey } from "../utils/utils.js"

const raiseOpinion = async (req: Request, res: Response) => {
    const { nickname, content, signedContent } = req.body

    if (!nickname || !content || !signedContent) {
        console.log("ReqBody empty !!!")
        return res.status(204).json({
            status: "fail",
            message: "request body empty !!!",
        })
    }

    // user's publicKey, retrieved with nickname
    const { userId, pubKey } = await getPubKey(nickname)
    if (!pubKey || !userId) {
        console.log("No PubKey!!! No User !!!")
        return
    }

    const signatureBuffer = Buffer.from(signedContent, "base64")

    // encoder, converts str -> ArrayBuffer
    const enc = new TextEncoder()
    const isValid = await crypto.subtle.verify(
        { name: "Ed25519" },
        pubKey,
        signatureBuffer,
        enc.encode(content),
    )
    if (!isValid) {
        console.log("Invalid Signature !!!")
        return res.status(401).json({
            status: "fail",
            message: "Invalid Signature !!!",
        })
    }

    const user = await prisma.user.findFirst({ where: { nickname } })
    if (!user) {
        return
    }

    const opinion = await prisma.opinion.create({
        data: {
            opinion: content,
            userId: user?.id,
        },
    })
    if (!opinion) {
        return res.status(200).json({
            status: "fail",
            message: "failed in opinion creation ...",
        })
    }

    res.status(200).json({
        status: "success",
        message: "Opinion creation successfull !!!",
        opp: {
            opinionId: opinion.id,
            userId: opinion.userId,
        },
    })
}

const getOpinions = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = 9

    const [opinions, total] = await Promise.all([
        prisma.opinion.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                opinion: true,
                createdAt: true,
                userId: true,
                _count: { select: { comments: true } },
            },
        }),
        prisma.opinion.count()
    ])

    const hasMore: Boolean = page * pageSize < total

    if (!opinions) {
        return res.json({
            status: "fail",
            message: "No Opinions @@@",
        })
    }

    return res.status(200).json({
        status: "success",
        message: "Options fetched successfully",
        hasMore,
        opps: opinions,
    })
}

const getSingleOpinion = async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const Opp = await prisma.opinion.findFirst({ 
        where: { id },
        select: {
            id: true,
            opinion: true,
            createdAt: true,
            userId: true,
            _count: { select: { comments: true } },
        },
    })
    if (!Opp) {
        return res.status(401).json({
            status: "fail",
            message: "Failed fetching Opps ...",
        })
    }

    res.status(200).json({
        status: "success",
        message: "Opps fetched successfully ...",
        opinion: Opp
    })
}

// Not DELETE, archive's the post when heavily reported
//
const archiveOpinion = () => {
    // archives an opinion
    // find the Opinion by ID
    // change archive tag from false -> true
    // when archived
    // when viewed either by direct link, or fetched List
    // hide with cover but with click one can view it
    // figure out if to shadowBan it
    // can prevent from being fetched
    // just put cover only, which can be viwed or just a curtain for extra friction
    // or to put at last on priority list
}

export { raiseOpinion, getOpinions, getSingleOpinion }
