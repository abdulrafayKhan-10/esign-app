import React from 'react';
import { Link } from 'react-router-dom';
import { FaPenNib, FaFacebook, FaLinkedin, FaInstagram, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer style={{ background: '#1f2937', color: 'white', padding: '4rem 0 2rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            <FaPenNib />
                            <span>Signify</span>
                        </div>
                        <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                            Professional document signing solution. Secure, fast, and easy to use.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><Link to="/" style={{ color: '#9ca3af' }}>Home</Link></li>
                            <li><Link to="/features" style={{ color: '#9ca3af' }}>Features</Link></li>
                            <li><Link to="/about" style={{ color: '#9ca3af' }}>About Us</Link></li>
                            <li><Link to="/contact" style={{ color: '#9ca3af' }}>Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Resources</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><Link to="/privacy" style={{ color: '#9ca3af' }}>Privacy Policy</Link></li>
                            <li><Link to="/terms" style={{ color: '#9ca3af' }}>Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Connect With Us</h4>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <a href="https://www.facebook.com/worldoftech.softwarehouse.official/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.5rem' }}><FaFacebook /></a>
                            <a href="https://pk.linkedin.com/company/world-of-tech-pvt-ltd" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.5rem' }}><FaLinkedin /></a>
                            <a href="https://www.instagram.com/world_of_tech_official/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.5rem' }}><FaInstagram /></a>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#fff' }}>World Of Tech Pvt Ltd</h5>
                            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                Empowering digital transformation through innovative solutions
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
                            <FaEnvelope />
                            <a href="mailto:info@worldoftech.company" style={{ color: '#9ca3af' }}>info@worldoftech.company</a>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #374151', paddingTop: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    <p>&copy; {new Date().getFullYear()} World Of Tech Pvt Ltd. All rights reserved.</p>
                </div>

                {/* SEO Keywords Section */}
                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #374151', textAlign: 'center', fontSize: '0.8rem', color: '#6b7280', lineHeight: '1.6' }}>
                    <p>
                        <strong>Signify</strong> - Free online document signing, digital signature creator, and secure e-sign solution.
                        Sign PDF, DOCX documents online without printing. Create electronic signatures instantly.
                        Secure document management for professionals, freelancers, and businesses.
                        Legally binding e-signatures compliant with ESIGN and UETA.
                        Streamline your workflow, reduce paper usage, and sign documents from anywhere, on any device.
                        Supports multiple file formats, audit trails, and secure storage. No account required for quick signing.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
