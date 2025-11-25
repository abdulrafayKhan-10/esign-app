import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import api from '../api';
import { toast } from 'react-toastify';

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
                if (sigRes.data.length > 0) setSelectedSignature(sigRes.data[0].id);
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
            toast.error("Please select a signature.");
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

    if (!documentData) return <div>Loading...</div>;

    // Construct URL for PDF (using relative path to leverage proxy and avoid CORS)
    const fileUrl = `/storage/${documentData.original_file_path}`;

    return (
        <div style={{ display: 'flex', padding: '2rem', gap: '2rem', height: '90vh' }}>
            <div style={{ flex: 2, background: '#f0f0f0', padding: '2rem', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => console.error('Error while loading document!', error.message)}
                    >
                        <Page
                            pageNumber={pageNumber}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            onLoadSuccess={onPageLoadSuccess}
                        />
                    </Document>

                    {/* Draggable & Resizable Signature Overlay */}
                    {selectedSignature && pdfPageSize && (
                        <Rnd
                            size={{ width: size.width, height: size.height }}
                            position={{ x: position.x, y: position.y }}
                            onDragStop={(e, d) => {
                                setPosition({ x: d.x, y: d.y });
                            }}
                            onResizeStop={(e, direction, ref, delta, position) => {
                                setSize({
                                    width: parseInt(ref.style.width),
                                    height: parseInt(ref.style.height),
                                });
                                setPosition(position);
                            }}
                            style={{
                                border: '2px dashed #007bff',
                                background: 'rgba(0, 123, 255, 0.1)',
                                cursor: 'move'
                            }}
                        >
                            {(() => {
                                const sig = signatures.find(s => s.id == selectedSignature);
                                return sig ? (
                                    <img
                                        src={sig.signature_data}
                                        alt="Signature"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                                    />
                                ) : null;
                            })()}
                        </Rnd>
                    )}
                </div>

                {numPages && (
                    <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        <button disabled={pageNumber <= 1} onClick={() => setPageNumber(prev => prev - 1)}>Prev</button>
                        <span style={{ margin: '0 1rem' }}>Page {pageNumber} of {numPages}</span>
                        <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(prev => prev + 1)}>Next</button>
                    </div>
                )}
            </div>

            <div style={{ flex: 1, padding: '1rem', background: 'white', borderLeft: '1px solid #eee' }}>
                <h3>Sign Document</h3>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Select Signature:</label>
                    <select
                        value={selectedSignature || ''}
                        onChange={(e) => setSelectedSignature(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                    >
                        {signatures.map(sig => (
                            <option key={sig.id} value={sig.id}>Signature #{sig.id}</option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <p><strong>Instructions:</strong></p>
                    <ul style={{ paddingLeft: '1.2rem', color: '#555' }}>
                        <li>Drag the blue box to position your signature.</li>
                        <li>Drag the corners to resize it.</li>
                        <li>Click "Sign Document" when ready.</li>
                    </ul>
                </div>

                <button
                    onClick={handleSign}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        borderRadius: '4px'
                    }}
                >
                    Sign Document
                </button>
            </div>
        </div>
    );
};

export default DocumentSigner;
