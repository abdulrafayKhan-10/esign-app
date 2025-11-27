import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaFileSignature, FaShieldAlt, FaBolt, FaPenNib } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div>
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
                padding: '12rem 0 8rem',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center'
            }}>
                {/* Abstract Background Shapes */}
                <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(74,0,224,0.08) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(142,45,226,0.08) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

                    {/* Left Content */}
                    <div style={{ textAlign: 'left' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span style={{
                                display: 'inline-block',
                                padding: '0.5rem 1rem',
                                background: 'rgba(74, 0, 224, 0.1)',
                                color: '#4a00e0',
                                borderRadius: '50px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                marginBottom: '1.5rem'
                            }}>
                                #1 Free Online Signature Tool
                            </span>
                            <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, color: '#111827', letterSpacing: '-1px' }}>
                                Sign Documents <br />
                                <span style={{ background: 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Faster & Securely</span>
                            </h1>
                            <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2.5rem', maxWidth: '550px', lineHeight: 1.6 }}>
                                The easiest way to sign and manage your documents online. No credit card required. Legally binding and secure.
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <Link to="/guest/upload" className="btn-primary" style={{
                                    fontSize: '1.1rem',
                                    padding: '1rem 2.5rem',
                                    borderRadius: '50px',
                                    boxShadow: '0 10px 25px -5px rgba(74, 0, 224, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <FaFileSignature /> Sign Document Now
                                </Link>
                                <Link to="/register" style={{ fontSize: '1.1rem', padding: '1rem 2rem', color: '#4b5563', fontWeight: 600, textDecoration: 'none' }}>
                                    Create Account
                                </Link>
                            </div>

                            <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCheckCircle color="#10b981" /> Free Forever</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCheckCircle color="#10b981" /> No Login Required</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCheckCircle color="#10b981" /> Secure & Private</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Visual - CSS Document Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ position: 'relative', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {/* Floating Document Card */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            style={{
                                width: '380px',
                                height: '500px',
                                background: 'white',
                                borderRadius: '20px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                padding: '2rem',
                                position: 'relative',
                                zIndex: 2,
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}
                        >
                            {/* Document Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f3f4f6' }}></div>
                                <div style={{ width: '100px', height: '10px', background: '#f3f4f6', borderRadius: '5px', alignSelf: 'center' }}></div>
                            </div>

                            {/* Document Lines */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                                <div style={{ width: '90%', height: '8px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                                <div style={{ width: '95%', height: '8px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                                <div style={{ width: '80%', height: '8px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                                <div style={{ width: '85%', height: '8px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                                <div style={{ width: '90%', height: '8px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                            </div>

                            {/* Signature Area */}
                            <div style={{ marginTop: '3rem', padding: '1rem', border: '2px dashed #4a00e0', borderRadius: '10px', background: 'rgba(74, 0, 224, 0.02)', position: 'relative' }}>
                                <div style={{ fontSize: '0.8rem', color: '#4a00e0', fontWeight: 600, marginBottom: '0.5rem' }}>Signature Required</div>
                                <motion.div
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 2, delay: 1, repeat: Infinity, repeatDelay: 3 }}
                                    style={{ fontFamily: 'cursive', fontSize: '1.5rem', color: '#1f2937' }}
                                >
                                    John Doe
                                </motion.div>
                                <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', background: '#4a00e0', color: 'white', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 4px 10px rgba(74,0,224,0.3)' }}>
                                    <FaPenNib size={12} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Background Decorative Card */}
                        <div style={{
                            position: 'absolute',
                            top: '40px',
                            right: '20px',
                            width: '380px',
                            height: '500px',
                            background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                            borderRadius: '20px',
                            transform: 'rotate(5deg)',
                            opacity: 0.4,
                            zIndex: 1
                        }}></div>
                    </motion.div>
                </div>
            </section>



            {/* Features Section */}
            <section style={{ padding: '8rem 0', background: 'white' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1f2937' }}>Why Choose Signify?</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>Everything you need to manage your digital signatures securely and efficiently.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                        <FeatureCard
                            icon={<FaBolt />}
                            title="Lightning Fast"
                            desc="Upload, sign, and download in seconds. Our optimized workflow ensures you spend less time on paperwork."
                        />
                        <FeatureCard
                            icon={<FaShieldAlt />}
                            title="Bank-Level Security"
                            desc="Your data is protected with 256-bit SSL encryption. We prioritize your privacy and security above all else."
                        />
                        <FeatureCard
                            icon={<FaFileSignature />}
                            title="Legally Binding"
                            desc="Signatures created with Signify are ESIGN and UETA compliant, making them legally binding in court."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ padding: '8rem 0', background: '#f3f4f6' }}>
                <div className="container">
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: '5rem', color: '#1f2937' }}>How It Works</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem', maxWidth: '900px', margin: '0 auto' }}>
                        <Step
                            num="01"
                            title="Upload Document"
                            desc="Drag and drop your PDF file. We support all standard PDF formats and ensure your document formatting stays intact."
                            align="left"
                        />
                        <Step
                            num="02"
                            title="Create Signature"
                            desc="Draw your signature with your mouse, type it with a variety of fonts, or upload an image of your wet signature."
                            align="right"
                        />
                        <Step
                            num="03"
                            title="Sign & Download"
                            desc="Place your signature exactly where you want it, resize if needed, and download the signed PDF instantly."
                            align="left"
                        />
                    </div>
                </div>
            </section>



            {/* FAQ */}
            <section style={{ padding: '8rem 0', background: '#f9fafb' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: '4rem', color: '#1f2937' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <FAQItem q="Is it really free?" a="Yes! You can sign documents for free as a guest. We also offer premium plans for power users who need advanced features." />
                        <FAQItem q="Is it secure?" a="Absolutely. We use industry-standard SSL encryption. Guest documents are automatically deleted from our servers after 24 hours for your privacy." />
                        <FAQItem q="Can I use it on mobile?" a="Yes, Signify is fully responsive and works great on all smartphones and tablets, so you can sign on the go." />
                        <FAQItem q="What file formats are supported?" a="We currently support PDF files, which is the standard for digital documents. We are working on adding support for Word documents soon." />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '6rem 0', background: 'var(--primary-gradient)', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Ready to get started?</h2>
                    <p style={{ fontSize: '1.25rem', marginBottom: '3rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 3rem' }}>Join thousands of users who trust Signify for their digital signatures.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/guest/upload" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', borderRadius: '50px', background: 'white', color: '#4a00e0' }}>
                            Sign Document Now
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', transition: 'transform 0.3s ease', cursor: 'default' }}>
        <div style={{ fontSize: '3.5rem', color: '#4a00e0', marginBottom: '1.5rem' }}>{icon}</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1f2937' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
    </div>
);

const Step = ({ num, title, desc, align }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexDirection: align === 'right' ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, textAlign: align === 'right' ? 'left' : 'right', minWidth: '300px' }}>
            <span style={{ fontSize: '6rem', fontWeight: 900, color: '#e5e7eb', lineHeight: 1, display: 'block', marginBottom: '1rem' }}>{num}</span>
        </div>
        <div style={{ flex: 2, minWidth: '300px' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#1f2937' }}>{title}</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
        </div>
    </div>
);



const FAQItem = ({ q, a }) => (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem', background: 'white' }}>
        <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1f2937' }}>{q}</h4>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{a}</p>
    </div>
);

export default Home;
