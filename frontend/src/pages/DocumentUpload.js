import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { FaCloudUploadAlt, FaFilePdf, FaFileWord, FaArrowLeft } from 'react-icons/fa';

const DocumentUpload = () => {
    const navigate = useNavigate();

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Document uploaded successfully!");
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload document.");
        }
    }, [navigate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: false
    });

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <SEO title="Upload Document" />

            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaArrowLeft /> Back to Dashboard
                </button>
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '0', overflow: 'hidden' }}>
                <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '1.5rem 2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>Upload Document</h1>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.95rem' }}>Supported formats: PDF, DOCX</p>
                </div>

                <div style={{ padding: '3rem 2rem' }}>
                    <div
                        {...getRootProps()}
                        style={{
                            border: '2px dashed #e5e7eb',
                            borderRadius: '12px',
                            padding: '4rem 2rem',
                            cursor: 'pointer',
                            background: isDragActive ? 'rgba(74, 0, 224, 0.05)' : '#fff',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            borderColor: isDragActive ? '#4a00e0' : '#e5e7eb'
                        }}
                    >
                        <input {...getInputProps()} />
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(74, 0, 224, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: '#4a00e0'
                        }}>
                            <FaCloudUploadAlt style={{ fontSize: '2.5rem' }} />
                        </div>

                        {isDragActive ? (
                            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#4a00e0' }}>Drop the file here ...</p>
                        ) : (
                            <div>
                                <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1f2937' }}>Drag & drop your file here</p>
                                <p style={{ color: '#6b7280' }}>or click to browse</p>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', background: '#f9fafb', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                            <FaFilePdf style={{ color: '#ef4444' }} /> PDF
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', background: '#f9fafb', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                            <FaFileWord style={{ color: '#2563eb' }} /> DOCX
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;
