import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = ({ onSave }) => {
    const sigCanvas = useRef({});
    const [trimmedDataURL, setTrimmedDataURL] = useState(null);

    const clear = () => {
        sigCanvas.current.clear();
        setTrimmedDataURL(null);
    };

    const save = () => {
        if (sigCanvas.current.isEmpty()) {
            alert("Please provide a signature first.");
            return;
        }
        const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        setTrimmedDataURL(dataUrl);
        if (onSave) {
            onSave(dataUrl);
        }
    };

    return (
        <div className="signature-pad-container">
            <h3>Draw your signature</h3>
            <div className="canvas-wrapper" style={{ border: '1px solid #ccc', width: 500, height: 200 }}>
                <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
                />
            </div>
            <div className="buttons">
                <button onClick={clear}>Clear</button>
                <button onClick={save}>Save Signature</button>
            </div>

            {trimmedDataURL && (
                <div className="preview">
                    <h4>Preview:</h4>
                    <img src={trimmedDataURL} alt="Signature Preview" />
                </div>
            )}
        </div>
    );
};

export default SignaturePad;
