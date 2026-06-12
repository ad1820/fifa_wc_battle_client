import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiSearch, FiGlobe, FiList } from 'react-icons/fi';
import { FaTrophy, FaGamepad } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import PlayerAvatar from '../components/PlayerAvatar';
import { getCountryEmoji } from '../utils/countryEmoji';

const Dashboard = () => {
    const { dbUser, logout, firebaseUser } = useAuth();
    const navigate = useNavigate();
    
    // Player Data State
    const [allPlayers, setAllPlayers] = useState([]);
    const [exhaustedIds, setExhaustedIds] = useState([]);
    const [loadingPlayers, setLoadingPlayers] = useState(true);
    
    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    
    // Match State
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [currentXp, setCurrentXp] = useState(dbUser?.current_xp || 0);

    useEffect(() => {
        if (dbUser) setCurrentXp(dbUser.current_xp);
    }, [dbUser]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await firebaseUser.getIdToken();
                
                const [playersRes, cooldownsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/players`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/cooldowns`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const playersData = await playersRes.json();
                const cooldownsData = await cooldownsRes.json();
                
                setAllPlayers(playersData);
                setExhaustedIds(cooldownsData || []);
                setLoadingPlayers(false);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setLoadingPlayers(false);
            }
        };

        if (firebaseUser) fetchData();
    }, [firebaseUser]);

    const uniqueCountries = [...new Set(allPlayers.map(p => p.nation))].sort();

    const filteredPlayers = allPlayers.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCountry = selectedCountry ? p.nation === selectedCountry : true;
        return matchesSearch && matchesCountry;
    }).slice(0, 100);

    const handlePlayMatch = () => {
        if (!selectedPlayer) return;
        
        const availableAttributes = Object.keys(selectedPlayer.attributes);
        if (availableAttributes.length === 0) {
            alert("This player has no valid attributes to play.");
            return;
        }

        const randomAttribute = availableAttributes[Math.floor(Math.random() * availableAttributes.length)];

        navigate('/match', { 
            state: { 
                player: selectedPlayer, 
                chosenAttribute: randomAttribute 
            } 
        });
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Welcome, {dbUser?.name?.split(' ')[0] || 'Player'}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-neon)', fontWeight: 600, marginTop: '0.5rem' }}>
                        <FaTrophy /> 
                        <span>XP: {currentXp}</span>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/leaderboard')} className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.5rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <FiList size={18} />
                        Leaderboard
                    </button>
                    <button onClick={logout} className="btn-outline" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                        <FiLogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            <div style={{ background: 'linear-gradient(90deg, rgba(0,242,254,0.1) 0%, rgba(0,0,0,0) 100%)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', borderLeft: '4px solid var(--primary-neon)', color: 'var(--text-main)' }}>
                <span style={{ marginRight: '10px' }}>📊</span>
                Player attributes powered by <strong style={{ color: 'var(--primary-neon)' }}>SofaScore</strong> based on performances from the <strong>last 2 years</strong>.
            </div>

            {loadingPlayers ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <AiOutlineLoading3Quarters size={48} color="var(--primary-neon)" className="spin" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
                    
                    {/* Left Column: Player Search & Selection */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Select Your Player</h2>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                <div style={{ position: 'relative' }}>
                                    <FiSearch size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        className="glass-input" 
                                        placeholder="Search by name..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                                    />
                                </div>
                            </div>
                            
                            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                                <div style={{ position: 'relative' }}>
                                    <FiGlobe size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <select 
                                        className="glass-input" 
                                        value={selectedCountry}
                                        onChange={(e) => setSelectedCountry(e.target.value)}
                                        style={{ width: '100%', paddingLeft: '2.5rem', appearance: 'none', background: 'rgba(0, 0, 0, 0.4)' }}
                                    >
                                        <option value="">All Countries</option>
                                        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                            {filteredPlayers.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No players found.</div>
                            ) : (
                                filteredPlayers.map(p => {
                                    const isResting = exhaustedIds.includes(p.id);
                                    return (
                                        <div 
                                            key={p.id} 
                                            onClick={() => { if (!isResting) setSelectedPlayer(p); }}
                                            style={{ 
                                                position: 'relative',
                                                padding: '1rem', 
                                                borderBottom: '1px solid var(--glass-border)',
                                                cursor: isResting ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                background: !isResting && selectedPlayer?.id === p.id ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                                                transition: 'background 0.2s ease',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Cross-out overlay for resting players */}
                                            {isResting && (
                                                <div style={{
                                                    position: 'absolute', inset: 0, zIndex: 2,
                                                    background: 'rgba(0,0,0,0.55)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '0 1rem'
                                                }}>
                                                    {/* Diagonal strike lines */}
                                                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="#ff4757" strokeWidth="1" strokeOpacity="0.4" />
                                                        <line x1="100%" y1="0" x2="0" y2="100%" stroke="#ff4757" strokeWidth="1" strokeOpacity="0.4" />
                                                    </svg>
                                                    <span style={{ color: '#ff6b7a', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px', position: 'relative', zIndex: 3 }}>
                                                        💤 Tired — resting for 24h
                                                    </span>
                                                </div>
                                            )}

                                            <div style={{ opacity: isResting ? 0.35 : 1 }}>
                                                <div style={{ fontWeight: 600 }}>{p.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.nation} {getCountryEmoji(p.nation)} • {p.position}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Column: Active Card & Match Play */}
                    <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', textAlign: 'center' }}>Match Lobby</h2>
                        
                        {!selectedPlayer ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <FaGamepad size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>Select a fresh player from the roster to prepare for battle.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid var(--primary-neon)' }}>
                                    <PlayerAvatar 
                                        name={selectedPlayer.name} 
                                        width="160px"
                                        height="220px" 
                                        borderStyle="2px solid var(--primary-neon)"
                                    />
                                    <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-neon)', textAlign: 'center' }}>{selectedPlayer.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {selectedPlayer.position} • {selectedPlayer.nation} {getCountryEmoji(selectedPlayer.nation)}
                                    </p>
                                </div>

                                <button 
                                    className="btn-primary" 
                                    onClick={handlePlayMatch} 
                                    style={{ padding: '1.25rem', fontSize: '1.2rem', marginTop: '1rem' }}
                                >
                                    PLAY MATCH
                                </button>
                                
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    Your player's skill attribute will be randomly selected upon entering the arena.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
