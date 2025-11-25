import React from 'react';
import { Icon } from '../ui';

export const PlaceholderView: React.FC<{ title: string, icon: string }> = ({ title, icon }) => {
    const { t } = useTranslation();
    return (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Icon path={icon} size={64} className="mb-4 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p>{t('content_coming_soon')}</p>
        </div>
    );
};
