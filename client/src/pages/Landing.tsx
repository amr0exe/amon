import React, { useState } from "react"

import { useOpps, postComment } from "../service/opps"
import LoadingPage from "./Loading"
import ErrorPage from "./Error"
import Overlay from "./components/Overlay"
import { formatDate } from "../service/utils"

function Landing() {
	const { opps, loading, error } = useOpps()

	// overlay
	const [isOpen, setIsOpen] = useState(false)
	const [openOpenId, setOpenOppId] = useState<number | null>(null)

	if (loading) return <LoadingPage />
	if (error) return <ErrorPage />

	return <div className="h-screen flex font-mono flex-col">

		{/* Overlay */}
		{isOpen && (
			<Overlay
				onClose={() => setIsOpen(false)}
			></Overlay>
		)}


		{/* Navbar */}
		<div className="w-screen flex justify-between items-center p-3 px-4 sm:p-5 sm:px-12 lg:px-20 border-b border-slate-500">
			<h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tighter bg-linear-to-r from-slate-400 to-cyan-200 bg-clip-text text-transparent">amon</h1>

			<div className="flex items-center gap-2 sm:gap-4 md:gap-6">
				<button
					className="px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base bg-cyan-600 text-white rounded-md hover:scale-110 transform transition-transform duration-200 ease-in-out"
					onClick={() => setIsOpen(true)}
				>Create</button>

				<div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black border-2 sm:border-4 rounded-full"/>
			</div>
		</div>

		{/* Opps */}

		<div
			className="w-full px-4 sm:w-11/12 md:w-5/6 lg:w-3/4 mx-auto flex flex-col gap-3 items-center mt-5 pb-8"
		>
			{/* Opps-bar */}
			{/* <div
				className="w-10/12 h-20 bg-linear-to-r from-cyan-100 to-slate-200 rounded-md pt-6 pl-10 font-semibold text-2xl text-cyan-900 tracking-tighter"
			>This ain't right !!!</div>

			<div
				className="w-10/12 h-20 bg-linear-to-r from-cyan-100 to-slate-200 rounded-md pt-6 pl-10 font-semibold text-2xl text-cyan-900 tracking-tighter"
			>This ain't right !!!</div>

			<div
				className="w-10/12 h-20 bg-linear-to-r from-cyan-100 to-slate-200 rounded-md pt-6 pl-10 font-semibold text-2xl text-cyan-900 tracking-tighter"
			>This ain't right !!!</div>

			<div
				className="w-10/12 h-20 bg-cyan-200 rounded-md px-14 font-semibold text-2xl text-cyan-900 tracking-tighter flex justify-between items-center"
			>
				<p>This ain't right !!!</p>

				<div className="text-sm flex flex-col gap-1 font-normal">
					<span>23rd march, 2025</span>
					<span>32 Discussions</span>
				</div>
			</div> */}

			<div
				className="w-10/12 h-20 border pt-6 pl-10"
			>This ain't right !!!</div>

			{opps.map((e) => (
				<React.Fragment key={e.id}>
					{/* Opps part */}
					<div
						className="w-full sm:w-11/12 md:w-10/12 min-h-20 rounded-sm border px-4 sm:px-8 md:px-14 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0"
					>
						<p className="text-lg sm:text-xl md:text2xl tracking-tighter wrap-break-words">{e.opinion}</p>

						<div className="text-xs sm:text-sm flex flex-col gap-1 sm:gap-2 font-normal tracking-tighter shrink-0">
							<span className="text-slate-600">{formatDate(e.createdAt)}</span>
							<span className="flex items-center gap-2 flex-wrap">
								{e.comments.length} discussions
								<button
									className="bg-cyan-600 px-2 py-1 rounded-sm text-white text-xs sm:text-sm cursor-pointer hover:scale-110 transform transition-transform duration-100 ease-in-out"
									onClick={() => setOpenOppId(openOpenId === e.id ? null : e.id)} // assuming if there ain't put it, if there is then null, kinda like toggle
								>add_To</button>
							</span>
						</div>
					</div>

					{/* Collapsible comments panel */}
					<div
						className={`w-full sm:w-11/12 md:w-5/6 lg:w-3/4 ml-auto overflow-hidden transition-all duration-300 ${openOpenId === e.id ? 'max-h-96 py-4' : 'max-h-0 pointer-events-none opacity-0'}`}

					>
						<div className="bg-white border rounded p-3 sm:p-4 flex flex-col items-end max-h-60 sm:max-h-80 overflow-auto">
							{e.comments.length === 0 ?  (
								<p className="text-xs sm:text-sm text-slate-500 text-right">No discussions Yet !!!</p>
							) : (
								e.comments.map((c: any, idx: number) => (
									<div key={c.id ?? idx} className="border-b last:border-b-0 py-2 w-full">
										<p className="text-xs sm:text-sm text-right">{c.content}</p>
										<p className="text-xs text-slate-400 text-right">{formatDate(c.createdAt)}</p>
									</div>
								))
							)}
						</div>
					</div>
				</React.Fragment>
			))}

		</div>

	</div>
}

export default Landing
