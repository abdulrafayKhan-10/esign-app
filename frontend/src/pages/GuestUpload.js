import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import api from '../api';
import { toast } from 'react-toastify';
import { FaCloudUploadAlt, FaSpinner, FaLock, FaUserPlus } from 'react-icons/fa';

const GuestUpload = () => {
    const [limitReached, setLimitReached] = useState(false);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    // Removed client-side usage count check in favor of server-side IP tracking

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        let guestId = localStorage.getItem('guest_id');
        if (!guestId) {
            guestId = uuidv4();
            localStorage.setItem('guest_id', guestId);
        }
        formData.append('guest_id', guestId);

        try {
            const response = await api.post('/guest/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success("Document uploaded!");
            navigate(`/guest/sign/${response.data.id}`);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 403 && error.response.data.limit_reached) {
                setLimitReached(true);
                toast.info(error.response.data.message);
            } else {
                toast.error("Upload failed.");
            }
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
        disabled: limitReached
    });

    if (limitReached) {
        return (
            <div className="container" style={{ padding: '4rem 0', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem' }}>
                    <div style={{ width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <FaLock size={32} color="#4b5563" />
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1f2937' }}>Limit Reached</h2>
                    <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>
                        You've used your free guest signature. To sign more documents and save your signatures, please create a free account.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link to="/register" className="btn-primary" style={{ justifyContent: 'center', padding: '1rem' }}>
                            <FaUserPlus /> Create Free Account
                        </Link>
                        <Link to="/login" style={{ color: '#4a00e0', fontWeight: 600 }}>
                            Already have an account? Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '4rem 0', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '3rem', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
                    Upload Document
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '3rem', fontSize: '1.1rem' }}>
                    Upload your PDF to sign it instantly. No account required for your first document.
                </p>

                <div
                    {...getRootProps()}
                    style={{
                        border: '2px dashed #d1d5db',
                        borderRadius: '1.5rem',
                        padding: '4rem 2rem',
                        cursor: 'pointer',
                        background: isDragActive ? '#f9fafb' : 'white',
                        transition: 'all 0.3s ease',
                        borderColor: isDragActive ? '#4a00e0' : '#d1d5db',
                        transform: isDragActive ? 'scale(1.02)' : 'scale(1)'
                    }}
                >
                    <input {...getInputProps()} />
                    {uploading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <FaSpinner className="spin" style={{ fontSize: '3rem', color: '#4a00e0', animation: 'spin 1s linear infinite' }} />
                            <p style={{ marginTop: '1rem', color: '#4a00e0', fontWeight: 600 }}>Uploading your document...</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ width: '100px', height: '100px', background: 'rgba(74, 0, 224, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <FaCloudUploadAlt style={{ fontSize: '3.5rem', color: '#4a00e0' }} />
                            </div>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' }}>
                                {isDragActive ? "Drop it like it's hot!" : "Click to upload or drag and drop"}
                            </p>
                            <p style={{ fontSize: '0.95rem', color: '#9ca3af' }}>
                                PDF files only, max 5MB.
                            </p>
                        </>
                    )}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', color: '#6b7280', fontSize: '0.9rem' }}>
                    <span>🔒 Secure & Private</span>
                    <span>⚡ Instant Download</span>
                </div>
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default GuestUpload;
