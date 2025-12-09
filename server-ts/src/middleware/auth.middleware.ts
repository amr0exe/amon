import { Request, Response, NextFunction } from "express"
import { getPubKey } from "../utils/utils.js"

const checkAuthorization = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const r_nonce = req.headers["x-nonce"]
    const r_username = req.headers["x-nickname"]
    const r_signature = req.headers["x-sig"]

    const nonce = Array.isArray(r_nonce) ? r_nonce[0] : r_nonce
    const username = Array.isArray(r_username) ? r_username[0] : r_username
    const signature = Array.isArray(r_signature) ? r_signature[0] : r_signature

    if (!nonce || !username || !signature) {
        return res.status(401).json({
            success: false,
            message: "Some headers are missing !!!",
        })
    }

    const { userId, pubKey } = await getPubKey(username)
    const sig_buffer = `${req.method}${nonce}${username}`
    const sig_buff = Buffer.from(sig_buffer, "utf-8").toString("base64")

    const enc = new TextEncoder()
    const isValid = crypto.subtle.verify(
        { name: "Ed25519" },
        pubKey,
        Buffer.from(signature, "base64"),
        enc.encode(sig_buff),
    )

    if (!isValid) {
        return res.status(301).json({
            success: false,
            message: "It ain't valid !!!",
        })
    } else {
        next()
    }
}

export { checkAuthorization }
