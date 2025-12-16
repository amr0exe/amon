import { type ReactNode } from "react"
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingPage from "../pages/Loading";

type Props = {
    children: ReactNode
}

export function RequireAuth({ children }: Props) {
    const { auth } = useAuth()

    if (auth.status === "loading") {
        return <LoadingPage />
    }

    if (auth.status === "unauthenticated") {
        return <Navigate to="/auth" replace />
    }

    return <> {children} </>
}