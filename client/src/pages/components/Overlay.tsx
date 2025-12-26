import { useState } from "react"
import { hashToBase64, signTheOpp } from "../../service/db"
import axios from "axios"
import { generateNonce } from "../../service/db"
import { env } from "../../config/env"

function Overlay({
    onClose,
    username,
    onSuccess,
}: {
    onClose: () => void,
    username: string,
    onSuccess: () => void
}) {
    const [content, setContent] = useState("")
    const MAX_LENGTH = 50

    const handleSubmit = async () => {
        if (!content.trim() || content.length > MAX_LENGTH) return

        try {
            const sig_content = await signTheOpp(username, content)

            // authg
            const req_type = "POST"
            const nonce = generateNonce()
            const sig_str = `${req_type}${nonce}${username}`
            const sig_hash = hashToBase64(sig_str)
            const signed_hash = await signTheOpp(username, sig_hash)

            const response = await axios.post(`${env.url}/opp`, { nickname: username, content, signedContent: sig_content}, {
                headers: {
                    "X-Nonce": nonce,
                    "X-Nickname": username,
                    "X-Sig": signed_hash
                }
            })
            if (response.data.status === "success") {
                console.log("Opp raised successfully")

                await onSuccess?.()
                onClose()
                return
            }
        } catch (err) {
            console.log("Failed raising an Opp: ", err)
        }
    }
    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation()

    return <div 
        className="fixed inset-0 bg-black/60  z-50 flex items-center justify-center"
        onClick={onClose}
    >
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-sm sm:text-md" onClick={stopPropagation}>
            <div className="flex justify-between items-center mb-2">
                <label className="block font-medium text-black">Your Opinion ...</label>

                {/* characters limiter */}
                <div className="flex justify-between items-center">
                    <span className={`text-xs ${content.length > MAX_LENGTH * 0.9 ? 'text-red-500' : 'text-slate-500'}`}>
                        {content.length}/{MAX_LENGTH}
                    </span>
                </div>
            </div>

            <input
                autoFocus
                value={content} 
                onChange={(e) => { setContent(e.target.value)}}
                className="w-full border px-3 py-2 mb-4 rounded text-md"
                placeholder="write your opinion here ..."
            />

            <div className="flex justify-end gap-3">
                <button
                    className="px-4 py-2 text-black bg-slate-300 rounded cursor-pointer hover:scale-110 transform transition-transform duration-200 ease-in-out"
                onClick={onClose}
                >Cancel</button>

                <button 
                    className="px-4 py-2 bg-cyan-600 text-white rounded cursor-pointer hover:scale-110 transform transition-transform duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onClick={() => handleSubmit()}
                    disabled={(!content.trim() || content.length > MAX_LENGTH)}
                >
                    Submit
                </button>
            </div>

        </div>

    </div>
}

export default Overlay
