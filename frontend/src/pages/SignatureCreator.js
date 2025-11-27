import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import ConfirmationModal from '../components/ConfirmationModal';
import { FaPenNib, FaKeyboard, FaUpload, FaEraser, FaSave, FaTimes, FaCloudUploadAlt, FaArrowLeft } from 'react-icons/fa';

const SignatureCreator = () => {
    const sigCanvas = useRef({});
    const [activeTab, setActiveTab] = useState('draw'); // draw, type, upload
    const [typedSignature, setTypedSignature] = useState('');
    const [uploadedSignature, setUploadedSignature] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [signatures, setSignatures] = useState([]);

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sigToDelete, setSigToDelete] = useState(null);

    useEffect(() => {
        fetchSignatures();
    }, []);

    const fetchSignatures = async () => {
        try {
            const res = await api.get('/signatures');
            setSignatures(res.data);
        } catch (error) {
            console.error("Failed to fetch signatures", error);
        }
    };

    const confirmDelete = (id) => {
        setSigToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!sigToDelete) return;
        try {
            await api.delete(`/signatures/${sigToDelete}`);
            toast.success("Signature deleted.");
            fetchSignatures();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete signature.");
        } finally {
            setShowDeleteModal(false);
            setSigToDelete(null);
        }
    };

    const clear = () => {
        if (activeTab === 'draw') {
            sigCanvas.current.clear();
        } else if (activeTab === 'type') {
            setTypedSignature('');
        } else {
            setUploadedSignature(null);
        }
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedSignature(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const save = async () => {
        let dataUrl = null;

        if (activeTab === 'draw') {
            if (sigCanvas.current.isEmpty()) {
                toast.error("Please draw a signature first.");
                return;
            }
            dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        } else if (activeTab === 'type') {
            if (!typedSignature.trim()) {
                toast.error("Please type a signature first.");
                return;
            }
            // Convert text to image
            const canvas = document.createElement('canvas');
            canvas.width = 500;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');
            ctx.font = '48px "Dancing Script", cursive';
            ctx.fillStyle = 'black';
            ctx.fillText(typedSignature, 20, 100);
            dataUrl = canvas.toDataURL('image/png');
        } else if (activeTab === 'upload') {
            if (!uploadedSignature) {
                toast.error("Please upload a signature first.");
                return;
            }
            dataUrl = uploadedSignature;
        }

        setLoading(true);
        try {
            await api.post('/signatures', { signature_data: dataUrl });
            toast.success("Signature saved successfully!");
            fetchSignatures(); // Refresh list instead of navigating
            clear();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save signature.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <SEO title="Create Signature" description="Draw, type, or upload your digital signature." />

            <div style={{ marginBottom: '2rem' }}>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaArrowLeft /> Back to Dashboard
                </button>
            </div>

            <div className="card" style={{ maxWidth: '800px', margin: '0 auto 3rem', padding: '0', overflow: 'hidden' }}>
                <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex' }}>
                    <button
                        className={`tab-btn ${activeTab === 'draw' ? 'active' : ''}`}
                        onClick={() => setActiveTab('draw')}
                        style={{ flex: 1, padding: '1rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, color: activeTab === 'draw' ? '#4a00e0' : '#6b7280', borderBottom: activeTab === 'draw' ? '2px solid #4a00e0' : 'none' }}
                    >
                        <FaPenNib style={{ marginRight: '0.5rem' }} /> Draw
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'type' ? 'active' : ''}`}
                        onClick={() => setActiveTab('type')}
                        style={{ flex: 1, padding: '1rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, color: activeTab === 'type' ? '#4a00e0' : '#6b7280', borderBottom: activeTab === 'type' ? '2px solid #4a00e0' : 'none' }}
                    >
                        <FaKeyboard style={{ marginRight: '0.5rem' }} /> Type
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                        style={{ flex: 1, padding: '1rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, color: activeTab === 'upload' ? '#4a00e0' : '#6b7280', borderBottom: activeTab === 'upload' ? '2px solid #4a00e0' : 'none' }}
                    >
                        <FaUpload style={{ marginRight: '0.5rem' }} /> Upload
                    </button>
                </div>

                <div style={{ padding: '2rem' }}>
                    <div style={{ border: '2px dashed #e5e7eb', borderRadius: '12px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', marginBottom: '2rem', position: 'relative' }}>
                        {activeTab === 'draw' && (
                            <SignatureCanvas
                                ref={sigCanvas}
                                canvasProps={{ width: 700, height: 290, className: 'sigCanvas' }}
                            />
                        )}
                        {activeTab === 'type' && (
                            <input
                                type="text"
                                placeholder="Type your name here"
                                value={typedSignature}
                                onChange={(e) => setTypedSignature(e.target.value)}
                                style={{ fontSize: '3rem', border: 'none', textAlign: 'center', width: '100%', outline: 'none', fontFamily: 'cursive' }}
                            />
                        )}
                        {activeTab === 'upload' && (
                            <div style={{ textAlign: 'center' }}>
                                {uploadedSignature ? (
                                    <img src={uploadedSignature} alt="Uploaded" style={{ maxHeight: '280px', maxWidth: '100%' }} />
                                ) : (
                                    <>
                                        <FaCloudUploadAlt size={50} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                                        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Drag & drop or click to upload</p>
                                        <input type="file" id="sig-upload" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                                        <label htmlFor="sig-upload" className="btn-secondary" style={{ cursor: 'pointer' }}>Choose File</label>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button onClick={clear} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaEraser /> Clear
                        </button>
                        <button onClick={save} className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}>
                            {loading ? 'Saving...' : <><FaSave /> Save Signature</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Saved Signatures */}
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1f2937' }}>Your Saved Signatures</h2>
                {signatures.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No saved signatures yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        {signatures.map(sig => (
                            <div key={sig.id} className="card" style={{ padding: '1rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
                                <img src={sig.signature_data} alt="Signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                <button
                                    onClick={() => confirmDelete(sig.id)}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    title="Delete Signature"
                                >
                                    <FaTimes size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Signature"
                message="Are you sure you want to delete this signature? This action cannot be undone."
            />
        </div>
    );
};

export default SignatureCreator;
