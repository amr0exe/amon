import React, { useEffect, useState } from "react"
import axios from "axios"

import { useOpps, postComment, type CommentR, useDebounce, type Opps } from "../service/opps"
import LoadingPage from "./Loading"
import ErrorPage from "./Error"
import Overlay from "./components/Overlay"
import { formatDate } from "../service/utils"
import { generateNonce, getActiveUser, hashToBase64, signTheOpp } from "../service/db"
import { useUserContext } from "../context/UserContext"

function Landing() {
    const ctx = useUserContext()
    const { username, setUsername } = ctx

    const { opps, moveToTop, loading, error, refetch } = useOpps(username)

    const [pageMap, setPageMap] = useState<Record<number, number>>({})
    const [commentsMap, setCommentsMap] = useState<Record<number, Array<CommentR>>>({})

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

    const handleComments = async (oppId: number) => {
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
    
    return <div className="h-screen flex font-mono flex-col">

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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tighter bg-linear-to-r from-slate-400 to-cyan-200 bg-clip-text text-transparent">amon</h1>

            <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
                {/* Search-bar */}
                <div className="relative w-md" tabIndex={0} onFocus={() => setIsSgDisplayed(true)} onBlur={() => setIsSgDisplayed(false)}>
                    <input 
                        value={query}
                        type="text" 
                        placeholder="Search for Opps ..."
                        className="w-full px-2 py-1 border-0 border-b border-black focus:outline-none"
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {isSgDisplayed && 
                        <div className="absolute top-full left-0 w-full mt-1 bg-white shadow-amber-300">
                            {suggestions.map((s, idx) => (
                                <p key={idx} className="border-b px-2 py-1 mt-1 cursor-pointer" onMouseDown={() => moveToTop(s)}>{s.opinion}</p>))}
                        </div>
                    }
                    {/* loader_for_future_reference
                    {isSgDisplayed && !gotSearch && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white shadow-md rounded">
                            {Array(4).fill(0).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="border-b px-2 py-2 mt-1 bg-slate-300 rounded animate-pulse"
                                    style={{ minHeight: "2.5rem" }} // matches the height of your actual search result item
                                />
                            ))}
                        </div>
                    )}*/}
                    
                </div>
                <button
                    className="px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base bg-cyan-600 text-white rounded-md hover:scale-110 transform transition-transform duration-200 ease-in-out"
                    onClick={() => setIsOpen(true)}
                >Create</button>

                {/* User Profile */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black border-4 sm:border-4 rounded-full"/>
            </div>
        </div>

        {/* Opps */}

        <div
            className="w-full px-4 sm:w-11/12 md:w-5/6 lg:w-3/4 mx-auto flex flex-col gap-3 items-center mt-5 pb-8"
        >
            <div
                className="w-10/12 h-20 border pt-6 pl-10"
            >This ain't right !!!</div>

            {opps.map((e) => (
                <React.Fragment key={e.id}>
                    {/* Opps part */}
                    <div
                        className="w-full sm:w-11/12 md:w-10/12 min-h-20 rounded-sm border px-4 sm:px-8 md:px-14 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0"
                    >
                        <p className="text-md sm:text-lg md:text-xl tracking-tighter wrap-break-words">{e.opinion}</p>

                        <div className="text-xs sm:text-sm flex flex-col gap-1 sm:gap-2 font-normal tracking-tighter shrink-0">
                            <span className="text-slate-600">{formatDate(e.createdAt)}</span>
                            <span className="flex items-center gap-2 flex-wrap">
                                {e._count.comments} discussions
                                <button
                                    className="bg-cyan-600 px-2 py-1 rounded-sm text-white text-xs sm:text-sm cursor-pointer hover:scale-110 transform transition-transform duration-100 ease-in-out"
                                    onClick={() => {
                                        const isClosing = openOppId === e.id; // check for if we're closing THIS opp's panel
                                        // when openOppId(which is currently opened opps panel) equals currently worked upon record e.id
                                        // togglling it is changing from opened -> close

                                        if (isClosing) {
                                            // Closing:
                                            setOpenOppId(null);                                     // null, to close panel, max-h-0
                                            setPageMap(prev => ({ ...prev, [e.id]: 1 }));       // reset pageMap to initial(1)
                                            setCommentsMap(prev => ({ ...prev, [e.id]: []}))    // clear comments memory
                                        } else {
                                            // Opening:
                                            setOpenOppId(e.id)      // setting openOppId from null(default) -> some_value(e.id), Marks it as open
                                            handleComments(e.id)    // fetch, page 1 comment records
                                        }
                                    }}
                                >add_To</button>
                            </span>
                        </div>
                    </div>

                    {/* Collapsible comments panel */}
                    <div
                        className={`w-full sm:w-11/12 md:w-5/6 lg:w-3/4 ml-auto overflow-hidden transition-all duration-300 ${openOppId === e.id ? 'max-h-96 py-4' : 'max-h-0 pointer-events-none opacity-0'}`}
                    >
                        <div className="w-full gap-5 mb-4 flex items-center">
                            <input
                                type="text"
                                placeholder="write your comment ..."
                                className="w-11/12 border p-3 text-xs sm:p-4 max-h-60 sm:max-h-80 rounded"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}

                            />
                            <button
                                className="cursor-pointer px-4 py-2 sm:px-3 sm:py-2 text-sm sm:text-base bg-cyan-600 text-white rounded-md hover:scale-110 transform transition-transform duration-200 ease-in-out"
                                onClick={async () => {
                                    await postComment(username, e.id, content)
                                    setContent("")
                                    await handleComments(e.id)
                                    await refetch()
                                }}
                            >post</button>
                        </div>
                        <div className="flex flex-col items-end gap-3 max-h-60 sm:max-h-80 overflow-auto">
                            {(!commentsMap[e.id] || commentsMap[e.id].length === 0) ?  (
                                <p className="text-xs sm:text-sm text-slate-500 text-right border rounded p-3 sm:p-4 w-full">No discussions Yet !!!</p>
                            ) : (
                                commentsMap[e.id].map((c: any, idx: number) => (
                                    <div key={c.id ?? idx} className="bg-white border rounded p-3 sm:p-4 w-full">
                                        <p className="text-xs sm:text-sm text-right">{c.content}</p>
                                        <p className="text-xs text-slate-400 text-right">{formatDate(c.createdAt)}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <p
                            className={`text-cyan-600 cursor-pointer text-center mt-3 text-lg font-semibold ${e._count.comments === 0  ? "hidden" : ""}`}
                            onClick={() => handleComments(e.id)}
                        >Load more...</p>
                    </div>
                </React.Fragment>
            ))}

        </div>

    </div>
}

export default Landing
