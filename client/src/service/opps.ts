import { useState, useEffect } from "react"
import axios from "axios"

type Opps = {
	id: number;
	opinion: string;
	createdAt: string;
	userId: number;
	_count: {
		comments: number;
	};
}

export type CommentR = {
	id: number;
	content: string;
	createdAt: string;
	opinionId: number;
	userId: number
}


export function useOpps() {
	const [opps, setOpps] = useState<Opps[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchOpps = async () => {
		try {
			setLoading(true)
			const response = await axios.get("http://localhost:3000/opp")
			setOpps(response.data.opps)
		} catch (err) {
			setError(err as Error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchOpps()
	}, [])

	return { opps, loading, error, refetch: fetchOpps  }
}

export async function postComment(nickname: string, oppId: number, content: string ) {
	if (!nickname || !oppId || !content) {
		console.log("Body for comment can't be empty")
		return
	}
	try {
		const resp = await axios.post("http://localhost:3000/comment", {
			nickname,
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

export function useGetComments(oppId: number, page: number): CommentR[] {
	const [comments, setComments] = useState<Array<any>>([])

	try {
		async function fetchComments() {
			const resp = await axios.get(`http://localhost:3000/opp/${oppId}/comments?page=${page}`)
			setComments(resp.data.comments)
		}
		fetchComments()
	} catch (err) {
		console.log("Failed fetching comments ...")
	}

	return comments
}