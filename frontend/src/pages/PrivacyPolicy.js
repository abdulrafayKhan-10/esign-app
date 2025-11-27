import React from 'react';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
    return (
        <div className="container" style={{ padding: '8rem 0 4rem' }}>
            <SEO
                title="Privacy Policy"
                description="Read our Privacy Policy to understand how Signify collects, uses, and protects your data."
            />
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Privacy Policy</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last updated: November 27, 2025</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>1. Information We Collect</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We collect information you provide directly to us, such as when you create an account, upload documents, or contact us. This includes your name, email address, and the content of the documents you upload for signing.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>2. How We Use Your Information</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We use your information to provide, maintain, and improve our services. Specifically, we use your document data solely for the purpose of facilitating the digital signature process. We do not analyze or share the content of your documents.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>3. Data Security</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        We implement industry-standard security measures to protect your data. All documents are encrypted in transit and at rest. Guest documents are automatically deleted from our servers after 24 hours.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>4. Contact Us</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:info@worldoftech.company" style={{ color: '#4a00e0' }}>info@worldoftech.company</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
