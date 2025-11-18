import { useState } from "react"
import Register from "./Register"
import Login from "./Login"

function Auth() {
	const [authOpp, setAuthOpp] = useState<"register" | "login">("register")

	return <div className="h-screen font-mono flex flex-col items-center">
		{/* TOP bar */}
		<div className="w-md mt-10 flex font-semibold text-center">
			<div
				onClick={() => setAuthOpp("register")}
				className={`w-1/2 py-2 cursor-pointer rounded-md ${authOpp === "register" ? "bg-slate-200" : "bg-white"}`}
			>Register</div>
			<div
				onClick={() => setAuthOpp("login")}
				className={`w-1/2 py-2 cursor-pointer rounded-md ${authOpp === "login" ? "bg-slate-200" : "bg-white"}`}
			>Login</div>
		</div>


		{/* auth components */}
		<div className="mt-20">
			{authOpp === "register" ? <Register /> : <Login />}
		</div>
	</div>
}

export default Auth
