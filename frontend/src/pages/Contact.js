import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api';
import SEO from '../components/SEO';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.type === 'textarea' ? 'message' : e.target.type]: e.target.value });
    };

    // Fix for textarea name attribute
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/contact', formData);
            toast.success("Message sent! We'll get back to you soon.");
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: '4rem 0',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'
        }}>
            <SEO title="Contact Us" description="Get in touch with Signify. We are here to help you with your document signing needs." />
            <div className="card" style={{
                width: '100%',
                maxWidth: '600px',
                padding: '3rem',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.5rem' }}>Contact Us</h1>
                    <p style={{ color: '#6b7280' }}>
                        Have questions? We'd love to hear from you.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Name</label>
                        <input
                            type="text"
                            name="name"
                            className="input-field"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            style={{ padding: '1rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', width: '100%', fontSize: '1rem' }}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            className="input-field"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            style={{ padding: '1rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', width: '100%', fontSize: '1rem' }}
                        />
                    </div>
                    <div style={{ marginBottom: '3rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Message</label>
                        <textarea
                            name="message"
                            className="input-field"
                            rows="5"
                            placeholder="How can we help you?"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            style={{ padding: '1rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', width: '100%', fontSize: '1rem', resize: 'vertical', minHeight: '120px' }}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn-primary" style={{
                        width: '100%',
                        padding: '1.2rem',
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        fontWeight: 700,
                        boxShadow: '0 10px 25px -5px rgba(74, 0, 224, 0.4)'
                    }} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
