import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import PlayerAvatar from '../components/PlayerAvatar';
import { getCountryEmoji } from '../utils/countryEmoji';

const loadingPhrases = [
    "Analyzing Form...",
    "Consulting VAR...",
    "Calculating Tactical Odds...",
    "Preparing the Pitch..."
];

const MatchArena = () => {
    const { firebaseUser, dbUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [phase, setPhase] = useState('LOADING');
    const [matchResult, setMatchResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [loadingText, setLoadingText] = useState(loadingPhrases[0]);

    useEffect(() => {
        if (!location.state || !location.state.player || !location.state.chosenAttribute) {
            navigate('/dashboard');
            return;
        }

        const { player, chosenAttribute } = location.state;

        let phraseIndex = 0;
        const phraseInterval = setInterval(() => {
            phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
            setLoadingText(loadingPhrases[phraseIndex]);
        }, 800);

        const executeMatch = async () => {
            try {
                const token = await firebaseUser.getIdToken();
                
                const playerPayload = {
                    id: player.id,
                    name: player.name,
                    nation: player.nation,
                    position: player.position,
                    [chosenAttribute]: player.attributes[chosenAttribute]
                };

                const response = await fetch('http://localhost:8000/api/match/play', {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userPlayer: playerPayload,
                        chosenAttribute
                    })
                });

                clearInterval(phraseInterval);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const msg = errorData.error || errorData.message || 'Match failed';
                    setErrorMsg(msg.includes('exhausted') || msg.includes('PLAYER_EXHAUSTED') ? 'This player is resting — 24-hour cooldown active!' : msg);
                    setPhase('ERROR');
                    return;
                }

                const data = await response.json();
                if (data.type === 'result') {
                    const matchData = data.payload;
                    setMatchResult(matchData);
                    if (dbUser) {
                        dbUser.current_xp = matchData.newTotalXp;
                    }
                    setPhase('RESULT');
                } else {
                    setErrorMsg("Invalid server response format.");
                    setPhase('ERROR');
                }

            } catch (err) {
                clearInterval(phraseInterval);
                setErrorMsg("A server error occurred during the match.");
                setPhase('ERROR');
            }
        };

        executeMatch();

        return () => clearInterval(phraseInterval);
    }, [location.state, navigate, firebaseUser, dbUser]);

    if (phase === 'LOADING') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '100vh' }}>
                <AiOutlineLoading3Quarters size={64} color="var(--primary-neon)" className="spin" style={{ marginBottom: '2rem' }} />
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-neon)', letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center' }}>
                    {loadingText}
                </h2>
            </div>
        );
    }

    if (phase === 'ERROR') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '100vh', padding: '2rem' }}>
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', border: '1px solid var(--error)' }}>
                    <h2 style={{ color: 'var(--error)', marginBottom: '1rem' }}>Match Forfeited</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{errorMsg}</p>
                    <button className="btn-outline" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
                </div>
            </div>
        );
    }

    const isWin = matchResult.outcome === 'WIN';
    const isLoss = matchResult.outcome === 'LOSS';
    const themeColor = isWin ? '#00f2fe' : isLoss ? '#ff4757' : '#ffa502';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '100vh', padding: '2rem' }}>
            <style>
                {`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                `}
            </style>
            <div className="glass-panel" style={{ 
                width: '100%', 
                maxWidth: '800px', 
                padding: '3rem', 
                textAlign: 'center', 
                border: `2px solid ${themeColor}`, 
                boxShadow: `0 0 40px ${themeColor}60, inset 0 0 20px ${themeColor}20`,
                animation: 'slideInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' 
            }}>
                
                <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem', color: themeColor, textTransform: 'uppercase', letterSpacing: '4px' }}>
                    {matchResult.outcome}
                </h1>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', gap: '2rem' }}>
                    
                    {/* USER PLAYER CARD */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '1.5rem', border: `2px solid ${isWin ? themeColor : 'transparent'}` }}>
                        <PlayerAvatar 
                            name={matchResult.userPlayer.name} 
                            width="140px"
                            height="180px" 
                            borderStyle={`4px solid ${isWin ? themeColor : 'var(--glass-border)'}`}
                        />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{matchResult.userPlayer.name}</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            {matchResult.userPlayer.position} • {matchResult.userPlayer.nation} {getCountryEmoji(matchResult.userPlayer.nation)}
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', width: '100%', textAlign: 'left' }}>
                            {Object.entries(location.state.player.attributes || {}).map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{key}</span>
                                    <span style={{ color: key === location.state.chosenAttribute ? 'var(--primary-neon)' : '#fff', fontWeight: 700 }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ fontSize: '2.5rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 700, alignSelf: 'center' }}>VS</div>

                    {/* AI PLAYER CARD */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '1.5rem', border: `2px solid ${isLoss ? themeColor : 'transparent'}` }}>
                        <PlayerAvatar 
                            name={matchResult.aiPlayer.name} 
                            width="140px"
                            height="180px"
                            borderStyle={`4px solid ${isLoss ? themeColor : 'var(--glass-border)'}`}
                        />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{matchResult.aiPlayer.name}</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            {matchResult.aiPlayer.position ?? 'GK'} • {matchResult.aiPlayer.nation} {getCountryEmoji(matchResult.aiPlayer.nation)}
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', width: '100%', textAlign: 'left' }}>
                            {Object.entries(matchResult.aiPlayer.attributes || {}).map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{key}</span>
                                    <span style={{ color: key === matchResult.counterAttr ? 'var(--error)' : '#fff', fontWeight: 700 }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '16px', marginBottom: '3rem' }}>
                    <p style={{ fontSize: '1.4rem', lineHeight: '1.6', fontStyle: 'italic', color: 'var(--text-main)' }}>
                        "{matchResult.commentary}"
                    </p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '16px', minWidth: '150px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>XP CHANGE</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: matchResult.xpChange >= 0 ? '#00f2fe' : '#ff4757' }}>
                            {matchResult.xpChange > 0 ? '+' : ''}{matchResult.xpChange}
                        </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '16px', minWidth: '150px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>STREAK</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f8f9fa' }}>{matchResult.currentStreak}</div>
                    </div>
                </div>

                <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '1.25rem 3rem', fontSize: '1.2rem', width: 'auto' }}>
                    Return to Lobby
                </button>
            </div>
        </div>
    );
};

export default MatchArena;
