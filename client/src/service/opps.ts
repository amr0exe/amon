import { useState, useEffect } from "react"
import axios from "axios"
import { generateNonce, hashToBase64, signTheOpp } from "./db";

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


export function useOpps(nickname: string) {
	const [opps, setOpps] = useState<Opps[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	const fetchOpps = async () => {
		try {
            const req_type = "GET"
            const nonce = generateNonce()
            const sig_str = `${req_type}${nonce}${nickname}`
            const sig_hash = hashToBase64(sig_str)
            const signed_hash = await signTheOpp(nickname, sig_hash)

			setLoading(true)
			const response = await axios.get("http://localhost:3000/opp", 
                {
                    headers: {
                        'x-nonce': nonce,
                        'x-nickname': nickname,
                        'x-sig': signed_hash
                    }
                })
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
        const req_type = "POST"
        const nonce = generateNonce()
        const sig_str = `${req_type}${nonce}${nickname}`
        const sig_hash = hashToBase64(sig_str)
        const signed_hash = await signTheOpp(nickname, sig_hash)

		const resp = await axios.post("http://localhost:3000/comment", { nickname, oppId, content },
            {
                headers: {
                    'x-nonce': nonce, 
                    'x-nickname': nickname,
                    'x-sig': signed_hash
                }
            }
        )
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
