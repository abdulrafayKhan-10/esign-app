import React from 'react';
import SEO from '../components/SEO';
import { FaShieldAlt, FaFileSignature, FaBolt, FaMagic, FaHistory, FaCloudUploadAlt } from 'react-icons/fa';

const Features = () => {
    return (
        <div className="container" style={{ padding: '8rem 0 4rem' }}>
            <SEO
                title="Features"
                description="Explore the powerful features of Signify. Secure, fast, and legally binding electronic signatures."
            />
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Powerful Features</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Everything you need to manage your documents efficiently.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <FeatureCard
                    icon={<FaBolt />}
                    title="Lightning Fast"
                    desc="Sign documents in seconds. Our optimized workflow ensures you spend less time on paperwork."
                />
                <FeatureCard
                    icon={<FaShieldAlt />}
                    title="Bank-Level Security"
                    desc="Your data is protected with 256-bit SSL encryption. We prioritize your privacy and security."
                />
                <FeatureCard
                    icon={<FaFileSignature />}
                    title="Legally Binding"
                    desc="Signatures created with Signify are ESIGN and UETA compliant, making them legally binding."
                />
                <FeatureCard
                    icon={<FaMagic />}
                    title="Smart Placement"
                    desc="Drag and drop your signature exactly where you need it. Resize and position with precision."
                />
                <FeatureCard
                    icon={<FaHistory />}
                    title="Audit Trails"
                    desc="Track every step of the signing process. (Coming Soon for Enterprise)"
                />
                <FeatureCard
                    icon={<FaCloudUploadAlt />}
                    title="Multi-Format Support"
                    desc="Upload PDF, DOCX, and images. We support all major document formats."
                />
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="card" style={{ padding: '2rem', transition: 'transform 0.2s' }}>
        <div style={{ fontSize: '2.5rem', color: '#4a00e0', marginBottom: '1rem' }}>{icon}</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{desc}</p>
    </div>
);

export default Features;
