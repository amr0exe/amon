import { Request, Response } from "express"
import { randomBytes } from "node:crypto"
import { prisma } from "../app.js"

const registerUser = async (req: Request, res: Response) => {
    const { nickname } = req.body

    const user = await prisma.user.findUnique({
        where: { nickname },
    })
    if (user) {
        console.log("User already exists !!!")
        return res.status(409).json({
            status: "fail",
            message: "registration failed !!!",
        })
    }

    const key_pair = await crypto.subtle.generateKey(
        { name: "Ed25519" },
        true,
        ["sign", "verify"],
    )

    if (!("publicKey" in key_pair) || !("privateKey" in key_pair)) {
        console.log("failed in generating required keys !!!")
        return
    }

    const toBase64 = (key: ArrayBuffer) => {
        return Buffer.from(key).toString("base64")
    }
    const pubKeyBuffer = await crypto.subtle.exportKey(
        "spki",
        key_pair.publicKey,
    )
    const pubKeyBase64 = toBase64(pubKeyBuffer)
    const privateKeyBuffer = await crypto.subtle.exportKey(
        "pkcs8",
        key_pair.privateKey,
    )
    const privateKeyBase64 = toBase64(privateKeyBuffer)

    const user1 = await prisma.user.create({
        data: {
            nickname,
            pubKey: pubKeyBase64,
        },
    })

    return res.status(201).json({
        status: "success",
        credentials: {
            nickname,
            privateKey: privateKeyBase64,
        },
    })
}

const loginRequest = async (req: Request, res: Response) => {
    const { nickname } = req.body

    const user = await prisma.user.findUnique({ where: { nickname } })
    if (!user) {
        console.log("User doesn't exists !!!")
        return res.status(404).json({
            status: "fail",
            message: "Coudn't find the user !!!",
        })
    }

    // CleanUp, for Orphan Challenges
    await prisma.challenge.deleteMany({ where: { userId: user.id } })

    const challenge = randomBytes(32).toString("hex")
    const puzzle = await prisma.challenge.create({
        data: {
            challenge,
            user: {
                connect: { id: user.id },
            },
        },
    })

    res.status(200).json({ challenge })
}

const loginVerify = async (req: Request, res: Response) => {
    const { nickname, signatureBase64 } = req.body

    const user = await prisma.user.findUnique({ where: { nickname } })
    if (!user) {
        console.log("User doesn't exists !!!")
        return res.status(404).json({
            status: "fail",
            message: "Coudn't find the user !!!",
        })
    }

    const challenge = await prisma.challenge.findFirst({
        where: { userId: user.id },
    })
    if (!challenge) {
        console.log("Challenge doesn't exits !!!")
        return res.status(404).json({
            status: "fail",
            message: "Trying to verify Challenge that doesn't exists !!!",
        })
    }

    const pubKeyBuffer = Buffer.from(user.pubKey, "base64")
    const publicKey = await crypto.subtle.importKey(
        "spki",
        pubKeyBuffer,
        { name: "Ed25519" },
        true,
        ["verify"],
    )

    const encoder = new TextEncoder()
    const signature = Buffer.from(signatureBase64, "base64")
    const valid = await crypto.subtle.verify(
        { name: "Ed25519" },
        publicKey,
        signature,
        encoder.encode(challenge.challenge),
    )

    // challenge cleanUp on successfull, VERIFICATION !!!
    const del_challenge = await prisma.challenge.deleteMany()
    if (del_challenge.count === 0) {
        console.log("Failed deleting Challenge !!! CleanUp Failed !!!")
        return
    }

    if (valid) {
        return res.status(200).json({
            status: "success",
            message: "Authentication Successfull !!!",
        })
    }

    res.status(400).json({
        status: "failed",
        message: "Invalid Signature",
    })
}

export { registerUser, loginRequest, loginVerify }
