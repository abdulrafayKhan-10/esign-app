import React from 'react';
import SEO from '../components/SEO';

const TermsOfService = () => {
    return (
        <div className="container" style={{ padding: '8rem 0 4rem' }}>
            <SEO
                title="Terms of Service"
                description="Read our Terms of Service to understand the rules and regulations for using Signify."
            />
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Terms of Service</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Last updated: November 27, 2025</p>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        By accessing or using Signify, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>2. Usage Limits</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        - **Guest Users**: Limited to 3 document signs per day. Files are stored for 24 hours.<br />
                        - **Registered Users**: Unlimited signing. Files are stored securely until deleted by the user.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>3. Prohibited Activities</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        You agree not to use Signify for any unlawful purpose or to upload any content that is illegal, offensive, or violates the rights of others.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>4. Disclaimer</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Signify is provided "as is" without any warranties. We are not responsible for any legal disputes arising from the use of our digital signatures. Please consult a legal professional for specific advice.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;
