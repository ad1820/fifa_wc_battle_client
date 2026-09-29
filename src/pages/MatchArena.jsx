import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FiArrowLeft, FiZap } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import PlayerAvatar from '../components/PlayerAvatar';
import { getCountryEmoji } from '../utils/countryEmoji';

const loadingPhrases = ['Walking out of the tunnel', 'The crowd is ready', 'Kick-off'];

const PlayerCard = ({ player, attributes, highlighted, label, winner = false }) => <article className={`duel-card ${winner ? 'duel-card--winner' : ''}`}>
    <div className="player-photo-wrap">{winner && <span className="winner-chip">Winner</span>}<PlayerAvatar name={player.name} width="150px" height="185px" borderStyle="none" /></div>
    <div className="player-meta"><span>{label}</span><h3>{player.name}</h3><p>{player.position ?? 'GK'} · {player.nation} {getCountryEmoji(player.nation)}</p></div>
    <div className="attribute-row">{Object.entries(attributes || {}).map(([key, value]) => <div className={key === highlighted ? 'attribute active' : 'attribute'} key={key}><span>{key}</span><strong>{value}</strong></div>)}</div>
</article>;

const MatchArena = () => {
    const { firebaseUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [phase, setPhase] = useState('LOADING');
    const [matchResult, setMatchResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [loadingText, setLoadingText] = useState(loadingPhrases[0]);

    useEffect(() => {
        if (!location.state?.player || !location.state?.chosenAttribute) { navigate('/dashboard'); return undefined; }
        const { player, chosenAttribute } = location.state;
        let phraseIndex = 0;
        const phraseInterval = setInterval(() => { phraseIndex = (phraseIndex + 1) % loadingPhrases.length; setLoadingText(loadingPhrases[phraseIndex]); }, 700);

        const executeMatch = async () => {
            try {
                const token = await firebaseUser.getIdToken();
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/match/play`, {
                    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userPlayer: { id: player.id, name: player.name, nation: player.nation, position: player.position, [chosenAttribute]: player.attributes[chosenAttribute] }, chosenAttribute }),
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.error || data.message || 'Match failed');
                if (data.type !== 'result') throw new Error('Invalid server response.');
                setMatchResult(data.payload);
                setPhase('RESULT');
            } catch (error) {
                const message = error.message.includes('exhausted') || error.message.includes('PLAYER_EXHAUSTED') ? 'This player is resting — the 24-hour cooldown is still active.' : error.message;
                setErrorMsg(message); setPhase('ERROR');
            } finally { clearInterval(phraseInterval); }
        };
        executeMatch();
        return () => clearInterval(phraseInterval);
    }, [location.state, navigate, firebaseUser]);

    if (phase === 'LOADING') return <main className="arena-state"><div className="loading-ball"><AiOutlineLoading3Quarters className="spin" /></div><span className="eyebrow">MATCHDAY</span><h2>{loadingText}<span className="loading-dots">...</span></h2></main>;
    if (phase === 'ERROR') return <main className="arena-state"><section className="result-shell error-card"><span className="eyebrow">FULL TIME</span><h1>Match forfeited</h1><p>{errorMsg}</p><button className="btn-outline compact-button" onClick={() => navigate('/dashboard')}><FiArrowLeft /> Back to lobby</button></section></main>;

    const isWin = matchResult.outcome === 'WIN';
    const isLoss = matchResult.outcome === 'LOSS';
    const outcomeLabel = isWin ? 'Victory' : isLoss ? 'Defeat' : 'Draw';
    const chosenAttribute = location.state.chosenAttribute;

    return <main className={`match-arena outcome-${matchResult.outcome.toLowerCase()}`}>
        <div className="stadium-glow" />
        <section className="result-shell">
            <header className="result-header"><span className="eyebrow">FULL TIME · HEAD TO HEAD</span><h1>{outcomeLabel}</h1><p>{isWin ? 'The moment belonged to you.' : isLoss ? 'A tough one under the lights.' : 'Nothing could separate them.'}</p></header>
            <div className="duel-grid"><PlayerCard player={matchResult.userPlayer} attributes={location.state.player.attributes} highlighted={chosenAttribute} label="YOUR PICK" winner={isWin} /><div className="versus-mark"><span>VS</span></div><PlayerCard player={matchResult.aiPlayer} attributes={matchResult.aiPlayer.attributes} highlighted={matchResult.counterAttr} label="OPPONENT" winner={isLoss} /></div>
            <div className="commentary-strip"><div className="live-pulse" /><div><span>THE CALL</span><p>{matchResult.commentary}</p></div></div>
            <footer className="result-footer"><div className="result-stats"><div><span>XP</span><strong className={matchResult.xpChange >= 0 ? 'positive' : 'negative'}>{matchResult.xpChange > 0 ? '+' : ''}{matchResult.xpChange}</strong></div><div><span>STREAK</span><strong><FiZap /> {matchResult.currentStreak}</strong></div></div><button className="btn-primary lobby-button" onClick={() => navigate('/dashboard')}>Back to lobby <FiArrowLeft /></button></footer>
        </section>
    </main>;
};

export default MatchArena;
