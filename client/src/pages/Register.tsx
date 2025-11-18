import { useState } from "react"
import axios from "axios"
import { saveKey, base64ToArrayBuffer } from "../service/db"

function Register() {
	const [username, setUsername] = useState<string>("")

	const handleRegister = async () => {
		if (username === "") {
			console.log("username can't be empty")
			return
		}
		// send request to server
		const res = await axios.post("http://localhost:3000/register", { nickname: username })

		if (res.data.status === "fail") {
			console.log("Registration Fail !!!")
			return
		}

		await saveKey(res.data.credentials.nickname, res.data.credentials.privateKey)

		console.log("key", base64ToArrayBuffer(res.data.credentials.privateKey))
		console.log("keys saved to indexedDB")
	}

	return <div className="flex flex-col items-end">
		<input
			onChange={(e) => setUsername(e.target.value)}
			placeholder="enter your nickname ..."
			className="border border-slate-500 rounded-md p-3"
		></input>

		<button
			onClick={handleRegister}
			className="bg-black text-white py-3 px-5 rounded-md mt-3 cursor-pointer"
		>Register</button>
	</div>
}
export default Register
