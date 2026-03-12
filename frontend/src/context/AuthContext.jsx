/* Auth Context — manages user auth state across the app */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const skipVerify = useRef(false);

    useEffect(() => {
        // If login/signup already set the user, skip verification
        if (skipVerify.current) {
            skipVerify.current = false;
            setLoading(false);
            return;
        }

        if (token) {
            authAPI.getMe()
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { access_token, user: userData } = res.data;
        localStorage.setItem('token', access_token);
        skipVerify.current = true;
        setUser(userData);
        setToken(access_token);
        setLoading(false);
        return userData;
    };

    const signup = async (username, email, password, fullName) => {
        const res = await authAPI.signup({ username, email, password, full_name: fullName });
        const { access_token, user: userData } = res.data;
        localStorage.setItem('token', access_token);
        skipVerify.current = true;
        setUser(userData);
        setToken(access_token);
        setLoading(false);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!user && !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

