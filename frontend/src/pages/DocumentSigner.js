import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import api from '../api';
import { toast } from 'react-toastify';
import { FaPenNib, FaCheck, FaTimes, FaChevronLeft, FaChevronRight, FaExpand, FaCompress, FaInfoCircle } from 'react-icons/fa';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const DocumentSigner = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [documentData, setDocumentData] = useState(null);
    const [signatures, setSignatures] = useState([]);
    const [selectedSignature, setSelectedSignature] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfPageSize, setPdfPageSize] = useState(null);
    const [scale, setScale] = useState(1.0);

    // State for position and size
    const [position, setPosition] = useState({ x: 50, y: 100 });
    const [size, setSize] = useState({ width: 150, height: 60 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRes = await api.get('/documents'); // Ideally get single doc
                const doc = docRes.data.find(d => d.id === parseInt(id));
                setDocumentData(doc);

                const sigRes = await api.get('/signatures');
                setSignatures(sigRes.data);
                // Don't auto-select to encourage user to choose
            } catch (error) {
                toast.error("Failed to load data.");
            }
        };
        fetchData();
    }, [id]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const onPageLoadSuccess = (page) => {
        setPdfPageSize({ width: page.width, height: page.height });
    };

    const handleSign = async () => {
        if (!selectedSignature) {
            toast.error("Please select a signature first.");
            return;
        }

        if (!pdfPageSize) {
            toast.error("PDF page not fully loaded.");
            return;
        }

        // Calculate relative coordinates (0 to 1)
        const relX = position.x / pdfPageSize.width;
        const relY = position.y / pdfPageSize.height;
        const relW = size.width / pdfPageSize.width;
        const relH = size.height / pdfPageSize.height;

        try {
            await api.post(`/documents/${id}/sign`, {
                signature_id: selectedSignature,
                page: pageNumber,
                x: relX,
                y: relY,
                w: relW,
                h: relH
            });
            toast.success("Document signed successfully!");
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error("Failed to sign document. Check console for details.");
        }
    };

    if (!documentData) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f9fafb' }}>
            <div style={{ fontSize: '1.5rem', color: '#4a00e0', fontWeight: 600 }}>Loading Document...</div>
        </div>
    );

    // Construct URL for PDF
    const fileUrl = `/storage/${documentData.original_file_path}`;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: '#f3f4f6', overflow: 'hidden' }}>
            {/* Main PDF Viewer Area */}
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

                {/* PDF Container */}
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
                            onLoadError={(error) => console.error('Error while loading document!', error.message)}
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                onLoadSuccess={onPageLoadSuccess}
                            />
                        </Document>

                        {/* Draggable Overlay */}
                        {selectedSignature && pdfPageSize && (
                            <Rnd
                                size={{ width: size.width * scale, height: size.height * scale }}
                                position={{ x: position.x * scale, y: position.y * scale }}
                                onDragStop={(e, d) => {
                                    setPosition({ x: d.x / scale, y: d.y / scale });
                                }}
                                onResizeStop={(e, direction, ref, delta, position) => {
                                    setSize({
                                        width: parseInt(ref.style.width) / scale,
                                        height: parseInt(ref.style.height) / scale,
                                    });
                                    setPosition({ x: position.x / scale, y: position.y / scale });
                                }}
                                bounds="parent"
                                style={{
                                    border: '2px dashed #4a00e0',
                                    background: 'rgba(74, 0, 224, 0.1)',
                                    cursor: 'move',
                                    borderRadius: '4px'
                                }}
                            >
                                {(() => {
                                    const sig = signatures.find(s => s.id == selectedSignature);
                                    return sig ? (
                                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                            <img
                                                src={sig.signature_data}
                                                alt="Signature"
                                                style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                                            />
                                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#4a00e0', color: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                                <FaPenNib size={10} />
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
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

            {/* Right Sidebar */}
            <div style={{
                width: '380px',
                background: 'white',
                borderLeft: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-4px 0 20px rgba(0,0,0,0.02)',
                zIndex: 30
            }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid #f3f4f6' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Sign Document</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Select a signature and place it on the document.</p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <label style={{ fontWeight: 600, color: '#374151' }}>Your Signatures</label>
                            <button onClick={() => navigate('/create-signature')} style={{ fontSize: '0.85rem', color: '#4a00e0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>+ Create New</button>
                        </div>

                        {/* Signature Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {signatures.length > 0 ? signatures.map(sig => (
                                <div
                                    key={sig.id}
                                    onClick={() => setSelectedSignature(sig.id)}
                                    style={{
                                        border: selectedSignature === sig.id ? '2px solid #4a00e0' : '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        background: selectedSignature === sig.id ? 'rgba(74, 0, 224, 0.03)' : 'white',
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                        height: '100px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <img src={sig.signature_data} alt="Sig" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    {selectedSignature === sig.id && (
                                        <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#4a00e0' }}>
                                            <FaCheckCircle size={16} />
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', background: '#f9fafb', borderRadius: '12px', color: '#6b7280' }}>
                                    <p>No signatures found.</p>
                                    <button onClick={() => navigate('/create-signature')} style={{ marginTop: '0.5rem', color: '#4a00e0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Create one now</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <FaInfoCircle style={{ color: '#3b82f6', fontSize: '1.2rem', marginTop: '2px' }} />
                        <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.5rem' }}>How to sign</h4>
                            <ul style={{ paddingLeft: '1rem', color: '#1e3a8a', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                                <li>Select a signature from the grid above.</li>
                                <li>Drag the box on the document to position it.</li>
                                <li>Resize using the corners if needed.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '2rem', borderTop: '1px solid #f3f4f6', background: 'white' }}>
                    <button
                        onClick={handleSign}
                        disabled={!selectedSignature}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: selectedSignature ? 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)' : '#e5e7eb',
                            color: selectedSignature ? 'white' : '#9ca3af',
                            border: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            cursor: selectedSignature ? 'pointer' : 'not-allowed',
                            borderRadius: '12px',
                            boxShadow: selectedSignature ? '0 10px 20px -5px rgba(74, 0, 224, 0.4)' : 'none',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FaPenNib /> Sign Document
                    </button>
                </div>
            </div>
        </div>
    );
};

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

// Helper component for check icon
const FaCheckCircle = ({ size }) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height={size} width={size} xmlns="http://www.w3.org/2000/svg">
        <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628 0z"></path>
    </svg>
);

export default DocumentSigner;
