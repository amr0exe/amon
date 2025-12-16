import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearActiveUser, getActiveUser, setActiveUser } from "../service/db";

type User = {
    username: string
}

type AuthState = 
    | { status: "loading" }
    | { status: "unauthenticated" }
    | { status: "authenticated"; user: User }

type AuthContextType = {
    auth: AuthState
    login: (user: User) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType|undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>({ status: "loading" })
    const navigate = useNavigate()

    useEffect(() => {
        ;(async () => {
            const active_user = await getActiveUser()
            if (active_user) {
                setAuth({ status: "authenticated", user: { username: active_user }})
            } else {
                setAuth({ status: "unauthenticated" })
                navigate("/auth", { replace: true })
            }
        })()
    }, [])

    const login = async (user: User) => {
        setAuth({ status: "authenticated", user })
        await setActiveUser(user.username)
    }

    const logout = async () => {
        setAuth({ status: "unauthenticated" })
        await clearActiveUser()
        navigate("/auth", { replace: true })
    }

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if(!ctx) throw new Error("useAuth must be inside AuthProvider")
    return ctx
}
