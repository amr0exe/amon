import { useContext, useState } from "react"
import { signTheOpp } from "../../service/db"
import axios from "axios"
import UserContext from "../../context/UserContext"

function Overlay({
    onClose
}: {
    onClose: () => void
}) {
    const [content, setContent] = useState("")
    const context = useContext(UserContext)
    if (!context) return

    const { username } = context
    if (!username) {
        console.log("No Username !!!")
        return
    }

    const handleSubmit = async () => {
        try {
            const sig_content = await signTheOpp(username, content)
            const response = await axios.post("http://localhost:3000/opp", { nickname: username, content, signedContent: sig_content})
            if (response.data.status === "success") {
                console.log("Opp raised successfully")
                return
            }
        } catch (err) {
            console.log("Failed raising an Opp: ", err)
        }
    }
    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation()

    return <div 
        className="fixed inset-0 bg-black opacity-60 z-50 flex items-center justify-center"
        onClick={onClose}
    >
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md" onClick={stopPropagation}>
            <label className="block mb-2 text-md font-medium text-slate-700">Your Opinion ...</label>
            <input
                autoFocus
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                className="w-full border px-3 py-2 mb-4 rounded text-md"
                placeholder="write your opinion here ..."
            />

            <div className="flex justify-end gap-3">
                <button
                    className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-slate-400 hover:scale-110"
                    onClick={onClose}
                >Cancel</button>

                <button 
                    className="px-4 py-2 bg-cyan-600 text-white rounded cursor-pointer hover:scale-110"
                    onClick={() => handleSubmit()}
                >
                    Submit
                </button>
            </div>

        </div>

    </div>
}

export default Overlay