import axios from "axios"
import { useNavigate } from "react-router-dom"
import { arrayBufferToBase64, base64ToArrayBuffer, getKey, setActiveUser } from "../service/db"
import { useUserContext } from "../context/UserContext"
import { useAuth } from "../context/AuthContext"

function Login() {
	const ctx = useUserContext()
	const { setUsername, username } = ctx

	const ctx_r = useAuth()
	const { login } = ctx_r	

	const navigate = useNavigate()

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
        
        await setActiveUser(username)
		login({ username })
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
