import React, { useState, useEffect } from 'react';

const getAvatarUrl = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0b0c10&color=00f2fe&size=128&bold=true`;

const PlayerAvatar = ({ name, size = '80px', width, height, borderStyle = '2px solid var(--primary-neon)' }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!name) return;
        
        let isMounted = true;
        const fetchImage = async () => {
            try {
                const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/ /g, '_'))}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        if (data.thumbnail && data.thumbnail.source) {
                            setImageUrl(data.thumbnail.source);
                        } else if (data.originalimage && data.originalimage.source) {
                            setImageUrl(data.originalimage.source);
                        } else {
                            setError(true);
                        }
                    }
                } else {
                    if (isMounted) setError(true);
                }
            } catch (err) {
                if (isMounted) setError(true);
            }
        };

        setImageUrl(null);
        setError(false);
        fetchImage();
        
        return () => { isMounted = false; };
    }, [name]);

    const finalImage = imageUrl && !error ? imageUrl : getAvatarUrl(name || 'Unknown');

    return (
        <img 
            src={finalImage} 
            alt={name} 
            style={{ 
                borderRadius: '12px', 
                border: borderStyle, 
                width: width || size, 
                height: height || size, 
                marginBottom: '1rem', 
                background: '#000',
                objectFit: 'cover',
                objectPosition: 'top' // Helps keep face in view for portraits
            }}
            onError={() => setError(true)}
        />
    );
};

export default PlayerAvatar;
