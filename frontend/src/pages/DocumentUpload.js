import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
        <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
            <h2>Upload Document</h2>
            <div
                {...getRootProps()}
                style={{
                    border: '2px dashed #ccc',
                    padding: '3rem',
                    cursor: 'pointer',
                    background: isDragActive ? '#f0f0f0' : '#fff'
                }}
            >
                <input {...getInputProps()} />
                {
                    isDragActive ?
                        <p>Drop the file here ...</p> :
                        <p>Drag 'n' drop a PDF or DOCX file here, or click to select file</p>
                }
            </div>
        </div>
    );
};

export default DocumentUpload;
