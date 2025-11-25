import React, { useEffect, useState } from 'react';
import api from '../api';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [signatures, setSignatures] = useState([]);

    useEffect(() => {
        fetchDocuments();
        fetchSignatures();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/documents');
            setDocuments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSignatures = async () => {
        try {
            const res = await api.get('/signatures');
            setSignatures(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteDocument = async (id) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await api.delete(`/documents/${id}`);
            fetchDocuments();
        } catch (err) {
            alert('Failed to delete document');
        }
    };

    const handleDeleteSignature = async (id) => {
        if (!window.confirm('Are you sure you want to delete this signature?')) return;
        try {
            await api.delete(`/signatures/${id}`);
            fetchSignatures();
        } catch (err) {
            alert('Failed to delete signature');
        }
    };

    const handleDownload = async (doc) => {
        try {
            const response = await api.get(`/documents/${doc.id}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `signed_${doc.title}`); // or extract filename from headers
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error(err);
            alert('Failed to download document');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Dashboard</h1>

            <div style={{ marginBottom: '2rem' }}>
                <h2>Your Signatures</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {signatures.map(sig => (
                        <div key={sig.id} style={{ border: '1px solid #ccc', padding: '0.5rem', position: 'relative' }}>
                            <img src={sig.signature_data} alt="Signature" style={{ height: '50px' }} />
                            <button
                                onClick={() => handleDeleteSignature(sig.id)}
                                style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
                            >X</button>
                        </div>
                    ))}
                </div>
                <a href="/signature/create" style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: '#007bff',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '4px'
                }}>
                    Create New Signature
                </a>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2>Your Documents</h2>
                <a href="/documents/upload" style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    background: '#28a745',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                }}>
                    Upload New Document
                </a>
                <ul style={{ marginTop: '1rem', listStyle: 'none', padding: 0 }}>
                    {documents.map(doc => (
                        <li key={doc.id} style={{ marginBottom: '0.5rem', padding: '1rem', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{doc.title} - <strong>{doc.status}</strong></span>
                            <div>
                                {doc.status === 'pending' && (
                                    <a href={`/documents/${doc.id}/sign`} style={{ marginRight: '1rem', color: '#007bff' }}>
                                        Sign Now
                                    </a>
                                )}
                                {doc.status === 'signed' && (
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        style={{ color: '#28a745', marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}
                                    >
                                        Download Signed
                                    </button>
                                )}
                                <button onClick={() => handleDeleteDocument(doc.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
