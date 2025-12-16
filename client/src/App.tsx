import { BrowserRouter, Routes, Route } from "react-router-dom"

import Auth from "./pages/Auth"
import Landing from "./pages/Landing"
import { RequireAuth } from "./auth/RequireAuth"
import { AuthProvider } from "./context/AuthContext"

function App() {

	return <>
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/auth" element={<Auth />} />

					<Route path="/" element={
						<RequireAuth>
							<Landing />
						</RequireAuth>
					} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	</>
}

export default App
