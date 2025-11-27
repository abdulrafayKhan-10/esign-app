import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import SignatureCanvas from 'react-signature-canvas';
import api from '../api';
import { toast } from 'react-toastify';
import { FaPenNib, FaCheck, FaTimes, FaUpload, FaKeyboard, FaPen, FaChevronLeft, FaChevronRight, FaExpand, FaCompress } from 'react-icons/fa';

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

    // Signature State
    const [signatureData, setSignatureData] = useState(null);
    const [showSigModal, setShowSigModal] = useState(false);
    const [sigMode, setSigMode] = useState('draw'); // draw, type, upload
    const sigCanvas = useRef({});
    const [typedSig, setTypedSig] = useState('');

    // Rnd State
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
            } catch (error) {
                toast.error("Failed to load document.");
                navigate('/');
            }
        };
        fetchDoc();
    }, [id, navigate]);

    const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
    const onPageLoadSuccess = (page) => setPdfPageSize({ width: page.width, height: page.height });

    const handleCreateSignature = () => {
        if (sigMode === 'draw') {
            if (sigCanvas.current.isEmpty()) {
                toast.error("Please draw a signature.");
                return;
            }
            setSignatureData(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'));
        } else if (sigMode === 'type') {
            if (!typedSig.trim()) {
                toast.error("Please type your name.");
                return;
            }
            // Convert text to image (simple canvas approach)
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            ctx.font = '48px "Dancing Script", cursive'; // Need to import this font or use standard
            ctx.fillStyle = 'black';
            ctx.fillText(typedSig, 20, 70);
            setSignatureData(canvas.toDataURL('image/png'));
        }
        // Upload handled separately in input onChange
        setShowSigModal(false);
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignatureData(reader.result);
                setShowSigModal(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSign = async () => {
        if (!signatureData) {
            toast.error("Please create a signature first.");
            setShowSigModal(true);
            return;
        }
        if (!pdfPageSize) return;

        const guestId = localStorage.getItem('guest_id');

        // Calculate relative
        const relX = position.x / (pdfPageSize.width * scale);
        const relY = position.y / (pdfPageSize.height * scale);
        const relW = size.width / (pdfPageSize.width * scale);
        const relH = size.height / (pdfPageSize.height * scale);

        try {
            await api.post(`/guest/documents/${id}/sign`, {
                guest_id: guestId,
                signature_data: signatureData,
                page: pageNumber,
                x: relX,
                y: relY,
                w: relW,
                h: relH
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
                        toast.error("Generation is taking longer than expected. Please click 'Finish & Download' again in a few seconds.");
                    }
                }
            };

            // Start download attempt after a short initial delay
            setTimeout(() => downloadWithRetry(), 1000);

        } catch (error) {
            console.error(error);
            toast.error("Signing failed.");
        }
    };

    if (!documentData) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f9fafb' }}>
            <div style={{ fontSize: '1.5rem', color: '#4a00e0', fontWeight: 600 }}>Loading Document...</div>
        </div>
    );

    const fileUrl = `/storage/${documentData.original_file_path}`;

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
                        // Explicitly set dimensions to match PDF page for correct drag bounds
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

                        {signatureData && pdfPageSize && (
                            <Rnd
                                size={{ width: size.width * scale, height: size.height * scale }}
                                position={{ x: position.x * scale, y: position.y * scale }}
                                onDragStop={(e, d) => setPosition({ x: d.x / scale, y: d.y / scale })}
                                onResizeStop={(e, direction, ref, delta, position) => {
                                    setSize({ width: parseInt(ref.style.width) / scale, height: parseInt(ref.style.height) / scale });
                                    setPosition({ x: position.x / scale, y: position.y / scale });
                                }}
                                bounds="parent"
                                style={{ border: '2px dashed #4a00e0', cursor: 'move', background: 'rgba(74, 0, 224, 0.1)', borderRadius: '4px' }}
                            >
                                <img src={signatureData} alt="Sig" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#4a00e0', color: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                    <FaPenNib size={10} />
                                </div>
                            </Rnd>
                        )}
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
            <div style={{ width: '350px', background: 'white', padding: '2rem', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.02)', zIndex: 30 }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Sign Document</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' }}>Create a signature and place it on the document.</p>

                {!signatureData ? (
                    <button onClick={() => setShowSigModal(true)} className="btn-primary" style={{ width: '100%', marginBottom: '1rem', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <FaPenNib /> Create Signature
                    </button>
                ) : (
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Your Signature:</p>
                        <div style={{ border: '1px solid #e5e7eb', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', background: '#f9fafb', display: 'flex', justifyContent: 'center' }}>
                            <img src={signatureData} alt="Sig" style={{ maxWidth: '100%', maxHeight: '60px' }} />
                        </div>
                        <button onClick={() => setSignatureData(null)} style={{ width: '100%', padding: '0.8rem', border: '1px solid #e5e7eb', background: 'white', borderRadius: '8px', color: '#4b5563', fontWeight: 600, cursor: 'pointer' }}>
                            Remove & Create New
                        </button>
                    </div>
                )}

                <div style={{ marginTop: 'auto' }}>
                    {!documentData.signed_file_path && !signatureData && (
                        <p style={{ fontSize: '0.9rem', color: '#6b7280', textAlign: 'center' }}>
                            Place your signature on the document to finish.
                        </p>
                    )}

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
                            onClick={handleSign}
                            disabled={!signatureData}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: signatureData ? 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)' : '#e5e7eb',
                                color: signatureData ? 'white' : '#9ca3af',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                cursor: signatureData ? 'pointer' : 'not-allowed',
                                borderRadius: '12px',
                                boxShadow: signatureData ? '0 10px 20px -5px rgba(74, 0, 224, 0.4)' : 'none',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <FaCheck /> Finish & Download
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


