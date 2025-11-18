import { prisma } from "../app.js"

const getPubKey = async (nickname: string) => {
    if (!nickname) {
        console.log("nickname is required to access PubKey")
        return
    }

    const user = await prisma.user.findFirst({ where: { nickname } })
    if (!user) {
        console.log("user doesn't exists")
        return
    }

    const pubKeyBuffer = Buffer.from(user.pubKey, "base64")
    const publicKey = await crypto.subtle.importKey(
        "spki",
        pubKeyBuffer,
        { name: "Ed25519" },
        true,
        ["verify"],
    )

    return publicKey
}

export { getPubKey }
