import React from 'react';
import { useAuth } from '../contexts';
import { useTranslation } from '../i18n';
import { Icon, Icons, Card, Button, Input, Toast } from './ui';

export const VerificationScreen: React.FC = () => {
    const { t } = useTranslation();
    const {
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
    } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <Card className="w-full max-w-sm p-8 text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon path={Icons.phone} className="text-indigo-600" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('verify_account')}</h1>
                <p className="text-slate-500 mb-8">{t('verification_description')}</p>

                {!showVerificationInput ? (
                    <div className="space-y-4">
                        <Input
                            type="tel"
                            placeholder={t('phone_placeholder')}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <Button fullWidth onClick={handleSendCode}>
                            {t('send_code')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500">
                            {t('enter_code_prompt')} <span className="font-semibold text-slate-900 dark:text-white">{phoneNumber}</span>
                        </p>
                        <Input
                            type="text"
                            placeholder="123456"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="text-center tracking-widest text-xl font-mono"
                        />
                        <Button fullWidth onClick={handleVerify}>{t('verify')}</Button>
                        <Button variant="ghost" fullWidth onClick={() => setShowVerificationInput(false)}>
                            {t('change_number')}
                        </Button>
                    </div>
                )}
            </Card>

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

