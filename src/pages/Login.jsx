import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaGamepad, FaGoogle } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { loginWithGoogle, dbUser, firebaseUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (dbUser && firebaseUser) {
            navigate('/dashboard');
        }
    }, [dbUser, firebaseUser, navigate]);

    const handleGoogleAuth = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '100vh' }}>
                <AiOutlineLoading3Quarters size={48} color="var(--primary-neon)" className="spin" />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', marginBottom: '1rem' }}>
                        <FaGamepad size={32} color="var(--primary-neon)" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>FIFA WC Battle</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Sign in with Google to enter the pitch
                    </p>
                </div>

                {error && <p className="error-text" style={{ marginBottom: '1rem' }}>{error}</p>}

                <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={handleGoogleAuth} 
                    disabled={loading}
                    style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem' }}
                >
                    {loading ? <AiOutlineLoading3Quarters size={20} className="spin" /> : <FaGoogle size={20} />}
                    {loading ? 'Authenticating...' : 'Continue with Google'}
                </button>
            </div>
        </div>
    );
};

export default Login;
