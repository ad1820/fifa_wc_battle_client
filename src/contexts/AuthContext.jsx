import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [dbUser, setDbUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // After Firebase logs the user in, we must pass the token to our custom backend 
    // to sync the MongoDB user profile.
    const syncWithBackend = async (user) => {
        try {
            const token = await user.getIdToken();
            const res = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setDbUser(data.user);
            } else {
                console.error("Backend auth failed:", data.message);
            }
        } catch (error) {
            console.error("Error syncing with backend:", error);
        }
    };

    const loginWithGoogle = async () => {
        return await signInWithPopup(auth, googleProvider);
    };

    const loginWithEmail = async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    };

    const registerWithEmail = async (email, password) => {
        return await createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        setDbUser(null);
        return await signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            if (user) {
                await syncWithBackend(user);
            } else {
                setDbUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        firebaseUser,
        dbUser,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
