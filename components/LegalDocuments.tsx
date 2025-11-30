import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import { Icon, Icons, Card, Button } from './ui';

type DocumentType = 'privacy' | 'terms';

interface LegalDocumentsProps {
    isOpen: boolean;
    onClose: () => void;
    initialDocument?: DocumentType;
}

// Privacy Policy Content
const PrivacyPolicyContent: React.FC = () => {
    const { language } = useTranslation();
    
    if (language === 'mk') {
        return (
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <p className="text-xs text-slate-400">Последно ажурирање: 23 ноември 2025</p>
                
                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Вовед</h3>
                    <p>Е-Кичево е посветена на заштитата на вашата приватност. Оваа политика објаснува како ги собираме, користиме и штитиме вашите информации.</p>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Информации што ги собираме</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Телефонски број:</strong> За автентикација и верификација</li>
                        <li><strong>Локациски податоци:</strong> GPS координати при поднесување пријави</li>
                        <li><strong>Фотографии:</strong> Слики што ги прикачувате при создавање пријави</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Како ги користиме информациите</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Автентикација и верификација на корисници</li>
                        <li>Обработка и следење на општински пријави</li>
                        <li>Подобрување на функционалноста на апликацијата</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Споделување на податоци</h3>
                    <p>НЕ продаваме или споделуваме ваши лични информации со трети страни, освен со општински власти за обработка на пријави или кога тоа е законски потребно.</p>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Контакт</h3>
                    <p>За прашања: support@ekicevo.com</p>
                </section>
            </div>
        );
    }
    
    if (language === 'sq') {
        return (
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <p className="text-xs text-slate-400">Përditësimi i fundit: 23 nëntor 2025</p>
                
                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Hyrje</h3>
                    <p>E-Kërçova është e përkushtuar për mbrojtjen e privatësisë suaj. Kjo politikë shpjegon se si mbledhim, përdorim dhe mbrojmë informacionet tuaja.</p>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Informacionet që mbledhim</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Numri i telefonit:</strong> Për autentikim dhe verifikim</li>
                        <li><strong>Të dhënat e vendndodhjes:</strong> Koordinatat GPS kur dërgoni raporte</li>
                        <li><strong>Fotografitë:</strong> Imazhet që ngarkoni kur krijoni raporte</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Si i përdorim informacionet</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Autentikimi dhe verifikimi i përdoruesve</li>
                        <li>Përpunimi dhe ndjekja e raporteve komunale</li>
                        <li>Përmirësimi i funksionalitetit të aplikacionit</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Ndarja e të dhënave</h3>
                    <p>NUK shesim ose ndajmë informacionet tuaja personale me palë të treta, përveç autoriteteve komunale për përpunimin e raporteve ose kur kërkohet ligjërisht.</p>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Kontakti</h3>
                    <p>Për pyetje: support@ekicevo.com</p>
                </section>
            </div>
        );
    }
    
    // English (default)
    return (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p className="text-xs text-slate-400">Last Updated: November 23, 2025</p>
            
            <section>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Introduction</h3>
                <p>E-Kicevo is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.</p>
            </section>

            <section>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Phone Number:</strong> For authentication and verification</li>
                    <li><strong>Location Data:</strong> GPS coordinates when submitting reports</li>
                    <li><strong>Photos:</strong> Images you upload when creating reports</li>
                </ul>
            </section>

            <section>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How We Use Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Authenticate and verify user accounts</li>
                    <li>Process and track municipal problem reports</li>
                    <li>Improve app functionality and user experience</li>
                </ul>
            </section>

            <section>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Data Sharing</h3>
                <p>We DO NOT sell or share your personal information with third parties except with municipal authorities to process your reports or when required by law.</p>
            </section>

            <section>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Contact</h3>
                <p>For questions: support@ekicevo.com</p>
            </section>
        </div>
    );
};

