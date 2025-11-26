import { useState, useContext } from "react"
import axios from "axios"
import { arrayBufferToBase64, base64ToArrayBuffer, getKey } from "../service/db"
import { useNavigate } from "react-router-dom"
import UserContext from "../context/UserContext"

function Login() {
	const navigate = useNavigate()
	const context = useContext(UserContext)
	if (!context) return

	const { setUsername, username } = context

	const handleLogin = async () => {
		if (username === "") {
			console.log("username can't be empty")
			return
		}
		// send request to server
		const res = await axios.post("http://localhost:3000/login/request", { nickname: username })
		const challenge = res.data.challenge
		const enc = new TextEncoder()
		const challenge_bytes = enc.encode(challenge)

		// load key -> conversion with crypto.subtle importKey
		const privateKeybase64 = await getKey(username)
		if (!privateKeybase64) {
			console.log("There is no privateKey locally !!!")
			return
		}
		const privateKeyBuffer = base64ToArrayBuffer(privateKeybase64)
		const privateKey = await crypto.subtle.importKey(
			'pkcs8',
			privateKeyBuffer,
			{ name: 'Ed25519' },
			true,
			['sign']
		)

		// send signed-challenge to verify
		const signedChallenge = await crypto.subtle.sign({ name: 'Ed25519' }, privateKey, challenge_bytes)
		const cha1 = arrayBufferToBase64(signedChallenge)

		const res1 = await axios.post("http://localhost:3000/login/verify", { nickname: username, signatureBase64: cha1 })
		if (res1.data.status === "fail") {
			console.log("Signature verificaiton failed")
			return
		}

		console.log("User authenticated !!!", username)
		navigate("/")
	}

	return <div className="flex flex-col items-end">
		<input
			onChange={(e) => setUsername(e.target.value)}
			placeholder="enter your nickname ..."
			className="border border-slate-500 rounded-md p-3"
		></input>

		<button
			onClick={handleLogin}
			className="bg-black text-white py-3 px-5 rounded-md mt-3 cursor-pointer"
		>Login</button>
	</div>
}
export default Login
