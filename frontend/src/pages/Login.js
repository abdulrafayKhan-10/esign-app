import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            await login(data.email, data.password);
            navigate('/dashboard');
        } catch (error) {
            alert('Login failed');
        }
    };

    return (
        <div style={{
            padding: '4rem 0',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '480px',
                padding: '3rem',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p style={{ color: '#6b7280' }}>Sign in to continue to your dashboard</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            placeholder="name@company.com"
                            style={{ padding: '1rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', width: '100%', fontSize: '1rem' }}
                            {...register("email", { required: true })}
                        />
                        {errors.email && <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>Email is required</span>}
                    </div>

                    <div style={{ marginBottom: '3rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#374151', fontSize: '0.95rem' }}>Password</label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="••••••••"
                            style={{ padding: '1rem', borderRadius: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', width: '100%', fontSize: '1rem' }}
                            {...register("password", { required: true })}
                        />
                        {errors.password && <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>Password is required</span>}
                    </div>

                    <button type="submit" className="btn-primary" style={{
                        width: '100%',
                        padding: '1.2rem',
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        fontWeight: 700,
                        boxShadow: '0 10px 25px -5px rgba(74, 0, 224, 0.4)'
                    }}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
