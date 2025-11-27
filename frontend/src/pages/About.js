import React from 'react';

const About = () => {
    return (
        <div className="container" style={{ padding: '8rem 0 4rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>About Us</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
                    Signify was born from a simple idea: signing documents shouldn't be a hassle. We believe in making digital workflows accessible, secure, and efficient for everyone.
                </p>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
                    Our mission is to empower individuals and businesses to go paperless without compromising on security or legality. Whether you're a freelancer signing a contract or a large enterprise managing thousands of documents, Signify is built for you.
                </p>

                <h2 style={{ fontSize: '2rem', marginTop: '4rem', marginBottom: '1.5rem' }}>Our Values</h2>
                <ul style={{ listStyle: 'none', display: 'grid', gap: '1.5rem' }}>
                    <li style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                        <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem', color: '#4a00e0' }}>Simplicity</strong>
                        We design for humans, not robots. Our interface is intuitive and easy to use.
                    </li>
                    <li style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                        <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem', color: '#4a00e0' }}>Security</strong>
                        Your data is sacred. We use top-tier encryption to keep it safe.
                    </li>
                    <li style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                        <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem', color: '#4a00e0' }}>Speed</strong>
                        Time is money. We help you save both by streamlining your workflow.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default About;
