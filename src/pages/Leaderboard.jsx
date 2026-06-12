import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FaTrophy, FaArrowLeft, FaMedal } from 'react-icons/fa';

const Leaderboard = () => {
    const { firebaseUser } = useAuth();
    const navigate = useNavigate();
    
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = await firebaseUser.getIdToken();
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/leaderboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setLeaderboard(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
                setLoading(false);
            }
        };

        if (firebaseUser) fetchLeaderboard();
    }, [firebaseUser]);

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={() => navigate('/dashboard')} className="btn-outline" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaArrowLeft /> Lobby
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-neon)' }}>
                    <FaTrophy size={28} />
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Global Rankings</h1>
                </div>
                <div style={{ width: '80px' }}></div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', flex: 1 }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                        <AiOutlineLoading3Quarters size={48} color="var(--primary-neon)" className="spin" />
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <p>No players on the leaderboard yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {leaderboard.map((player) => (
                            <div 
                                key={player.userId}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1.25rem',
                                    background: player.rank === 1 ? 'rgba(255, 215, 0, 0.15)' : player.rank === 2 ? 'rgba(192, 192, 192, 0.1)' : player.rank === 3 ? 'rgba(205, 127, 50, 0.1)' : 'rgba(0,0,0,0.2)',
                                    border: `1px solid ${player.rank === 1 ? '#ffd700' : player.rank === 2 ? '#c0c0c0' : player.rank === 3 ? '#cd7f32' : 'var(--glass-border)'}`,
                                    borderRadius: '12px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ width: '40px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700, color: player.rank <= 3 ? '#fff' : 'var(--text-muted)' }}>
                                        {player.rank === 1 ? <FaMedal color="#ffd700" size={24} /> : player.rank === 2 ? <FaMedal color="#c0c0c0" size={24} /> : player.rank === 3 ? <FaMedal color="#cd7f32" size={24} /> : `#${player.rank}`}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <img 
                                            src={player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff&size=64`}
                                            alt={player.name}
                                            style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }}
                                        />
                                        <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{player.name}</span>
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-neon)' }}>
                                    {player.score} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>XP</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
