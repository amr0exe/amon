
import { useState, createContext, type ReactNode } from "react";

const UserContext = createContext<any | undefined>(undefined)

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
    const [username, setUsername] = useState("")

    const value: any = { username, setUsername}

    return <UserContext.Provider value={value}>
        {children}
    </UserContext.Provider>
}

export default UserContext
//TODO: type for whole context