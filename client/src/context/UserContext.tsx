
import { useState, createContext, useContext, type ReactNode } from "react";

type UserContextType = {
    username: string;
    setUsername: (username: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
    const [username, setUsername] = useState("")

    const value: UserContextType = { username, setUsername}

    return <UserContext.Provider value={value}>
        {children}
    </UserContext.Provider>
}

export function useUserContext(): UserContextType {
    const context = useContext(UserContext)

    if (!context) {
        throw new Error ("Check UserContext Provider ...")
    }

    return context
}

export default UserContext