import { BrowserRouter, Routes, Route } from "react-router-dom"

import Opp from "./pages/Opp"
import Auth from "./pages/Auth"
import Landing from "./pages/Landing"

function App() {

	return <>
		<BrowserRouter>
			<Routes>
				<Route path="/opp" element={<Opp />} />
				<Route path="/auth" element={<Auth />} />
				<Route path="/" element={<Landing />} />
			</Routes>
		</BrowserRouter>
	</>
}

export default App
