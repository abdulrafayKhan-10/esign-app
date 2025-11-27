import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SignatureCreator from './pages/SignatureCreator';
import DocumentUpload from './pages/DocumentUpload';
import DocumentSigner from './pages/DocumentSigner';
import ProtectedRoute from './components/ProtectedRoute';
import GuestUpload from './pages/GuestUpload';
import GuestSigner from './pages/GuestSigner';
import About from './pages/About';
import Contact from './pages/Contact';
import Features from './pages/Features';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CookieConsent from './components/CookieConsent';

function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <Router>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Signup />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/features" element={<Features />} />
                            <Route path="/privacy" element={<PrivacyPolicy />} />
                            <Route path="/terms" element={<TermsOfService />} />

                            {/* Guest Routes */}
                            <Route path="/guest/upload" element={<GuestUpload />} />
                            <Route path="/guest/sign/:id" element={<GuestSigner />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/create-signature" element={
                                <ProtectedRoute>
                                    <SignatureCreator />
                                </ProtectedRoute>
                            } />
                            <Route path="/documents/upload" element={
                                <ProtectedRoute>
                                    <DocumentUpload />
                                </ProtectedRoute>
                            } />
                            <Route path="/sign/:id" element={
                                <ProtectedRoute>
                                    <DocumentSigner />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </Layout>
                    <ToastContainer />
                    <CookieConsent />
                </Router>
            </AuthProvider>
        </HelmetProvider>
    );
}

export default App;
