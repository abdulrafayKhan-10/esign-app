import React, { useState, useEffect } from 'react';
import { FaCookieBite, FaCog, FaTimes, FaCheck } from 'react-icons/fa';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true,
        analytics: true,
        marketing: false
    });

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Show after a small delay for better UX
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem('cookie_consent', 'all');
        setIsVisible(false);
    };

    const handleSavePreferences = () => {
        localStorage.setItem('cookie_consent', JSON.stringify(preferences));
        setIsVisible(false);
        setShowSettings(false);
    };

    const togglePreference = (key) => {
        if (key === 'essential') return; // Cannot disable essential
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isVisible) return (
        <button
            onClick={() => { setIsVisible(true); setShowSettings(true); }}
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                zIndex: 9999,
                color: '#4b5563',
                transition: 'transform 0.2s'
            }}
            title="Cookie Settings"
        >
            <FaCookieBite />
        </button>
    );

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            maxWidth: '400px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            zIndex: 10000,
            overflow: 'hidden',
            border: '1px solid #f3f4f6',
            animation: 'slideUp 0.3s ease-out'
        }}>
            {!showSettings ? (
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#eff6ff', padding: '0.5rem', borderRadius: '50%', color: '#3b82f6' }}>
                            <FaCookieBite size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' }}>We use cookies</h3>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                        We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => setShowSettings(true)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                color: '#4b5563',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaCog /> Settings
                        </button>
                        <button
                            onClick={handleAcceptAll}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: '#1f2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Accept All
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' }}>Cookie Preferences</h3>
                        <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                            <FaTimes size={18} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={preferenceRowStyle}>
                            <div>
                                <div style={prefTitleStyle}>Essential</div>
                                <div style={prefDescStyle}>Required for the site to function.</div>
                            </div>
                            <div style={{ ...toggleStyle, opacity: 0.5, cursor: 'not-allowed' }}>
                                <div style={{ ...toggleKnobStyle, transform: 'translateX(20px)' }} />
                            </div>
                        </div>

                        <div style={preferenceRowStyle} onClick={() => togglePreference('analytics')}>
                            <div>
                                <div style={prefTitleStyle}>Analytics</div>
                                <div style={prefDescStyle}>Help us improve our website.</div>
                            </div>
                            <div style={{ ...toggleStyle, background: preferences.analytics ? '#4a00e0' : '#e5e7eb' }}>
                                <div style={{ ...toggleKnobStyle, transform: preferences.analytics ? 'translateX(20px)' : 'translateX(0)' }} />
                            </div>
                        </div>

                        <div style={preferenceRowStyle} onClick={() => togglePreference('marketing')}>
                            <div>
                                <div style={prefTitleStyle}>Marketing</div>
                                <div style={prefDescStyle}>Personalized advertisements.</div>
                            </div>
                            <div style={{ ...toggleStyle, background: preferences.marketing ? '#4a00e0' : '#e5e7eb' }}>
                                <div style={{ ...toggleKnobStyle, transform: preferences.marketing ? 'translateX(20px)' : 'translateX(0)' }} />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSavePreferences}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#4a00e0',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaCheck /> Save Preferences
                    </button>
                </div>
            )}
        </div>
    );
};

const preferenceRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
};

const prefTitleStyle = {
    fontWeight: 600,
    color: '#374151',
    fontSize: '0.95rem'
};

const prefDescStyle = {
    color: '#9ca3af',
    fontSize: '0.8rem'
};

const toggleStyle = {
    width: '44px',
    height: '24px',
    background: '#4a00e0',
    borderRadius: '12px',
    position: 'relative',
    transition: 'background 0.2s'
};

const toggleKnobStyle = {
    width: '20px',
    height: '20px',
    background: 'white',
    borderRadius: '50%',
    position: 'absolute',
    top: '2px',
    left: '2px',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
};

export default CookieConsent;
