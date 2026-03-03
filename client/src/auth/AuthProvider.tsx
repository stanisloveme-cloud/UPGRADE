import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Ensure the browser automatically attaches the secure HttpOnly session cookie
axios.defaults.withCredentials = true;

interface AuthContextType {
    user: any;
    login: (userData: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                // Excluded from /api prefix in main.ts
                const response = await axios.get('/auth/profile');
                if (response.data) {
                    setUser(response.data);
                }
            } catch (error) {
                // Session expired or missing
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = (userData: any) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await axios.post('/auth/logout');
        } catch (e) {
            console.error(e);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {/* Delay rendering tree until session check finishes to prevent unauthenticated flashes */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
