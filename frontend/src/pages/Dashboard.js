import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import ConfirmationModal from '../components/ConfirmationModal';
import { FaFileAlt, FaPenFancy, FaClock, FaCheckCircle, FaPlus, FaSignature, FaDownload, FaTrash } from 'react-icons/fa';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await api.get('/documents');
                setDocuments(response.data);
            } catch (error) {
                console.error("Failed to fetch documents", error);
                toast.error("Could not load documents.");
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    const handleSign = (id) => {
        navigate(`/sign/${id}`);
    };

    const handleDownload = async (doc) => {
        try {
            const response = await api.get(`/documents/${doc.id}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.signed_file_path ? `signed_${doc.original_file_path}` : doc.original_file_path);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Download failed.");
        }
    };

    const confirmDelete = (id) => {
        setDocToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!docToDelete) return;
        try {
            await api.delete(`/documents/${docToDelete}`);
            setDocuments(documents.filter(doc => doc.id !== docToDelete));
            toast.success("Document deleted.");
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Failed to delete document.");
        } finally {
            setShowDeleteModal(false);
            setDocToDelete(null);
        }
    };

    const stats = {
        total: documents.length,
        signed: documents.filter(d => d.status === 'signed').length,
        pending: documents.filter(d => d.status === 'pending').length
    };

    return (
        <div className="container" style={{ padding: '8rem 0 4rem' }}>
            <SEO title="Dashboard" />

            {/* Header Section */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.5rem' }}>
                        Welcome back, {user?.name}!
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Here's what's happening with your documents today.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/documents/upload" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px 0 rgba(74, 0, 224, 0.39)' }}>
                        <FaPlus /> Upload New
                    </Link>
                    <Link to="/create-signature" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaSignature /> Manage Signatures
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                <StatCard
                    icon={<FaFileAlt />}
                    title="Total Documents"
                    value={stats.total}
                    color="#4a00e0"
                    bg="rgba(74, 0, 224, 0.1)"
                />
                <StatCard
                    icon={<FaCheckCircle />}
                    title="Signed Documents"
                    value={stats.signed}
                    color="#10b981"
                    bg="rgba(16, 185, 129, 0.1)"
                />
                <StatCard
                    icon={<FaClock />}
                    title="Pending Signature"
                    value={stats.pending}
                    color="#f59e0b"
                    bg="rgba(245, 158, 11, 0.1)"
                />
            </div>

            {/* Recent Documents Section */}
            <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaFileAlt style={{ color: '#4a00e0' }} /> Recent Documents
                </h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div className="spinner" style={{ border: '4px solid rgba(0, 0, 0, 0.1)', width: '36px', height: '36px', borderRadius: '50%', borderLeftColor: '#4a00e0', animation: 'spin 1s ease infinite', margin: '0 auto' }}></div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading your documents...</p>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed #e5e7eb', background: '#f9fafb' }}>
                        <div style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '1rem' }}><FaFileAlt /></div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>No documents found</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Upload a document to get started with signing.</p>
                        <Link to="/documents/upload" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaPlus /> Upload your first document
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {documents.map((doc) => (
                            <div key={doc.id} className="card" style={{
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'default'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '12px',
                                        background: doc.status === 'signed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        color: doc.status === 'signed' ? '#10b981' : '#f59e0b'
                                    }}>
                                        {doc.status === 'signed' ? <FaCheckCircle /> : <FaClock />}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem', color: '#1f2937' }}>{doc.original_file_path}</h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            Uploaded on {new Date(doc.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {doc.status === 'pending' && (
                                        <button onClick={() => handleSign(doc.id)} className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaPenFancy /> Sign Now
                                        </button>
                                    )}
                                    {doc.status === 'signed' && (
                                        <button onClick={() => handleDownload(doc)} className="btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaDownload /> Download
                                        </button>
                                    )}
                                    <button
                                        onClick={() => confirmDelete(doc.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '0.6rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '8px',
                                            transition: 'background 0.2s'
                                        }}
                                        title="Delete Document"
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Document"
                message="Are you sure you want to delete this document? This action cannot be undone."
            />

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};

const StatCard = ({ icon, title, value, color, bg }) => (
    <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'transform 0.2s' }}>
        <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: color
        }}>
            {icon}
        </div>
        <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1f2937', lineHeight: 1 }}>{value}</p>
        </div>
    </div>
);

export default Dashboard;
