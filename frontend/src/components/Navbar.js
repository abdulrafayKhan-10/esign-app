import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBars, FaTimes, FaPenNib } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const isHome = location.pathname === '/';

    // Premium Navbar Styles
    const navbarStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: scrolled ? '1rem 0' : '1.5rem 0',
        background: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
    };

    const linkStyle = {
        fontWeight: 500,
        color: scrolled || !isHome ? '#1f2937' : '#1f2937', // Always dark for readability unless on dark bg
        fontSize: '1.05rem',
        transition: 'color 0.2s ease',
        position: 'relative'
    };

    return (
        <>
            <nav style={navbarStyle}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)',
                            color: 'white',
                            padding: '0.6rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(74, 0, 224, 0.2)'
                        }}>
                            <FaPenNib size={20} />
                        </div>
                        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>Signify</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="desktop-menu" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                        <Link to="/" style={linkStyle}>Home</Link>
                        <Link to="/features" style={linkStyle}>Features</Link>
                        <Link to="/about" style={linkStyle}>About Us</Link>
                        <Link to="/contact" style={linkStyle}>Contact</Link>

                        {user ? (
                            <>
                                <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
                                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '1rem' }}>Logout</button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem' }}>
                                <Link to="/login" style={{ ...linkStyle, fontWeight: 600 }}>Login</Link>
                                <Link to="/register" className="btn-primary" style={{
                                    padding: '0.7rem 1.8rem',
                                    borderRadius: '50px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 15px rgba(74, 0, 224, 0.3)'
                                }}>
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="mobile-toggle" style={{ display: 'none' }}>
                        <button onClick={() => setIsOpen(true)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#1f2937' }}>
                            <FaBars />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: isOpen ? 0 : '-100%',
                width: '300px',
                height: '100vh',
                background: 'white',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                zIndex: 1001,
                transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>Menu</span>
                    <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>
                        <FaTimes />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.1rem' }}>
                    <Link to="/" onClick={() => setIsOpen(false)} style={{ fontWeight: 500, color: '#374151' }}>Home</Link>
                    <Link to="/features" onClick={() => setIsOpen(false)} style={{ fontWeight: 500, color: '#374151' }}>Features</Link>
                    <Link to="/about" onClick={() => setIsOpen(false)} style={{ fontWeight: 500, color: '#374151' }}>About Us</Link>
                    <Link to="/contact" onClick={() => setIsOpen(false)} style={{ fontWeight: 500, color: '#374151' }}>Contact</Link>
                    <div style={{ height: '1px', background: '#e5e7eb', margin: '0.5rem 0' }}></div>
                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{ fontWeight: 500, color: '#374151' }}>Dashboard</Link>
                            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.8rem', width: '100%', justifyContent: 'center' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setIsOpen(false)} style={{ fontWeight: 500, color: '#374151' }}>Login</Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary" style={{ padding: '0.8rem', borderRadius: '12px', textAlign: 'center', justifyContent: 'center' }}>Get Started Free</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.3)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000
                    }}
                />
            )}

            <style>{`
                @media (max-width: 768px) {
                    .desktop-menu {
                        display: none !important;
                    }
                    .mobile-toggle {
                        display: block !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Navbar;