// Terms of Service Content
const TermsOfServiceContent: React.FC = () => {
    const { language } = useTranslation();
    
    if (language === 'mk') {
        return (
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <p className="text-xs text-slate-400">Последно ажурирање: 23 ноември 2025</p>
                
                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Прифаќање на услови</h3>
                    <p>Со пристап и користење на апликацијата Е-Кичево, ги прифаќате овие Услови за користење.</p>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Опис на услугата</h3>
                    <p>Е-Кичево е апликација за пријавување општински проблеми која овозможува:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Пријавување инфраструктурни проблеми</li>
                        <li>Следење на статус на пријави</li>
                        <li>Пристап до општински вести и настани</li>
                        <li>Плаќање за паркинг услуги</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Однесување на корисникот</h3>
                    <p>Се согласувате да НЕ:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Поднесувате лажни или измамнички пријави</li>
                        <li>Качувате несоодветна или нелегална содржина</li>
                        <li>Ја користите апликацијата за вознемирување</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Паркинг плаќања</h3>
                    <p>Паркинг таксите се одредени од Општина Кичево. Плаќањата се неповратни откако ќе се обработат.</p>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Контакт</h3>
                    <p>За прашања: support@ekicevo.com</p>
                </section>
            </div>
        );
    }
    
    if (language === 'sq') {
        return (
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <p className="text-xs text-slate-400">Përditësimi i fundit: 23 nëntor 2025</p>
                
                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Pranimi i kushteve</h3>
                    <p>Duke hyrë dhe përdorur aplikacionin E-Kërçova, pranoni këto Kushte Shërbimi.</p>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Përshkrimi i shërbimit</h3>
                    <p>E-Kërçova është një aplikacion për raportimin e problemeve komunale që mundëson:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Raportimin e çështjeve të infrastrukturës</li>
                        <li>Ndjekjen e statusit të raporteve</li>
                        <li>Qasje në lajmet dhe ngjarjet komunale</li>
                        <li>Pagimin për shërbimet e parkimit</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Sjellja e përdoruesit</h3>
                    <p>Pranoni të MOS:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Dërgoni raporte të rreme ose mashtruese</li>
                        <li>Ngarkoni përmbajtje të papërshtatshme ose të paligjshme</li>
                        <li>Përdorni aplikacionin për ngacmim</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Pagesat e parkimit</h3>
                    <p>Tarifat e parkimit përcaktohen nga Komuna e Kërçovës. Pagesat janë të pakthyeshme pasi të përpunohen.</p>
                </section>

                <section>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Kontakti</h3>
                    <p>Për pyetje: support@ekicevo.com</p>
                </section>
            </div>
        );
    }
    
    // English (default)
    return (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p className="text-xs text-slate-400">Last Updated: November 23, 2025</p>
            
            <section>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Acceptance of Terms</h3>
                <p>By accessing and using the E-Kicevo app, you accept these Terms of Service.</p>
            </section>

            <section>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Description of Service</h3>
                <p>E-Kicevo is a municipal problem reporting app that allows:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Reporting infrastructure issues</li>
                    <li>Tracking report status</li>
                    <li>Accessing municipal news and events</li>
                    <li>Paying for parking services</li>
                </ul>
            </section>

            <section>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">User Conduct</h3>
                <p>You agree NOT to:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Submit false or misleading reports</li>
                    <li>Upload inappropriate or illegal content</li>
                    <li>Use the app to harass or spam</li>
                </ul>
            </section>

            <section>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Parking Payments</h3>
                <p>Parking fees are set by the Municipality of Kicevo. Payments are non-refundable once processed.</p>
            </section>

            <section>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Contact</h3>
                <p>For questions: support@ekicevo.com</p>
            </section>
        </div>
    );
};

// Main Legal Documents Modal
export const LegalDocumentsModal: React.FC<LegalDocumentsProps> = ({ isOpen, onClose, initialDocument = 'privacy' }) => {
    const { t } = useTranslation();
    const [activeDocument, setActiveDocument] = useState<DocumentType>(initialDocument);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('legal')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <Icon path={Icons.x} size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveDocument('privacy')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${
                            activeDocument === 'privacy'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {t('privacy_policy')}
                    </button>
                    <button
                        onClick={() => setActiveDocument('terms')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${
                            activeDocument === 'terms'
                                ? 'text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        {t('terms_of_service')}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeDocument === 'privacy' ? <PrivacyPolicyContent /> : <TermsOfServiceContent />}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <Button fullWidth onClick={onClose}>
                        {t('cancel')}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

// Inline Legal Links for Verification Screen
export const LegalConsentText: React.FC<{ onPrivacyClick: () => void; onTermsClick: () => void }> = ({
    onPrivacyClick,
    onTermsClick,
}) => {
    const { t } = useTranslation();

    return (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {t('legal_consent')}{' '}
            <button
                type="button"
                onClick={onPrivacyClick}
                className="text-indigo-600 hover:underline font-medium"
            >
                {t('privacy_policy')}
            </button>{' '}
            {t('and')}{' '}
            <button
                type="button"
                onClick={onTermsClick}
                className="text-indigo-600 hover:underline font-medium"
            >
                {t('terms_of_service')}
            </button>
        </p>
    );
};

