
import React from 'react';

const AuthLayout = ({ children }) => (
    <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {children}
    </div>
);

export default AuthLayout;
