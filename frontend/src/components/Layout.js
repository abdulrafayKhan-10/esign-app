import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    const hideFooter = location.pathname.includes('/sign/') || location.pathname.includes('/guest/sign/');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1, paddingTop: '80px' }}>
                {children}
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
};

export default Layout;
