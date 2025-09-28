// 'use client'

// import { createContext, useContext, useState, ReactNode, useEffect } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";

// import { User, UserContextType } from "../types/interface";


// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const UserProvider = ({ children }: { children: ReactNode }) => {

//     const [user, setUser] = useState<User | null>(null);

//     const tokenKey = "token";

//     const refreshUser = async () => {
//         const token = Cookies.get(tokenKey);
//         if (!token) return setUser(null);

//         try {
//             const res = await axios.get("/api/auth/me", {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setUser(res.data.user);
//         } catch (err) {
//             console.error(err);
//             setUser(null);
//             Cookies.remove(tokenKey);
//         }
//     };

//     const login = async (email: string, password: string) => {
//         const res = await axios.post("/api/auth/login", { email, password });
//         Cookies.set(tokenKey, res.data.token, { expires: 7 }); // שומר 7 ימים
//         setUser(res.data.user);
//     };

//     const register = async (email: string, password: string, name: string) => {
//         const res = await axios.post("/api/auth/register", { email, password, name });
//         Cookies.set(tokenKey, res.data.token, { expires: 7 });
//         setUser(res.data.user);
//     };

//     const logout = () => {
//         setUser(null);
//         Cookies.remove(tokenKey);
//     };

//     useEffect(() => {
//         refreshUser();
//     }, []);

//     return (
//         <UserContext.Provider value={{ user, login, register, logout, refreshUser }}>
//             {children}
//         </UserContext.Provider>
//     );
// };

// export const useUser = () => {
//     const context = useContext(UserContext);
//     if (!context) throw new Error("useUser must be used within a UserProvider");
//     return context;
// };