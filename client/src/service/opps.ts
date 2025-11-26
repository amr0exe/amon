import { useState, useEffect } from "react"
import axios from "axios"

type Opps = {
	id: number;
	opinion: string;
	comments: Array<any>;
	createdAt: string;
	userId: number;
}

export function useOpps() {
	const [opps, setOpps] = useState<Opps[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		async function fetchOpps() {
			try {
				const response = await axios.get("http://localhost:3000/opp")
				setOpps(response.data.opps)
			} catch (err) {
				setError(err as Error)
			} finally {
				setLoading(false)
			}
		}

		fetchOpps()
	}, [])

	return { opps, loading, error }
}

export async function postComment(userId: number, oppId: number, content: string ) {
	try {
		const resp = await axios.post("http://localhost:3000/comment", {
			userId,
			oppId,
			content
		})
		if (resp.data.status === "success") {
			console.log("comment posted !!!")
		}
	} catch (err) {
		console.log("Comment Creation Failed !!!", err)
	}
}