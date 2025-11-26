import { prisma } from "../app.js"

const getPubKey = async (nickname: string) => {
    if (!nickname) {
        console.log("nickname is required to access PubKey")
        throw new Error("nickname is required")
    }

    const user = await prisma.user.findFirst({ where: { nickname } })
    if (!user) {
        console.log("user doesn't exists")
        throw new Error("user doesn't exists")
    }

    const pubKeyBuffer = Buffer.from(user.pubKey, "base64")
    const publicKey: CryptoKey = await crypto.subtle.importKey(
        "spki",
        pubKeyBuffer,
        { name: "Ed25519" },
        true,
        ["verify"],
    )

    return {
        userId: user.id,
        pubKey: publicKey,
    }
}

export { getPubKey }
