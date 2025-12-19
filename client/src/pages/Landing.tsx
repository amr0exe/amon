import React, { useEffect, useState } from "react"
import axios from "axios"

import { useOpps, postComment, type CommentR, useDebounce, type Opps } from "../service/opps"
import LoadingPage from "./Loading"
import ErrorPage from "./Error"
import Overlay from "./components/Overlay"
import { formatDate } from "../service/utils"
import { generateNonce, getActiveUser, hashToBase64, signTheOpp } from "../service/db"
import { useUserContext } from "../context/UserContext"
import { useAuth } from "../context/AuthContext"

function Landing() {
    const ctx = useUserContext()
    const { username, setUsername } = ctx

    const { opps, moveToTop, loading, error, refetch, incrementCommentCount, loadMore, loadingMore, hasMore } = useOpps(username)
    const { logout } = useAuth()

    const [pageMap, setPageMap] = useState<Record<number, number>>({}) // oppId -> pageNo
    const [commentsMap, setCommentsMap] = useState<Record<number, Array<CommentR>>>({})
    const [commentsHasMore, setCommentsHasMore] = useState<Record<number, boolean>>({}) // for handling comments pagination

    // overlay
    const [isOpen, setIsOpen] = useState(false)
    const [content, setContent] = useState("")
    const [openOppId, setOpenOppId] = useState<number|null>(null)

    // search-bar
    const [suggestions, setSuggestions] = useState<Opps[]>([])
    const [isSgDisplayed, setIsSgDisplayed] = useState(false)
    const [query, setQuery] = useState("")
    const debouncedQuery = useDebounce(query, 500)

    // loader
    //const [gotSearch, setGotSearch] = useState(false)

    // highlight selected Opp
    const [hgOpp, setHgOpp] = useState<number|null>(null)
    
    // settings options
    const [showSetting, setShowSetting] = useState(false)

    const handleComments = async (oppId: number) => {
        if (commentsHasMore[oppId] === false) {
            console.log("No more comments to load!!!")
            return
        }

        const currentPage = pageMap[oppId] ?? 1 // returns page_no if not defaults_to_1

        try {
            const req_type = "GET"
            const nonce = generateNonce()
            const sig_str = `${req_type}${nonce}${username}`
            const sig_hash = hashToBase64(sig_str)
            const signed_hash = await signTheOpp(username, sig_hash)

            const resp = await axios.get(`http://localhost:3000/opp/${oppId}/comments?page=${currentPage}`,
                {
                    headers: {
                        'x-nonce': nonce,
                        'x-nickname': username,
                        'x-sig': signed_hash
                    }
                })
            setCommentsMap(prev => ({ ...prev, [oppId]: resp.data.comments }))

            // update hasMore for this specific Opp
            setCommentsHasMore(prev => ({ ...prev, [oppId]: resp.data.hasMore }))

            if (resp.data.hasMore) {
                setPageMap(prev => ({ ...prev, [oppId]: currentPage + 1 }))
            } else {
                console.log("End of records ...")
            }
        } catch (err) {
            console.log("Failed to fetch comments ...", err)
        }
    }

    useEffect(() => {
        if (!debouncedQuery) {
            setSuggestions([])
            return
        }

        const fetchOpps = async () => {
            //setGotSearch(false)

            const results = await axios.get(`http://localhost:3000/search?q=${debouncedQuery}`) 
            setSuggestions(results.data)

            //setGotSearch(true)
        }
        fetchOpps()
        console.log("Searching for ..", debouncedQuery)
        
    }, [debouncedQuery])

    useEffect(() => {
        const restoreUser = async () => {
            const a_user = await getActiveUser()
            if (a_user) setUsername(a_user)
        }
        if (!username) restoreUser()
    }, [])

    useEffect(() => {
        if (hgOpp === null) return

        const handler = setTimeout(() => {
            setHgOpp(null)
        }, 2000)

        return () => clearTimeout(handler)
    }, [hgOpp])


    if (loading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <LoadingPage />
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-screen flex justify-center items-center">
                <ErrorPage />
            </div>
        )
    }
    
    return <div className="min-h-screen flex font-mono flex-col overflow-x-hidden">

        {/* Overlay */}
        {isOpen && (
            <Overlay
                onClose={() => setIsOpen(false)}
                username={username}
                onSuccess={refetch}
            ></Overlay>
        )}


        {/* Navbar */}
        <div className="w-full flex justify-between items-center p-3 px-4 sm:p-5 sm:px-12 lg:px-20 border-b border-slate-500">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tighter bg-linear-to-r from-slate-400 to-cyan-200 bg-clip-text text-transparent shrink-0">amon</h1>

            <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
                {/* Search-bar */}
                <div
                    className="relative w-32 sm:w-48 md:w-64"
                    tabIndex={0}
                    onFocus={() => setIsSgDisplayed(true)}
                    onBlur={() => setIsSgDisplayed(false)}>
                    <input
                        value={query}
                        type="text"
                        placeholder="Search ..."
                        className="w-full px-2 py-1 text-xs sm:text-sm border-0 border-b border-black focus:outline-none"
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {isSgDisplayed && suggestions.length > 0 &&
                        <div className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg rounded z-50 max-h-60 overflow-y-auto">
                            {suggestions.map((s) => (
                                <p
                                    key={s.id}
                                    className="border-b px-2 py-2 hover:bg-gray-100 cursor-pointer text-xs sm:text-sm"
                                    onMouseDown={() => {
                                        moveToTop(s)
                                        setHgOpp(s.id)
                                        setQuery("")
                                    }}
                                >{s.opinion}</p>))}
                        </div>
                    }
                </div>
                <button
                    className="px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm whitespace-nowrap bg-cyan-600 text-white rounded-md hover:scale-110 transform transition-transform duration-200 ease-in-out"
                    onClick={() => setIsOpen(true)}
                >Create</button>

                {/* User Profile */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black border-2 sm:border-4 rounded-full shrink-0 flex items-center justify-center relative">
                    <p
                        tabIndex={0}
                        className="text-purple-500 text-3xl font-semibold cursor-pointer"
                        onClick={() => setShowSetting(prev => !prev)}
                        onBlur={() => setShowSetting(prev => !prev)}
                    >p</p>

                    {/* Options */}
                    {showSetting && 
                        <div className="absolute top-full right-0 mt-2 border bg-white shadow-lg p-2 rounded-sm min-w-32 z-50">
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-400 rounded">Profile</button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-400 rounded">Works</button>
                            <button className="w-full text-left px-3 py-2 hover:bg-red-500 rounded cursor-pointer" onMouseDown={logout}>LogOut</button>
                        </div>
                    }
                </div>
            </div>
        </div>

        {/* Opps */}

        <div
            className="w-full px-4 sm:px-6 md:w-5/6 lg:w-3/4 mx-auto flex flex-col gap-3 items-center mt-5 pb-8 overflow-x-hidden"
        >
            {opps.map((e) => (
                <React.Fragment key={e.id}>
                    {/* Opps part */}
                    <div
                        className={`w-full min-h-20 rounded-sm border px-4 sm:px-8 md:px-14 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 
                        ${hgOpp === e.id ?
                                "bg-slate-200 duration-400 ease-in-out" :
                                "bg-white duration-300 ease-in-out"}`
                        }
                    >
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl tracking-tighter wrap-break-word flex-1 pr-2">{e.opinion}</p>

                        <div className="text-xs sm:text-sm flex flex-col gap-1 sm:gap-2 font-normal tracking-tighter shrink-0 items-end">
                            <span className="text-slate-600 text-right">{formatDate(e.createdAt)}</span>
                            <span className="flex items-center gap-2 flex-wrap justify-end">
                                <span className="whitespace-nowrap">{e._count.comments} discussions</span>
                                <button
                                    className="bg-cyan-600 px-2 py-1 rounded-sm text-white text-xs sm:text-sm cursor-pointer hover:scale-110 transform transition-transform duration-100 ease-in-out whitespace-nowrap"
                                    onClick={() => {
                                        const isClosing = openOppId === e.id;

                                        if (isClosing) {
                                            setOpenOppId(null);
                                            setPageMap(prev => ({ ...prev, [e.id]: 1 }));
                                            setCommentsMap(prev => ({ ...prev, [e.id]: [] }))
                                            setCommentsHasMore(prev => ({ ...prev, [e.id]: true }))
                                        } else {
                                            setOpenOppId(e.id)
                                            handleComments(e.id)
                                        }
                                    }}
                                >add_To</button>
                            </span>
                        </div>
                    </div>

                    {/* Collapsible comments panel */}
                    <div
                        className={`w-full overflow-hidden transition-all duration-300 ${openOppId === e.id ? 'max-h-96 py-4' : 'max-h-0 pointer-events-none opacity-0'}`}
                    >
                        <div className="w-full gap-2 sm:gap-5 mb-4 flex items-center">
                            <input
                                type="text"
                                placeholder="write your comment ..."
                                className="flex-1 border p-2 sm:p-3 text-xs sm:text-sm rounded"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}

                            />
                            <button
                                className="cursor-pointer px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap bg-cyan-600 text-white rounded-md hover:scale-110 transform transition-transform duration-200 ease-in-out"
                                onClick={async () => {
                                    await postComment(username, e.id, content)
                                    setContent("")
                                    // reset hasMore, for this comment
                                    setCommentsHasMore(prev => ({ ...prev, [e.id]: true }))
                                    setPageMap(prev => ({ ...prev, [e.id]: 1 }))
                                    await handleComments(e.id)
                                    incrementCommentCount(e.id)
                                }}
                            >post</button>
                        </div>
                        <div className="flex flex-col items-end gap-3 max-h-60 sm:max-h-80 overflow-auto">
                            {(!commentsMap[e.id] || commentsMap[e.id].length === 0) ? (
                                <p className="text-xs sm:text-sm text-slate-500 text-right border rounded p-3 sm:p-4 w-full">No discussions Yet !!!</p>
                            ) : (
                                commentsMap[e.id].map((c: any, idx: number) => (
                                    <div key={c.id ?? idx} className="bg-white border rounded p-3 sm:p-4 w-full">
                                        <p className="text-xs sm:text-sm text-right wrap-break-word">{c.content}</p>
                                        <p className="text-xs text-slate-400 text-right">{formatDate(c.createdAt)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <p
                            className={`text-cyan-600 cursor-pointer text-center mt-3 text-sm sm:text-base font-semibold ${e._count.comments === 0 ? "hidden" : ""}`}
                            onClick={() => handleComments(e.id)}
                        >
                            {commentsHasMore[e.id] === false ? "No More comments" : "Load more ..."}
                        </p>
                    </div>
                </React.Fragment>
            ))}

            <button
                className={`${loadingMore ? "text-slate-400" : "text-cyan-600"} cursor-pointer text-center mt-3 text-sm sm:text-base font-semibold`}
                onClick={loadMore}
                disabled={loading}
            >
                {loadingMore ? "Loading ..." : (hasMore ? "Load More Opps ..." : "No More Opps !!!")}
            </button>

        </div>

    </div>

}

export default Landing
