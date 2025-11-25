import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        if (data.password !== data.password_confirmation) {
            alert("Passwords do not match");
            return;
        }
        try {
            await registerUser(data.name, data.email, data.password, data.password_confirmation);
            navigate('/dashboard');
        } catch (error) {
            alert('Registration failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Name</label>
                    <input
                        type="text"
                        {...register("name", { required: true })}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    {errors.name && <span>This field is required</span>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Email</label>
                    <input
                        type="email"
                        {...register("email", { required: true })}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    {errors.email && <span>This field is required</span>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Password</label>
                    <input
                        type="password"
                        {...register("password", { required: true })}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                    {errors.password && <span>This field is required</span>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        {...register("password_confirmation", { required: true })}
                        style={{ width: '100%', padding: '0.5rem' }}
                    />
                </div>
                <button type="submit" style={{ padding: '0.5rem 1rem' }}>Signup</button>
            </form>
        </div>
    );
};

export default Signup;
