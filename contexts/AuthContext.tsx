import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase';
import { useTranslation } from '../i18n';

interface AuthContextType {
    isVerified: boolean;
    phoneNumber: string;
    setPhoneNumber: (phone: string) => void;
    verificationCode: string;
    setVerificationCode: (code: string) => void;
    showVerificationInput: boolean;
    setShowVerificationInput: (show: boolean) => void;
    handleSendCode: () => Promise<void>;
    handleVerify: () => Promise<void>;
    toast: { message: string; type: 'success' | 'error' | 'info' } | null;
    setToast: (toast: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const [isVerified, setIsVerified] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Check verification on mount
    useEffect(() => {
        const verified = localStorage.getItem('isVerified') === 'true';
        if (verified) setIsVerified(true);
    }, []);

    const handleSendCode = async () => {
        if (phoneNumber.length < 8) {
            setToast({ message: t('error_phone_invalid'), type: 'error' });
            return;
        }

        try {
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+389${phoneNumber}`;
            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone
            });

            if (error) {
                setToast({ message: `Error: ${error.message}`, type: 'error' });
                console.error('Send OTP error:', error);
            } else {
                setShowVerificationInput(true);
                setToast({ message: t('code_sent'), type: 'success' });
            }
        } catch (err) {
            setToast({ message: `Error sending code: ${err}`, type: 'error' });
            console.error('Send OTP error:', err);
        }
    };

    const handleVerify = async () => {
        try {
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+389${phoneNumber}`;
            const { error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: verificationCode,
                type: 'sms'
            });

            if (error) {
                setToast({ message: t('error_code_mismatch'), type: 'error' });
                console.error('Verification error:', error);
            } else {
                localStorage.setItem('isVerified', 'true');
                setIsVerified(true);
            }
        } catch (err) {
            setToast({ message: t('error_code_mismatch'), type: 'error' });
            console.error('Verification error:', err);
        }
    };

    return (
        <AuthContext.Provider value={{
            isVerified,
            phoneNumber,
            setPhoneNumber,
            verificationCode,
            setVerificationCode,
            showVerificationInput,
            setShowVerificationInput,
            handleSendCode,
            handleVerify,
            toast,
            setToast
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

