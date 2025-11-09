import React, { useState, useEffect, createContext, useCallback } from 'react';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Reports from './pages/Reports';

export const AppContext = createContext();

function App() {
    const [page, setPage] = useState('login');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1) || (isAuthenticated ? 'dashboard' : 'login');
            setPage(hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [isAuthenticated]);

    const renderPage = useCallback(() => {
        if (!isAuthenticated) {
            switch (page) {
                case 'register': return <Register />;
                case 'login':
                default: return <Login />;
            }
        }
        
        switch (page) {
            case 'reports': return <Reports />;
            case 'dashboard':
            default: return <Dashboard />;
        }
    }, [page, isAuthenticated]);

    return (
        <AppContext.Provider value={{ page, setPage, isAuthenticated, setIsAuthenticated }}>
            
            {isAuthenticated ? (
                <AppLayout>
                    {renderPage()}
                </AppLayout>
            ) : (
                <AuthLayout>
                    {renderPage()}
                </AuthLayout>
            )}
        </AppContext.Provider>
    );
}

export default App;
