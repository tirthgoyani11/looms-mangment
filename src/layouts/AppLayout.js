
import React from 'react';
import Navbar from '../components/Navbar';

const AppLayout = ({ children }) => (
    <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
);

export default AppLayout;
