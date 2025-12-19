import axios from "axios"
import { useState, useEffect } from "react"
import { generateNonce, getActiveUser, hashToBase64, signTheOpp } from "./db";

export type Opps = {
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

export type Opp = {
    id: number;
    opinion: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
}

export function useOpps(nickname: string) {
    const [opps, setOpps] = useState<Opps[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    const fetchOpps = async (pageNum: number = 1, append: boolean = false) => {
        try {
            if (!nickname) {
                const activeUser = await getActiveUser()
                if (activeUser) nickname = activeUser
                console.log("refresh user", activeUser)
            }

            const req_type = "GET"
            const nonce = generateNonce()
            const sig_str = `${req_type}${nonce}${nickname}`
            const sig_hash = hashToBase64(sig_str)
            const signed_hash = await signTheOpp(nickname, sig_hash)

            if (page > 1) { setLoading(true) }
            const response = await axios.get(`http://localhost:3000/opp?page=${pageNum}`,
                {
                    headers: {
                        'x-nonce': nonce,
                        'x-nickname': nickname,
                        'x-sig': signed_hash
                    }
                })
            setHasMore(response.data.hasMore)

            if (!hasMore) {
                console.log("End of Opp records ...")
                return
            }
            
            if (append) {
                setOpps(prev => {
                    const map = new Map(prev.map(o => [o.id, o]))
                    for (const opp of response.data.opps) {
                        map.set(opp.id, opp)
                    }
                    return Array.from(map.values())
                })
            } else {
                setOpps(response.data.opps)
            }
        } catch (err) {
            setError(err as Error)
        } finally {
            if (page > 1) { setLoading(false) }
        }
    }

    const loadMore = async () => {
        if (!hasMore || loading || loadingMore) return
        setLoadingMore(true)
        const nextPage = page + 1
        setPage(nextPage)
        await fetchOpps(nextPage, true)
        setLoadingMore(false)
    }

    const moveToTop = (opp: Opps) => {
        setOpps(prev => {
            const filtered = prev.filter(o => o.id !== opp.id)
            return [opp, ...filtered]
        })
        //console.log("clicked moveToTop", opps)
    }

    const incrementCommentCount = (oppId: number) => {
        setOpps(prev => 
            prev.map(o => 
                o.id === oppId ?
                { ...o, _count: { ...o._count, comments: o._count.comments + 1 } }: o
            )
        )
    }

    useEffect(() => {
        fetchOpps(1, false)
    }, [])

    return { opps, setOpps, loading, error, refetch: () => {
        setPage(1)
        setHasMore(true)
        fetchOpps(1, false)
        }, moveToTop, incrementCommentCount, loadMore, hasMore, loadingMore }
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

// just delay given task
export function useDebounce(value: string, delay: number = 400) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebounced(value)
        }, delay)

      return () => clearTimeout(handler)
    }, [value, delay])

    return debounced
}
