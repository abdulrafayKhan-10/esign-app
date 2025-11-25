import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SignatureCreator = () => {
    const sigCanvas = useRef({});
    const [mode, setMode] = useState('draw'); // 'draw', 'type', 'upload'
    const [typedText, setTypedText] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const clear = () => {
        if (mode === 'draw') {
            sigCanvas.current.clear();
        } else if (mode === 'type') {
            setTypedText('');
        } else {
            setUploadedImage(null);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const save = async () => {
        setLoading(true);
        let dataUrl = null;

        if (mode === 'draw') {
            if (sigCanvas.current.isEmpty()) {
                toast.error("Please draw a signature first.");
                setLoading(false);
                return;
            }
            dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        } else if (mode === 'type') {
            if (!typedText.trim()) {
                toast.error("Please type your signature.");
                setLoading(false);
                return;
            }
            // Convert text to image using a temporary canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.font = '48px "Dancing Script", cursive';
            const textWidth = ctx.measureText(typedText).width;
            canvas.width = textWidth + 40;
            canvas.height = 100;

            // Re-setup context after resize
            ctx.font = '48px "Dancing Script", cursive';
            ctx.fillStyle = 'black';
            ctx.textBaseline = 'middle';
            ctx.fillText(typedText, 20, 50);

            dataUrl = canvas.toDataURL('image/png');
        } else if (mode === 'upload') {
            if (!uploadedImage) {
                toast.error("Please upload an image.");
                setLoading(false);
                return;
            }
            dataUrl = uploadedImage;
        }

        try {
            await api.post('/signatures', { signature_data: dataUrl });
            toast.success("Signature saved successfully!");
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error("Failed to save signature.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
            <h2>Create Your Signature</h2>

            <div style={{ marginBottom: '1rem' }}>
                <button
                    onClick={() => setMode('draw')}
                    style={{ marginRight: '1rem', fontWeight: mode === 'draw' ? 'bold' : 'normal' }}
                >
                    Draw
                </button>
                <button
                    onClick={() => setMode('type')}
                    style={{ marginRight: '1rem', fontWeight: mode === 'type' ? 'bold' : 'normal' }}
                >
                    Type
                </button>
                <button
                    onClick={() => setMode('upload')}
                    style={{ fontWeight: mode === 'upload' ? 'bold' : 'normal' }}
                >
                    Upload
                </button>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', background: '#fff' }}>
                {mode === 'draw' && (
                    <SignatureCanvas
                        ref={sigCanvas}
                        canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
                    />
                )}
                {mode === 'type' && (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <input
                            type="text"
                            value={typedText}
                            onChange={(e) => setTypedText(e.target.value)}
                            placeholder="Type your name"
                            style={{
                                fontSize: '2rem',
                                fontFamily: '"Dancing Script", cursive',
                                border: 'none',
                                borderBottom: '1px solid #000',
                                textAlign: 'center',
                                outline: 'none'
                            }}
                        />
                    </div>
                )}
                {mode === 'upload' && (
                    <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {!uploadedImage ? (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        ) : (
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <img
                                    src={uploadedImage}
                                    alt="Uploaded Signature"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                                <button
                                    onClick={clear}
                                    style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
                                >
                                    X
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button onClick={clear} disabled={loading}>Clear</button>
                <button onClick={save} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Signature'}
                </button>
            </div>
        </div>
    );
};

export default SignatureCreator;
