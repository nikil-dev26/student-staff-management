import {
    createContext,
    useEffect,
    useState
} from "react";

import { loginUser } from "../services/authService";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (loginData) => {

        const data = await loginUser(loginData);

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.data)
        );

        setToken(data.token);
        setUser(data.data);

        return data;
    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };

    useEffect(() => {

        const storedToken =
            localStorage.getItem("token");

        const storedUser =
            localStorage.getItem("user");

        if (storedToken && storedUser) {

            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
            catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }

        setLoading(false);

    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                setUser,
                setToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;