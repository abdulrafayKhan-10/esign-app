import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import SignatureCanvas from 'react-signature-canvas';
import api from '../api';
import { toast } from 'react-toastify';
import { FaPenNib, FaCheck, FaTimes, FaUpload, FaKeyboard, FaPen, FaChevronLeft, FaChevronRight, FaExpand, FaCompress, FaTrash, FaCopy, FaLayerGroup } from 'react-icons/fa';

// Set worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const GuestSigner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [documentData, setDocumentData] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfPageSize, setPdfPageSize] = useState(null);
    const [scale, setScale] = useState(1.0);

    // Signature Template State (the signature image to be placed)
    const [signatureTemplate, setSignatureTemplate] = useState(null);
    const [showSigModal, setShowSigModal] = useState(false);
    const [sigMode, setSigMode] = useState('draw'); // draw, type, upload
    const sigCanvas = useRef({});
    const [typedSig, setTypedSig] = useState('');

    // Placed Signatures State
    const [placedSignatures, setPlacedSignatures] = useState([]);
    const [selectedSignatureId, setSelectedSignatureId] = useState(null);

    // Rnd State for new signature placement
    const [position, setPosition] = useState({ x: 50, y: 100 });
    const [size, setSize] = useState({ width: 150, height: 60 });

    useEffect(() => {
        const fetchDoc = async () => {
            const guestId = localStorage.getItem('guest_id');
            if (!guestId) {
                toast.error("Session expired.");
                navigate('/guest/upload');
                return;
            }
            try {
                const res = await api.get(`/guest/documents/${id}?guest_id=${guestId}`);
                setDocumentData(res.data);
                
                // Fetch existing signatures
                await fetchSignatures();
            } catch (error) {
                toast.error("Failed to load document.");
                navigate('/');
            }
        };
        fetchDoc();
    }, [id, navigate]);

    const fetchSignatures = async () => {
        const guestId = localStorage.getItem('guest_id');
        try {
            const res = await api.get(`/guest/documents/${id}/signatures?guest_id=${guestId}`);
            setPlacedSignatures(res.data);
        } catch (error) {
            console.error("Failed to fetch signatures:", error);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
    const onPageLoadSuccess = (page) => setPdfPageSize({ width: page.width, height: page.height });

    const handleCreateSignature = () => {
        if (sigMode === 'draw') {
            if (sigCanvas.current.isEmpty()) {
                toast.error("Please draw a signature.");
                return;
            }
            setSignatureTemplate(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'));
        } else if (sigMode === 'type') {
            if (!typedSig.trim()) {
                toast.error("Please type your name.");
                return;
            }
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            ctx.font = '48px "Dancing Script", cursive';
            ctx.fillStyle = 'black';
            ctx.fillText(typedSig, 20, 70);
            setSignatureTemplate(canvas.toDataURL('image/png'));
        }
        setShowSigModal(false);
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignatureTemplate(reader.result);
                setShowSigModal(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSignature = async () => {
        if (!signatureTemplate) {
            toast.error("Please create a signature first.");
            setShowSigModal(true);
            return;
        }
        if (!pdfPageSize) return;

        const guestId = localStorage.getItem('guest_id');

        // Calculate relative coordinates
        const relX = position.x / (pdfPageSize.width * scale);
        const relY = position.y / (pdfPageSize.height * scale);
        const relW = size.width / (pdfPageSize.width * scale);
        const relH = size.height / (pdfPageSize.height * scale);

        try {
            const res = await api.post(`/guest/documents/${id}/add-signature`, {
                guest_id: guestId,
                signature_data: signatureTemplate,
                page: pageNumber,
                x: relX,
                y: relY,
                w: relW,
                h: relH
            });

            toast.success("Signature added!");
            await fetchSignatures();
            
            // Reset position for next signature
            setPosition({ x: 50, y: 100 });

        } catch (error) {
            console.error(error);
            toast.error("Failed to add signature.");
        }
    };

    const handleDeleteSignature = async (signatureId) => {
        const guestId = localStorage.getItem('guest_id');
        try {
            await api.delete(`/guest/documents/${id}/signatures/${signatureId}?guest_id=${guestId}`);
            toast.success("Signature removed!");
            await fetchSignatures();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete signature.");
        }
    };

    const handleDuplicateSignature = async (signatureId) => {
        const guestId = localStorage.getItem('guest_id');
        try {
            await api.post(`/guest/documents/${id}/signatures/${signatureId}/duplicate`, {
                guest_id: guestId
            });
            toast.success("Signature duplicated!");
            await fetchSignatures();
        } catch (error) {
            console.error(error);
            toast.error("Failed to duplicate signature.");
        }
    };

    const handleApplyToAllPages = async (signatureId) => {
        if (!numPages) return;
        const guestId = localStorage.getItem('guest_id');
        try {
            await api.post(`/guest/documents/${id}/signatures/${signatureId}/apply-all`, {
                guest_id: guestId,
                num_pages: numPages
            });
            toast.success(`Signature applied to all ${numPages} pages!`);
            await fetchSignatures();
        } catch (error) {
            console.error(error);
            toast.error("Failed to apply to all pages.");
        }
    };

    const handleFinalize = async () => {
        if (placedSignatures.length === 0) {
            toast.error("Please add at least one signature before finalizing.");
            return;
        }

        const guestId = localStorage.getItem('guest_id');

        try {
            await api.post(`/guest/documents/${id}/finalize`, {
                guest_id: guestId
            });

            // Increment usage count
            const currentUsage = parseInt(localStorage.getItem('guest_usage_count') || '0');
            localStorage.setItem('guest_usage_count', (currentUsage + 1).toString());

            toast.success("Document signed!");

            // Update local state to show download button
            setDocumentData(prev => ({ ...prev, status: 'signed', signed_file_path: 'true' }));

            // Retry logic for download
            const downloadWithRetry = async (retries = 10, delay = 2000) => {
                try {
                    const response = await api.get(`/guest/documents/${id}/download?guest_id=${guestId}`, {
                        responseType: 'blob',
                    });
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `signed_${documentData.title || 'document'}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                    toast.success("Download started!");
                } catch (error) {
                    if (retries > 0) {
                        console.log(`Download failed, retrying in ${delay}ms... (${retries} attempts left)`);
                        setTimeout(() => downloadWithRetry(retries - 1, delay), delay);
                    } else {
                        console.error("Download failed after retries", error);
                        toast.error("Generation is taking longer than expected. Please click 'Download Signed PDF' again in a few seconds.");
                    }
                }
            };

            setTimeout(() => downloadWithRetry(), 1000);

        } catch (error) {
            console.error(error);
            toast.error("Finalization failed: " + (error.response?.data?.message || error.message));
        }
    };

    if (!documentData) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f9fafb' }}>
            <div style={{ fontSize: '1.5rem', color: '#4a00e0', fontWeight: 600 }}>Loading Document...</div>
        </div>
    );

    const fileUrl = `/storage/${documentData.original_file_path}`;

    // Get signatures for current page
    const currentPageSignatures = placedSignatures.filter(sig => sig.page === pageNumber);

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: '#f3f4f6', overflow: 'hidden' }}>
            {/* Main PDF Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Toolbar */}
                <div style={{
                    padding: '1rem',
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>{documentData.title || 'Untitled Document'}</h2>
                        <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.6rem', background: '#e0e7ff', color: '#4338ca', borderRadius: '12px' }}>
                            Page {pageNumber} of {numPages}
                        </span>
                        <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.6rem', background: '#dcfce7', color: '#166534', borderRadius: '12px' }}>
                            {placedSignatures.length} signature{placedSignatures.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} style={toolbarBtnStyle}><FaCompress /></button>
                        <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', width: '50px', justifyContent: 'center' }}>{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} style={toolbarBtnStyle}><FaExpand /></button>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center', background: '#e5e7eb' }}>
                    <div style={{
                        position: 'relative',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        transition: 'transform 0.2s ease',
                        width: pdfPageSize ? pdfPageSize.width * scale : 'auto',
                        height: pdfPageSize ? pdfPageSize.height * scale : 'auto'
                    }}>
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={(error) => {
                                console.error('PDF Load Error:', error);
                                toast.error("Failed to load PDF. Please try refreshing.");
                            }}
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                onLoadSuccess={onPageLoadSuccess}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Document>

                        {/* Show draggable template for new signature */}
                        {signatureTemplate && pdfPageSize && documentData.status !== 'signed' && (
                            <Rnd
                                size={{ width: size.width * scale, height: size.height * scale }}
                                position={{ x: position.x * scale, y: position.y * scale }}
                                onDragStop={(e, d) => setPosition({ x: d.x / scale, y: d.y / scale })}
                                onResizeStop={(e, direction, ref, delta, position) => {
                                    setSize({ width: parseInt(ref.style.width) / scale, height: parseInt(ref.style.height) / scale });
                                    setPosition({ x: position.x / scale, y: position.y / scale });
                                }}
                                bounds="parent"
                                style={{ border: '2px dashed #10b981', cursor: 'move', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', zIndex: 100 }}
                            >
                                <img src={signatureTemplate} alt="Sig" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#10b981', color: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                    <FaPenNib size={10} />
                                </div>
                            </Rnd>
                        )}

                        {/* Show all placed signatures on current page */}
                        {currentPageSignatures.map(sig => (
                            <div
                                key={sig.id}
                                style={{
                                    position: 'absolute',
                                    left: sig.x * pdfPageSize.width * scale,
                                    top: sig.y * pdfPageSize.height * scale,
                                    width: sig.w * pdfPageSize.width * scale,
                                    height: sig.h * pdfPageSize.height * scale,
                                    border: selectedSignatureId === sig.id ? '2px solid #4a00e0' : '2px solid transparent',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    background: selectedSignatureId === sig.id ? 'rgba(74, 0, 224, 0.05)' : 'transparent',
                                    transition: 'all 0.2s',
                                    zIndex: selectedSignatureId === sig.id ? 50 : 10
                                }}
                                onClick={() => setSelectedSignatureId(sig.id)}
                            >
                                <img src={sig.signature_data} alt="Placed Sig" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                                {selectedSignatureId === sig.id && (
                                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#4a00e0', color: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                        <FaCheck size={10} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Controls */}
                {numPages && (
                    <div style={{
                        position: 'absolute',
                        bottom: '2rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        padding: '0.5rem 1rem',
                        borderRadius: '50px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        zIndex: 20
                    }}>
                        <button disabled={pageNumber <= 1} onClick={() => setPageNumber(prev => prev - 1)} style={navBtnStyle}>
                            <FaChevronLeft />
                        </button>
                        <span style={{ fontWeight: 600, color: '#374151' }}>{pageNumber} / {numPages}</span>
                        <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(prev => prev + 1)} style={navBtnStyle}>
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div style={{ width: '380px', background: 'white', padding: '2rem', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.02)', zIndex: 30, overflowY: 'auto' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Sign Document</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>Create and place signatures on the document.</p>

                {!signatureTemplate ? (
                    <button onClick={() => setShowSigModal(true)} className="btn-primary" style={{ width: '100%', marginBottom: '1rem', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <FaPenNib /> Create Signature
                    </button>
                ) : (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Signature Template:</p>
                        <div style={{ border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', background: '#f9fafb', display: 'flex', justifyContent: 'center' }}>
                            <img src={signatureTemplate} alt="Sig" style={{ maxWidth: '100%', maxHeight: '60px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setSignatureTemplate(null)} style={{ flex: 1, padding: '0.8rem', border: '1px solid #e5e7eb', background: 'white', borderRadius: '8px', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}>
                                Remove
                            </button>
                            <button onClick={handleAddSignature} disabled={documentData.status === 'signed'} style={{ flex: 2, padding: '0.8rem', background: documentData.status === 'signed' ? '#e5e7eb' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: documentData.status === 'signed' ? 'not-allowed' : 'pointer' }}>
                                + Add to Page {pageNumber}
                            </button>
                        </div>
                    </div>
                )}

                {/* Placed Signatures List */}
                <div style={{ flex: 1, marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', marginBottom: '1rem' }}>Placed Signatures ({placedSignatures.length})</h4>
                    {placedSignatures.length === 0 ? (
                        <div style={{ padding: '2rem', background: '#f9fafb', borderRadius: '12px', textAlign: 'center', color: '#6b7280' }}>
                            <p>No signatures placed yet.</p>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Create a signature and add it to the document.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {placedSignatures.map(sig => (
                                <div
                                    key={sig.id}
                                    style={{
                                        border: selectedSignatureId === sig.id ? '2px solid #4a00e0' : '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '0.75rem',
                                        background: selectedSignatureId === sig.id ? 'rgba(74, 0, 224, 0.03)' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => {
                                        setSelectedSignatureId(sig.id);
                                        setPageNumber(sig.page);
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a00e0' }}>Page {sig.page}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={(e) => { e.stopPropagation(); handleDuplicateSignature(sig.id); }} style={{ padding: '0.25rem 0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#4b5563' }} title="Duplicate">
                                                <FaCopy size={12} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleApplyToAllPages(sig.id); }} style={{ padding: '0.25rem 0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#4b5563' }} title="Apply to all pages">
                                                <FaLayerGroup size={12} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSignature(sig.id); }} style={{ padding: '0.25rem 0.5rem', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }} title="Delete">
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: '8px', padding: '0.5rem' }}>
                                        <img src={sig.signature_data} alt="Sig" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    {documentData.status === 'signed' ? (
                        <a
                            href={`${api.defaults.baseURL || '/api'}/guest/documents/${id}/download?guest_id=${localStorage.getItem('guest_id')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                borderRadius: '12px',
                                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                textDecoration: 'none'
                            }}
                        >
                            <FaCheck /> Download Signed PDF
                        </a>
                    ) : (
                        <button
                            onClick={handleFinalize}
                            disabled={placedSignatures.length === 0}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: placedSignatures.length > 0 ? 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)' : '#e5e7eb',
                                color: placedSignatures.length > 0 ? 'white' : '#9ca3af',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                cursor: placedSignatures.length > 0 ? 'pointer' : 'not-allowed',
                                borderRadius: '12px',
                                boxShadow: placedSignatures.length > 0 ? '0 10px 20px -5px rgba(74, 0, 224, 0.4)' : 'none',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaCheck /> Finalize & Download
                        </button>
                    )}
                </div>
            </div>

            {/* Signature Modal */}
            {showSigModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="card" style={{ width: '500px', maxWidth: '90%', padding: '2rem', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Signature</h3>
                            <button onClick={() => setShowSigModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9ca3af' }}><FaTimes /></button>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f3f4f6', padding: '0.25rem', borderRadius: '10px' }}>
                            <button onClick={() => setSigMode('draw')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: sigMode === 'draw' ? 'white' : 'transparent', boxShadow: sigMode === 'draw' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', fontWeight: 600, color: sigMode === 'draw' ? '#4a00e0' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><FaPen /> Draw</button>
                            <button onClick={() => setSigMode('type')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: sigMode === 'type' ? 'white' : 'transparent', boxShadow: sigMode === 'type' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', fontWeight: 600, color: sigMode === 'type' ? '#4a00e0' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><FaKeyboard /> Type</button>
                            <button onClick={() => setSigMode('upload')} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: 'none', background: sigMode === 'upload' ? 'white' : 'transparent', boxShadow: sigMode === 'upload' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', fontWeight: 600, color: sigMode === 'upload' ? '#4a00e0' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><FaUpload /> Upload</button>
                        </div>

                        <div style={{ border: '2px dashed #e5e7eb', borderRadius: '12px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', marginBottom: '1.5rem', overflow: 'hidden' }}>
                            {sigMode === 'draw' && (
                                <SignatureCanvas
                                    ref={sigCanvas}
                                    canvasProps={{ width: 450, height: 198, className: 'sigCanvas' }}
                                />
                            )}
                            {sigMode === 'type' && (
                                <input
                                    type="text"
                                    placeholder="Type your name"
                                    value={typedSig}
                                    onChange={(e) => setTypedSig(e.target.value)}
                                    style={{ fontSize: '2.5rem', padding: '1rem', border: 'none', background: 'transparent', textAlign: 'center', width: '100%', fontFamily: 'cursive', outline: 'none' }}
                                />
                            )}
                            {sigMode === 'upload' && (
                                <div style={{ textAlign: 'center' }}>
                                    <input type="file" id="sig-upload" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
                                    <label htmlFor="sig-upload" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaUpload /> Choose Image
                                    </label>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowSigModal(false)} style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', background: '#f3f4f6', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            {sigMode !== 'upload' && (
                                <button onClick={handleCreateSignature} className="btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '8px' }}>Use Signature</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const toolbarBtnStyle = {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '0.5rem',
    cursor: 'pointer',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
};

const navBtnStyle = {
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#4b5563',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
};

export default GuestSigner;

